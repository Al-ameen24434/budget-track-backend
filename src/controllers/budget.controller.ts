import { Request, Response, NextFunction } from 'express';
import { BudgetService } from '../services/budget.service';
import { asyncHandler } from '../utils/helpers';
import { logger } from '../utils/logger';

interface AuthRequest extends Request {
  user?: any;
}

// @desc    Get all budgets
// @route   GET /api/v1/budgets
// @access  Private
export const getBudgets = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { page = 1, limit = 10 } = req.query;

    const result = await BudgetService.getBudgets(
      req.user.id,
      parseInt(page as string),
      parseInt(limit as string)
    );

    res.status(200).json({
      success: true,
      count: result.budgets.length,
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        pages: result.pages,
      },
      data: result.budgets,
    });
  }
);

// @desc    Get single budget
// @route   GET /api/v1/budgets/:id
// @access  Private
export const getBudget = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const budget = await BudgetService.getBudgetById(req.params.id, req.user.id);

    res.status(200).json({
      success: true,
      data: budget,
    });
  }
);

// @desc    Get current budget
// @route   GET /api/v1/budgets/current
// @access  Private
export const getCurrentBudget = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const budget = await BudgetService.getCurrentBudget(req.user.id);

    if (!budget) {
      return res.status(404).json({
        success: false,
        message: 'No budget found for current period',
      });
    }

    res.status(200).json({
      success: true,
      data: budget,
    });
  }
);

// @desc    Create budget
// @route   POST /api/v1/budgets
// @access  Private
export const createBudget = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const budget = await BudgetService.createBudget(req.body, req.user.id);

    res.status(201).json({
      success: true,
      data: budget,
    });
  }
);

// @desc    Update budget
// @route   PUT /api/v1/budgets/:id
// @access  Private
export const updateBudget = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const budget = await BudgetService.updateBudget(
      req.params.id,
      req.body,
      req.user.id
    );

    res.status(200).json({
      success: true,
      data: budget,
    });
  }
);

// @desc    Delete budget
// @route   DELETE /api/v1/budgets/:id
// @access  Private
export const deleteBudget = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    await BudgetService.deleteBudget(req.params.id, req.user.id);

    res.status(200).json({
      success: true,
      message: 'Budget deleted successfully',
    });
  }
);