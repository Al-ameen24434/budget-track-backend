import { Category, ICategory } from '../models/category.model';
import { Transaction } from '../models/transaction.model';
import { Types } from 'mongoose';
import { logger } from '../utils/logger';

export class CategoryService {
  static async getCategories(
    userId: Types.ObjectId,
    type?: 'income' | 'expense' | 'both'
  ) {
    try {
      const query: any = { userId };
      if (type) {
        query.type = type === 'both' ? { $in: ['income', 'expense', 'both'] } : type;
      }

      const categories = await Category.find(query).sort({ name: 1 });

      return categories;
    } catch (error) {
      logger.error(`Get categories error: ${error}`);
      throw error;
    }
  }

  static async getCategoryById(categoryId: string, userId: Types.ObjectId) {
    try {
      const category = await Category.findOne({
        _id: categoryId,
        userId,
      });

      if (!category) {
        throw new Error('Category not found');
      }

      return category;
    } catch (error) {
      logger.error(`Get category error: ${error}`);
      throw error;
    }
  }

  static async createCategory(
    categoryData: Partial<ICategory>,
    userId: Types.ObjectId
  ) {
    try {
      // Check if category with same name already exists
      const existingCategory = await Category.findOne({
        name: categoryData.name,
        userId,
      });

      if (existingCategory) {
        throw new Error('Category with this name already exists');
      }

      const category = await Category.create({
        ...categoryData,
        userId,
      });

      logger.info(`Category created: ${category.name}`);

      return category;
    } catch (error) {
      logger.error(`Create category error: ${error}`);
      throw error;
    }
  }

  static async updateCategory(
    categoryId: string,
    updateData: Partial<ICategory>,
    userId: Types.ObjectId
  ) {
    try {
      // Check if category exists
      const existingCategory = await Category.findOne({
        _id: categoryId,
        userId,
      });

      if (!existingCategory) {
        throw new Error('Category not found');
      }

      // If changing name, check if new name already exists
      if (updateData.name && updateData.name !== existingCategory.name) {
        const duplicateCategory = await Category.findOne({
          name: updateData.name,
          userId,
          _id: { $ne: categoryId },
        });

        if (duplicateCategory) {
          throw new Error('Category with this name already exists');
        }
      }

      const category = await Category.findByIdAndUpdate(
        categoryId,
        updateData,
        {
          new: true,
          runValidators: true,
        }
      );

      logger.info(`Category updated: ${categoryId}`);

      return category;
    } catch (error) {
      logger.error(`Update category error: ${error}`);
      throw error;
    }
  }

  static async deleteCategory(categoryId: string, userId: Types.ObjectId) {
    try {
      const category = await Category.findOne({
        _id: categoryId,
        userId,
      });

      if (!category) {
        throw new Error('Category not found');
      }

      // Check if category is being used in transactions
      const transactionCount = await Transaction.countDocuments({
        userId,
        category: category.name,
      });

      if (transactionCount > 0) {
        throw new Error(
          `Cannot delete category that is being used by ${transactionCount} transactions`
        );
      }

      if (category.isDefault) {
        throw new Error('Cannot delete default category');
      }

      await category.deleteOne();

      logger.info(`Category deleted: ${categoryId}`);

      return true;
    } catch (error) {
      logger.error(`Delete category error: ${error}`);
      throw error;
    }
  }

  static async initializeDefaultCategories(userId: Types.ObjectId) {
    try {
      // Check if user already has categories
      const existingCategories = await Category.countDocuments({ userId });

      if (existingCategories > 0) {
        throw new Error('User already has categories');
      }

      // Default categories
      const defaultCategories = [
        // Expense categories
        { name: 'Food & Dining', icon: '🍽️', color: '#ef4444', type: 'expense', isDefault: true },
        { name: 'Transportation', icon: '🚗', color: '#f97316', type: 'expense', isDefault: true },
        { name: 'Shopping', icon: '🛍️', color: '#eab308', type: 'expense', isDefault: true },
        { name: 'Entertainment', icon: '🎬', color: '#22c55e', type: 'expense', isDefault: true },
        { name: 'Bills & Utilities', icon: '⚡', color: '#3b82f6', type: 'expense', isDefault: true },
        { name: 'Healthcare', icon: '🏥', color: '#8b5cf6', type: 'expense', isDefault: true },
        { name: 'Education', icon: '📚', color: '#06b6d4', type: 'expense', isDefault: true },
        { name: 'Travel', icon: '✈️', color: '#f43f5e', type: 'expense', isDefault: true },
        
        // Income categories
        { name: 'Salary', icon: '💰', color: '#10b981', type: 'income', isDefault: true },
        { name: 'Freelance', icon: '💻', color: '#6366f1', type: 'income', isDefault: true },
        { name: 'Investments', icon: '📈', color: '#84cc16', type: 'income', isDefault: true },
        { name: 'Other', icon: '📦', color: '#6b7280', type: 'both', isDefault: true },
      ];

      // Create default categories for user
      const categories = defaultCategories.map((cat) => ({
        ...cat,
        userId,
      }));

      const createdCategories = await Category.insertMany(categories);

      logger.info(`Default categories created for user: ${userId}`);

      return createdCategories;
    } catch (error) {
      logger.error(`Initialize default categories error: ${error}`);
      throw error;
    }
  }

  static async getCategoryWithStats(
    categoryId: string,
    userId: Types.ObjectId,
    startDate?: Date,
    endDate?: Date
  ) {
    try {
      const category = await this.getCategoryById(categoryId, userId);

      // Get transaction stats for this category
      const matchQuery: any = {
        userId,
        category: category.name,
      };

      if (startDate || endDate) {
        matchQuery.date = {};
        if (startDate) matchQuery.date.$gte = startDate;
        if (endDate) matchQuery.date.$lte = endDate;
      }

      const stats = await Transaction.aggregate([
        { $match: matchQuery },
        {
          $group: {
            _id: '$type',
            totalAmount: { $sum: { $abs: '$amount' } },
            transactionCount: { $sum: 1 },
            averageAmount: { $avg: { $abs: '$amount' } },
          },
        },
      ]);

      const incomeStats = stats.find((s) => s._id === 'income') || {
        totalAmount: 0,
        transactionCount: 0,
        averageAmount: 0,
      };

      const expenseStats = stats.find((s) => s._id === 'expense') || {
        totalAmount: 0,
        transactionCount: 0,
        averageAmount: 0,
      };

      return {
        category,
        stats: {
          income: incomeStats,
          expense: expenseStats,
          totalTransactions: incomeStats.transactionCount + expenseStats.transactionCount,
        },
      };
    } catch (error) {
      logger.error(`Get category with stats error: ${error}`);
      throw error;
    }
  }
}