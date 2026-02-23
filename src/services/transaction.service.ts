import { Transaction, ITransaction } from '../models/transaction.model';
import { Category } from '../models/category.model';
import { Types } from 'mongoose';
import { logger } from '../utils/logger';

interface TransactionFilter {
  userId: Types.ObjectId;
  type?: 'income' | 'expense';
  category?: string;
  startDate?: Date;
  endDate?: Date;
  minAmount?: number;
  maxAmount?: number;
  search?: string;
}

interface PaginationOptions {
  page: number;
  limit: number;
  sort: string;
}

export class TransactionService {
  static async getTransactions(
    filter: TransactionFilter,
    options: PaginationOptions
  ) {
    try {
      const query: any = { userId: filter.userId };

      // Apply filters
      if (filter.type) query.type = filter.type;
      if (filter.category) query.category = filter.category;

      if (filter.startDate || filter.endDate) {
        query.date = {};
        if (filter.startDate) query.date.$gte = filter.startDate;
        if (filter.endDate) query.date.$lte = filter.endDate;
      }

      if (filter.minAmount || filter.maxAmount) {
        query.amount = {};
        if (filter.minAmount) query.amount.$gte = filter.minAmount;
        if (filter.maxAmount) query.amount.$lte = filter.maxAmount;
      }

      if (filter.search) {
        query.$or = [
          { description: { $regex: filter.search, $options: 'i' } },
          { category: { $regex: filter.search, $options: 'i' } },
          { notes: { $regex: filter.search, $options: 'i' } },
        ];
      }

      // Calculate pagination
      const skip = (options.page - 1) * options.limit;

      // Execute query
      const [transactions, total] = await Promise.all([
        Transaction.find(query)
          .sort(options.sort)
          .skip(skip)
          .limit(options.limit)
          .lean(),
        Transaction.countDocuments(query),
      ]);

      // Get summary statistics
      const summary = await this.getTransactionSummary(filter.userId);

      return {
        transactions,
        total,
        summary,
        page: options.page,
        limit: options.limit,
        pages: Math.ceil(total / options.limit),
      };
    } catch (error) {
      logger.error(`Get transactions error: ${error}`);
      throw error;
    }
  }

  static async getTransactionById(
    transactionId: string,
    userId: Types.ObjectId
  ) {
    try {
      const transaction = await Transaction.findOne({
        _id: transactionId,
        userId,
      });

      if (!transaction) {
        throw new Error('Transaction not found');
      }

      return transaction;
    } catch (error) {
      logger.error(`Get transaction error: ${error}`);
      throw error;
    }
  }

  static async createTransaction(
    transactionData: Partial<ITransaction>,
    userId: Types.ObjectId
  ) {
    try {
      // Check if category exists
      const categoryExists = await Category.findOne({
        name: transactionData.category,
        userId,
      });

      if (!categoryExists) {
        throw new Error('Category does not exist. Please create it first.');
      }

      // Create transaction
      const transaction = await Transaction.create({
        ...transactionData,
        userId,
      });

      logger.info(`Transaction created: ${transaction._id}`);

      return transaction;
    } catch (error) {
      logger.error(`Create transaction error: ${error}`);
      throw error;
    }
  }

  static async updateTransaction(
    transactionId: string,
    updateData: Partial<ITransaction>,
    userId: Types.ObjectId
  ) {
    try {
      // Check if transaction exists
      const existingTransaction = await Transaction.findOne({
        _id: transactionId,
        userId,
      });

      if (!existingTransaction) {
        throw new Error('Transaction not found');
      }

      // Update transaction
      const transaction = await Transaction.findByIdAndUpdate(
        transactionId,
        updateData,
        {
          new: true,
          runValidators: true,
        }
      );

      logger.info(`Transaction updated: ${transactionId}`);

      return transaction;
    } catch (error) {
      logger.error(`Update transaction error: ${error}`);
      throw error;
    }
  }

  static async deleteTransaction(
    transactionId: string,
    userId: Types.ObjectId
  ) {
    try {
      // Check if transaction exists
      const transaction = await Transaction.findOne({
        _id: transactionId,
        userId,
      });

      if (!transaction) {
        throw new Error('Transaction not found');
      }

      await transaction.deleteOne();

      logger.info(`Transaction deleted: ${transactionId}`);

      return true;
    } catch (error) {
      logger.error(`Delete transaction error: ${error}`);
      throw error;
    }
  }

  static async bulkCreateTransactions(
    transactions: Partial<ITransaction>[],
    userId: Types.ObjectId
  ) {
    try {
      if (!Array.isArray(transactions) || transactions.length === 0) {
        throw new Error('Please provide an array of transactions');
      }

      // Add userId to each transaction
      const transactionsWithUserId = transactions.map((transaction) => ({
        ...transaction,
        userId,
      }));

      const createdTransactions = await Transaction.insertMany(
        transactionsWithUserId
      );

      logger.info(`Bulk created ${createdTransactions.length} transactions`);

      return createdTransactions;
    } catch (error) {
      logger.error(`Bulk create transactions error: ${error}`);
      throw error;
    }
  }

  static async getTransactionSummary(userId: Types.ObjectId) {
    try {
      const summary = await Transaction.aggregate([
        { $match: { userId } },
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

      return summary[0] || { totalIncome: 0, totalExpenses: 0, count: 0 };
    } catch (error) {
      logger.error(`Get transaction summary error: ${error}`);
      throw error;
    }
  }

  static async getRecentTransactions(
    userId: Types.ObjectId,
    limit: number = 10
  ) {
    try {
      const transactions = await Transaction.find({ userId })
        .sort({ date: -1, createdAt: -1 })
        .limit(limit)
        .lean();

      return transactions;
    } catch (error) {
      logger.error(`Get recent transactions error: ${error}`);
      throw error;
    }
  }
}