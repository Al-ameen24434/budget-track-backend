import { Types } from 'mongoose';
import { Transaction } from '../models/transaction.model';
import { Category } from '../models/category.model';
import { Budget } from '../models/budget.model';

interface MonthlyData {
  month: string;
  income: number;
  expenses: number;
  net: number;
}

interface CategorySpending {
  category: string;
  amount: number;
  percentage: number;
  color?: string;
  icon?: string;
}

interface SpendingTrend {
  period: string;
  amount: number;
  change: number;
}

export class AnalyticsService {
  static async getMonthlySummary(
    userId: Types.ObjectId,
    months: number = 6
  ): Promise<MonthlyData[]> {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    const transactions = await Transaction.aggregate([
      {
        $match: {
          userId,
          date: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
          },
          income: {
            $sum: { $cond: [{ $eq: ['$type', 'income'] }, '$amount', 0] },
          },
          expenses: {
            $sum: { $cond: [{ $eq: ['$type', 'expense'] }, '$amount', 0] },
          },
        },
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 },
      },
    ]);

    return transactions.map((data) => ({
      month: `${data._id.year}-${data._id.month.toString().padStart(2, '0')}`,
      income: data.income,
      expenses: Math.abs(data.expenses),
      net: data.income - Math.abs(data.expenses),
    }));
  }

  static async getCategorySpending(
    userId: Types.ObjectId,
    startDate?: Date,
    endDate?: Date
  ): Promise<CategorySpending[]> {
    const matchQuery: any = { userId, type: 'expense' };
    if (startDate || endDate) {
      matchQuery.date = {};
      if (startDate) matchQuery.date.$gte = startDate;
      if (endDate) matchQuery.date.$lte = endDate;
    }

    const spending = await Transaction.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$category',
          amount: { $sum: { $abs: '$amount' } },
        },
      },
      { $sort: { amount: -1 } },
    ]);

    const total = spending.reduce((sum, item) => sum + item.amount, 0);

    // Get category colors and icons
    const categories = await Category.find({ userId });
    const categoryMap = new Map(
      categories.map((cat) => [cat.name, { color: cat.color, icon: cat.icon }])
    );

    return spending.map((item) => ({
      category: item._id,
      amount: item.amount,
      percentage: total > 0 ? (item.amount / total) * 100 : 0,
      color: categoryMap.get(item._id)?.color,
      icon: categoryMap.get(item._id)?.icon,
    }));
  }

  static async getSpendingTrends(
    userId: Types.ObjectId,
    period: 'week' | 'month' | 'year'
  ): Promise<SpendingTrend[]> {
    const now = new Date();
    let groupFormat: any;
    let periods: string[] = [];

    switch (period) {
      case 'week':
        groupFormat = { week: { $week: '$date' }, year: { $year: '$date' } };
        break;
      case 'month':
        groupFormat = { month: { $month: '$date' }, year: { $year: '$date' } };
        break;
      case 'year':
        groupFormat = { year: { $year: '$date' } };
        break;
    }

    const trends = await Transaction.aggregate([
      {
        $match: {
          userId,
          type: 'expense',
          date: { $gte: new Date(now.getFullYear(), now.getMonth() - 11, 1) },
        },
      },
      {
        $group: {
          _id: groupFormat,
          amount: { $sum: { $abs: '$amount' } },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.week': 1 } },
    ]);

    return trends.map((trend, index, array) => ({
      period:
        period === 'year'
          ? trend._id.year.toString()
          : period === 'month'
          ? `${trend._id.year}-${trend._id.month.toString().padStart(2, '0')}`
          : `${trend._id.year}-W${trend._id.week.toString().padStart(2, '0')}`,
      amount: trend.amount,
      change:
        index > 0
          ? ((trend.amount - array[index - 1].amount) / array[index - 1].amount) * 100
          : 0,
    }));
  }

  static async getBudgetProgress(
    userId: Types.ObjectId,
    month?: Date
  ): Promise<any> {
    const targetMonth = month || new Date(new Date().getFullYear(), new Date().getMonth(), 1);

    const budget = await Budget.findOne({ userId, month: targetMonth });
    if (!budget) {
      return null;
    }

    // Calculate actual spending for each category
    const startOfMonth = new Date(targetMonth.getFullYear(), targetMonth.getMonth(), 1);
    const endOfMonth = new Date(targetMonth.getFullYear(), targetMonth.getMonth() + 1, 0);

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

    // Update category budgets with actual spending
    const updatedCategoryBudgets = budget.categoryBudgets.map((catBudget) => ({
      category: catBudget.category,
      budget: catBudget.budget,
      spent: spendingMap.get(catBudget.category) || 0,
      remaining: catBudget.budget - (spendingMap.get(catBudget.category) || 0),
      percentage: catBudget.budget > 0 
        ? ((spendingMap.get(catBudget.category) || 0) / catBudget.budget) * 100 
        : 0,
    }));

    const totalSpent = updatedCategoryBudgets.reduce((sum, cat) => sum + cat.spent, 0);
    const totalRemaining = budget.totalBudget - totalSpent;
    const totalPercentage = budget.totalBudget > 0 
      ? (totalSpent / budget.totalBudget) * 100 
      : 0;

    return {
      month: budget.month,
      totalBudget: budget.totalBudget,
      totalSpent,
      totalRemaining,
      totalPercentage,
      categoryBudgets: updatedCategoryBudgets,
      currency: budget.currency,
    };
  }

  static async getFinancialOverview(
    userId: Types.ObjectId
  ): Promise<any> {
    const currentMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

    const [monthlySummary, yearlySummary, topCategories] = await Promise.all([
      // Current month summary
      Transaction.aggregate([
        {
          $match: {
            userId,
            date: { $gte: startOfMonth, $lte: endOfMonth },
          },
        },
        {
          $group: {
            _id: '$type',
            total: { $sum: { $abs: '$amount' } },
          },
        },
      ]),

      // Year-to-date summary
      Transaction.aggregate([
        {
          $match: {
            userId,
            date: {
              $gte: new Date(new Date().getFullYear(), 0, 1),
              $lte: endOfMonth,
            },
          },
        },
        {
          $group: {
            _id: '$type',
            total: { $sum: { $abs: '$amount' } },
          },
        },
      ]),

      // Top spending categories
      Transaction.aggregate([
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
            amount: { $sum: { $abs: '$amount' } },
          },
        },
        { $sort: { amount: -1 } },
        { $limit: 5 },
      ]),
    ]);

    const monthlyIncome = monthlySummary.find((s) => s._id === 'income')?.total || 0;
    const monthlyExpenses = monthlySummary.find((s) => s._id === 'expense')?.total || 0;
    const yearlyIncome = yearlySummary.find((s) => s._id === 'income')?.total || 0;
    const yearlyExpenses = yearlySummary.find((s) => s._id === 'expense')?.total || 0;

    return {
      monthly: {
        income: monthlyIncome,
        expenses: monthlyExpenses,
        net: monthlyIncome - monthlyExpenses,
        savingsRate: monthlyIncome > 0 ? ((monthlyIncome - monthlyExpenses) / monthlyIncome) * 100 : 0,
      },
      yearly: {
        income: yearlyIncome,
        expenses: yearlyExpenses,
        net: yearlyIncome - yearlyExpenses,
        savingsRate: yearlyIncome > 0 ? ((yearlyIncome - yearlyExpenses) / yearlyIncome) * 100 : 0,
      },
      topCategories,
    };
  }
}