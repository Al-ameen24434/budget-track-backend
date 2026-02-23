import { Types } from 'mongoose';

// User types
export interface IUser {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password: string;
  currency: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserResponse {
  id: Types.ObjectId;
  name: string;
  email: string;
  currency: string;
  createdAt: Date;
  updatedAt: Date;
}

// Transaction types
export interface ITransaction {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  date: Date;
  category: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  paymentMethod?: 'cash' | 'card' | 'bank_transfer' | 'digital_wallet' | 'other';
  tags?: string[];
  recurring?: boolean;
  recurringFrequency?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TransactionResponse {
  id: Types.ObjectId;
  date: Date;
  category: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  paymentMethod?: string;
  tags?: string[];
  recurring?: boolean;
  recurringFrequency?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TransactionFilters {
  type?: 'income' | 'expense';
  category?: string;
  startDate?: Date;
  endDate?: Date;
  minAmount?: number;
  maxAmount?: number;
  search?: string;
  page?: number;
  limit?: number;
  sort?: string;
}

// Category types
export interface ICategory {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  name: string;
  icon: string;
  color: string;
  type: 'income' | 'expense' | 'both';
  budget?: number;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CategoryResponse {
  id: Types.ObjectId;
  name: string;
  icon: string;
  color: string;
  type: 'income' | 'expense' | 'both';
  budget?: number;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Budget types
export interface ICategoryBudget {
  category: string;
  budget: number;
  spent?: number;
  remaining?: number;
  percentage?: number;
  overspent?: boolean;
}

export interface IBudget {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  month: Date;
  totalBudget: number;
  categoryBudgets: ICategoryBudget[];
  currency: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface BudgetResponse {
  id: Types.ObjectId;
  month: Date;
  totalBudget: number;
  categoryBudgets: ICategoryBudget[];
  totalSpent?: number;
  totalRemaining?: number;
  totalPercentage?: number;
  overspent?: boolean;
  currency: string;
  createdAt: Date;
  updatedAt: Date;
}

// Analytics types
export interface MonthlySummary {
  month: string;
  income: number;
  expenses: number;
  net: number;
}

export interface CategorySpending {
  category: string;
  amount: number;
  percentage: number;
  color?: string;
  icon?: string;
}

export interface SpendingTrend {
  period: string;
  amount: number;
  change: number;
}

export interface FinancialOverview {
  monthly: {
    income: number;
    expenses: number;
    net: number;
    savingsRate: number;
  };
  yearly: {
    income: number;
    expenses: number;
    net: number;
    savingsRate: number;
  };
  topCategories: Array<{
    _id: string;
    amount: number;
  }>;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  summary?: {
    totalIncome: number;
    totalExpenses: number;
    count: number;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

// Request types
export interface AuthRequest extends Request {
  user?: {
    id: Types.ObjectId;
    email: string;
    name: string;
  };
}

// Validation types
export interface ValidationError {
  field: string;
  message: string;
}

// Import/Export types
export interface ImportRequest {
  format: 'csv' | 'json';
  data: string;
  mappings?: Record<string, string>;
}

export interface ExportRequest {
  format: 'csv' | 'json' | 'pdf';
  filters?: TransactionFilters;
  includeSummary?: boolean;
}

// Webhook types
export interface WebhookEvent {
  type: string;
  data: any;
  timestamp: Date;
  signature?: string;
}

// Settings types
export interface UserSettings {
  currency: string;
  dateFormat: string;
  timezone: string;
  weeklyReport: boolean;
  monthlyReport: boolean;
  budgetAlerts: boolean;
  overspendThreshold: number;
}