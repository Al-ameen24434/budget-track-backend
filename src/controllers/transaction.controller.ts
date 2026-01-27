import { Request, Response, NextFunction } from 'express';
import { Transaction } from '../models/transaction.model';
import { Category } from '../models/category.model';
import { asyncHandler } from '../utils/helpers';
import { logger } from '../utils/logger';

interface AuthRequest extends Request {
  user?: any;
}

// @desc    Get all transactions
// @route   GET /api/v1/transactions
// @access  Private
export const getTransactions = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const {
      page = 1,
      limit = 10,
      sort = '-date',
      type,
      category,
      startDate,
      endDate,
      minAmount,
      maxAmount,
      search,
    } = req.query;

    // Build query
    const query: any = { userId: req.user.id };

    if (type) {
      query.type = type;
    }

    if (category) {
      query.category = category;
    }

    if (startDate || endDate) {
      query.date = {};
      if (startDate) {
        query.date.$gte = new Date(startDate as string);
      }
      if (endDate) {
        query.date.$lte = new Date(endDate as string);
      }
    }

    if (minAmount || maxAmount) {
      query.amount = {};
      if (minAmount) {
        query.amount.$gte = parseFloat(minAmount as string);
      }
      if (maxAmount) {
        query.amount.$lte = parseFloat(maxAmount as string);
      }
    }

    if (search) {
      query.$or = [
        { description: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
        { notes: { $regex: search, $options: 'i' } },
      ];
    }

    // Execute query with pagination
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const transactions = await Transaction.find(query)
      .sort(sort as string)
      .skip(skip)
      .limit(limitNum)
      .lean();

    const total = await Transaction.countDocuments(query);

    // Get summary statistics
    const summary = await Transaction.aggregate([
      { $match: { userId: req.user.id } },
      {
        $group: {
          _id: null,
          totalIncome: {
            $sum: { $cond: [{ $eq: ['$type', 'income'] }, '$amount', 0] },
          },
          totalExpenses: {
            $sum: { $cond: [{ $eq: ['$type', 'expense'] }, '$amount', 0] },
          },
          count: { $sum: 1 },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      count: transactions.length,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
      summary: summary[0] || { totalIncome: 0, totalExpenses: 0, count: 0 },
      data: transactions,
    });
  }
);

// @desc    Get single transaction
// @route   GET /api/v1/transactions/:id
// @access  Private
export const getTransaction = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found',
      });
    }

    res.status(200).json({
      success: true,
      data: transaction,
    });
  }
);

// @desc    Create transaction
// @route   POST /api/v1/transactions
// @access  Private
export const createTransaction = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    // Check if category exists for user
    const categoryExists = await Category.findOne({
      name: req.body.category,
      userId: req.user.id,
    });

    if (!categoryExists) {
      return res.status(400).json({
        success: false,
        message: 'Category does not exist. Please create it first.',
      });
    }

    const transaction = await Transaction.create({
      ...req.body,
      userId: req.user.id,
    });

    logger.info(`Transaction created: ${transaction._id}`);

    res.status(201).json({
      success: true,
      data: transaction,
    });
  }
);

// @desc    Update transaction
// @route   PUT /api/v1/transactions/:id
// @access  Private
export const updateTransaction = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    let transaction = await Transaction.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found',
      });
    }

    transaction = await Transaction.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    logger.info(`Transaction updated: ${transaction!._id}`);

    res.status(200).json({
      success: true,
      data: transaction,
    });
  }
);

// @desc    Delete transaction
// @route   DELETE /api/v1/transactions/:id
// @access  Private
export const deleteTransaction = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found',
      });
    }

    await transaction.deleteOne();

    logger.info(`Transaction deleted: ${transaction._id}`);

    res.status(200).json({
      success: true,
      message: 'Transaction deleted successfully',
    });
  }
);

// @desc    Bulk create transactions
// @route   POST /api/v1/transactions/bulk
// @access  Private
export const bulkCreateTransactions = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const transactions = req.body.transactions;

    if (!Array.isArray(transactions) || transactions.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an array of transactions',
      });
    }

    // Add userId to each transaction
    const transactionsWithUserId = transactions.map((transaction) => ({
      ...transaction,
      userId: req.user.id,
    }));

    const createdTransactions = await Transaction.insertMany(
      transactionsWithUserId
    );

    logger.info(`Bulk created ${createdTransactions.length} transactions`);

    res.status(201).json({
      success: true,
      count: createdTransactions.length,
      data: createdTransactions,
    });
  }
);

// @desc    Import transactions from CSV/JSON
// @route   POST /api/v1/transactions/import
// @access  Private
export const importTransactions = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { format, data } = req.body;

    if (!['csv', 'json'].includes(format)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid format. Supported formats: csv, json',
      });
    }

    // TODO: Implement CSV/JSON parsing logic
    // This would involve parsing the data, validating it,
    // and creating transactions

    res.status(200).json({
      success: true,
      message: 'Import functionality to be implemented',
    });
  }
);