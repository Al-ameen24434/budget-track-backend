import { Request, Response, NextFunction } from 'express';
import { Category } from '../models/category.model';
import { asyncHandler } from '../utils/helpers';
import { logger } from '../utils/logger';

interface AuthRequest extends Request {
  user?: any;
}

// Default categories
const defaultCategories = [
  // Expense categories
  { name: 'Food & Dining', icon: '🍽️', color: '#ef4444', type: 'expense' },
  { name: 'Transportation', icon: '🚗', color: '#f97316', type: 'expense' },
  { name: 'Shopping', icon: '🛍️', color: '#eab308', type: 'expense' },
  { name: 'Entertainment', icon: '🎬', color: '#22c55e', type: 'expense' },
  { name: 'Bills & Utilities', icon: '⚡', color: '#3b82f6', type: 'expense' },
  { name: 'Healthcare', icon: '🏥', color: '#8b5cf6', type: 'expense' },
  { name: 'Education', icon: '📚', color: '#06b6d4', type: 'expense' },
  { name: 'Travel', icon: '✈️', color: '#f43f5e', type: 'expense' },
  
  // Income categories
  { name: 'Salary', icon: '💰', color: '#10b981', type: 'income' },
  { name: 'Freelance', icon: '💻', color: '#6366f1', type: 'income' },
  { name: 'Investments', icon: '📈', color: '#84cc16', type: 'income' },
  { name: 'Other', icon: '📦', color: '#6b7280', type: 'both' },
];

// @desc    Get all categories
// @route   GET /api/v1/categories
// @access  Private
export const getCategories = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { type } = req.query;

    const query: any = { userId: req.user.id };
    if (type) {
      query.type = type === 'both' ? { $in: ['income', 'expense', 'both'] } : type;
    }

    const categories = await Category.find(query).sort({ name: 1 });

    res.status(200).json({
      success: true,
      count: categories.length,
      data: categories,
    });
  }
);

// @desc    Get single category
// @route   GET /api/v1/categories/:id
// @access  Private
export const getCategory = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const category = await Category.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
      });
    }

    res.status(200).json({
      success: true,
      data: category,
    });
  }
);

// @desc    Create category
// @route   POST /api/v1/categories
// @access  Private
export const createCategory = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const category = await Category.create({
      ...req.body,
      userId: req.user.id,
    });

    logger.info(`Category created: ${category.name}`);

    res.status(201).json({
      success: true,
      data: category,
    });
  }
);

// @desc    Update category
// @route   PUT /api/v1/categories/:id
// @access  Private
export const updateCategory = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    let category = await Category.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
      });
    }

    category = await Category.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    logger.info(`Category updated: ${category!.name}`);

    res.status(200).json({
      success: true,
      data: category,
    });
  }
);

// @desc    Delete category
// @route   DELETE /api/v1/categories/:id
// @access  Private
export const deleteCategory = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const category = await Category.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
      });
    }

    // Check if category is being used in transactions
    // TODO: Add check for transactions using this category

    if (category.isDefault) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete default category',
      });
    }

    await category.deleteOne();

    logger.info(`Category deleted: ${category.name}`);

    res.status(200).json({
      success: true,
      message: 'Category deleted successfully',
    });
  }
);

// @desc    Initialize default categories
// @route   POST /api/v1/categories/init-defaults
// @access  Private
export const initializeDefaultCategories = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    // Check if user already has categories
    const existingCategories = await Category.countDocuments({
      userId: req.user.id,
    });

    if (existingCategories > 0) {
      return res.status(400).json({
        success: false,
        message: 'User already has categories',
      });
    }

    // Create default categories for user
    const categories = defaultCategories.map((cat) => ({
      ...cat,
      userId: req.user.id,
      isDefault: true,
    }));

    const createdCategories = await Category.insertMany(categories);

    logger.info(`Default categories created for user: ${req.user.id}`);

    res.status(201).json({
      success: true,
      count: createdCategories.length,
      data: createdCategories,
    });
  }
);