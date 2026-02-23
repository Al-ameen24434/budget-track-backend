import { Budget, IBudget } from '../models/budget.model';
import { Transaction } from '../models/transaction.model';
import { Types } from 'mongoose';
import { logger } from '../utils/logger';

export class BudgetService {
  static async getBudgets(
    userId: Types.ObjectId,
    page: number = 1,
    limit: number = 10
  ) {
    try {
      const skip = (page - 1) * limit;

      const [budgets, total] = await Promise.all([
        Budget.find({ userId })
          .sort({ month: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        Budget.countDocuments({ userId }),
      ]);

      return {
        budgets,
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      };
    } catch (error) {
      logger.error(`Get budgets error: ${error}`);
      throw error;
    }
  }

  static async getBudgetById(budgetId: string, userId: Types.ObjectId) {
    try {
      const budget = await Budget.findOne({
        _id: budgetId,
        userId,
      });

      if (!budget) {
        throw new Error('Budget not found');
      }

      return budget;
    } catch (error) {
      logger.error(`Get budget error: ${error}`);
      throw error;
    }
  }

  static async getCurrentBudget(userId: Types.ObjectId) {
    try {
      const currentMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
      
      const budget = await Budget.findOne({
        userId,
        month: { $lte: currentMonth },
      }).sort({ month: -1 });

      if (!budget) {
        return null;
      }

      // Calculate actual spending for each category
      const startOfMonth = new Date(budget.month.getFullYear(), budget.month.getMonth(), 1);
      const endOfMonth = new Date(budget.month.getFullYear(), budget.month.getMonth() + 1, 0);

      const actualSpending = await Transaction.aggregate([
        {
          $match: {
            userId,
            type: 'expense',
            date: { $gte: startOfMonth, $lte: endOfMonth },
          },
        },
        {
          $group: {
            _id: '$category',
            spent: { $sum: { $abs: '$amount' } },
          },
        },
      ]);

      const spendingMap = new Map(actualSpending.map((item) => [item._id, item.spent]));

      // Calculate budget progress
      const updatedCategoryBudgets = budget.categoryBudgets.map((catBudget) => {
        const spent = spendingMap.get(catBudget.category) || 0;
        return {
          category: catBudget.category,
          budget: catBudget.budget,
          spent,
          remaining: catBudget.budget - spent,
          percentage: catBudget.budget > 0 ? (spent / catBudget.budget) * 100 : 0,
          overspent: spent > catBudget.budget,
        };
      });

      const totalSpent = updatedCategoryBudgets.reduce((sum, cat) => sum + cat.spent, 0);
      const totalRemaining = budget.totalBudget - totalSpent;
      const totalPercentage = budget.totalBudget > 0 
        ? (totalSpent / budget.totalBudget) * 100 
        : 0;

      return {
        ...budget.toObject(),
        categoryBudgets: updatedCategoryBudgets,
        totalSpent,
        totalRemaining,
        totalPercentage,
        overspent: totalSpent > budget.totalBudget,
      };
    } catch (error) {
      logger.error(`Get current budget error: ${error}`);
      throw error;
    }
  }

  static async createBudget(budgetData: Partial<IBudget>, userId: Types.ObjectId) {
    try {
      // Check if budget already exists for this month
      const existingBudget = await Budget.findOne({
        userId,
        month: budgetData.month,
      });

      if (existingBudget) {
        throw new Error('Budget already exists for this month');
      }

      // Validate that total budget equals sum of category budgets
      const totalCategoryBudget = budgetData.categoryBudgets?.reduce(
        (sum, cat) => sum + cat.budget,
        0
      ) || 0;

      if (totalCategoryBudget !== budgetData.totalBudget) {
        throw new Error('Total budget must equal the sum of category budgets');
      }

      const budget = await Budget.create({
        ...budgetData,
        userId,
      });

      logger.info(`Budget created for month: ${budget.month}`);

      return budget;
    } catch (error) {
      logger.error(`Create budget error: ${error}`);
      throw error;
    }
  }

  static async updateBudget(
    budgetId: string,
    updateData: Partial<IBudget>,
    userId: Types.ObjectId
  ) {
    try {
      // Check if budget exists
      const existingBudget = await Budget.findOne({
        _id: budgetId,
        userId,
      });

      if (!existingBudget) {
        throw new Error('Budget not found');
      }

      // If updating month, check if budget already exists for new month
      if (updateData.month && updateData.month !== existingBudget.month) {
        const duplicateBudget = await Budget.findOne({
          userId,
          month: updateData.month,
          _id: { $ne: budgetId },
        });

        if (duplicateBudget) {
          throw new Error('Budget already exists for this month');
        }
      }

      // Validate that total budget equals sum of category budgets if both are provided
      if (updateData.categoryBudgets && updateData.totalBudget) {
        const totalCategoryBudget = updateData.categoryBudgets.reduce(
          (sum, cat) => sum + cat.budget,
          0
        );

        if (totalCategoryBudget !== updateData.totalBudget) {
          throw new Error('Total budget must equal the sum of category budgets');
        }
      }

      const budget = await Budget.findByIdAndUpdate(
        budgetId,
        updateData,
        {
          new: true,
          runValidators: true,
        }
      );

      logger.info(`Budget updated: ${budgetId}`);

      return budget;
    } catch (error) {
      logger.error(`Update budget error: ${error}`);
      throw error;
    }
  }

  static async deleteBudget(budgetId: string, userId: Types.ObjectId) {
    try {
      const budget = await Budget.findOne({
        _id: budgetId,
        userId,
      });

      if (!budget) {
        throw new Error('Budget not found');
      }

      await budget.deleteOne();

      logger.info(`Budget deleted: ${budgetId}`);

      return true;
    } catch (error) {
      logger.error(`Delete budget error: ${error}`);
      throw error;
    }
  }

  static async getBudgetOverview(userId: Types.ObjectId) {
    try {
      const currentMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
      
      const [currentBudget, lastThreeBudgets] = await Promise.all([
        this.getCurrentBudget(userId),
        Budget.find({ userId })
          .sort({ month: -1 })
          .limit(3)
          .lean(),
      ]);

      // Calculate monthly trends
      const monthlyTrends = await Transaction.aggregate([
        {
          $match: {
            userId,
            date: {
              $gte: new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 5, 1),
              $lte: new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0),
            },
          },
        },
        {
          $group: {
            _id: {
              year: { $year: '$date' },
              month: { $month: '$date' },
              type: '$type',
            },
            amount: { $sum: { $abs: '$amount' } },
          },
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
      ]);

      const incomeTrends: Record<string, number> = {};
      const expenseTrends: Record<string, number> = {};

      monthlyTrends.forEach((trend) => {
        const monthKey = `${trend._id.year}-${trend._id.month.toString().padStart(2, '0')}`;
        if (trend._id.type === 'income') {
          incomeTrends[monthKey] = trend.amount;
        } else {
          expenseTrends[monthKey] = trend.amount;
        }
      });

      return {
        currentBudget,
        recentBudgets: lastThreeBudgets,
        trends: {
          income: incomeTrends,
          expenses: expenseTrends,
        },
      };
    } catch (error) {
      logger.error(`Get budget overview error: ${error}`);
      throw error;
    }
  }
}