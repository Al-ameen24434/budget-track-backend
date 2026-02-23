import { body, param, query, ValidationChain } from 'express-validator';

// Common validation chains
export const idParamValidation = (paramName: string = 'id'): ValidationChain[] => [
  param(paramName)
    .isMongoId()
    .withMessage(`Invalid ${paramName} format`),
];

export const paginationValidation = (): ValidationChain[] => [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('sort')
    .optional()
    .isString()
    .withMessage('Sort must be a string'),
];

// User validation
export const registerValidation = (): ValidationChain[] => [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('currency')
    .optional()
    .isIn(['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD'])
    .withMessage('Invalid currency'),
];

export const loginValidation = (): ValidationChain[] => [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

// Transaction validation
export const transactionValidation = (): ValidationChain[] => [
  body('date')
    .optional()
    .isISO8601()
    .withMessage('Date must be a valid ISO 8601 date'),
  body('category')
    .trim()
    .notEmpty()
    .withMessage('Category is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Category must be between 2 and 50 characters'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ min: 2, max: 200 })
    .withMessage('Description must be between 2 and 200 characters'),
  body('amount')
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be a positive number'),
  body('type')
    .isIn(['income', 'expense'])
    .withMessage('Type must be either income or expense'),
  body('paymentMethod')
    .optional()
    .isIn(['cash', 'card', 'bank_transfer', 'digital_wallet', 'other'])
    .withMessage('Invalid payment method'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  body('tags.*')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 1, max: 20 })
    .withMessage('Each tag must be between 1 and 20 characters'),
  body('recurring')
    .optional()
    .isBoolean()
    .withMessage('Recurring must be a boolean'),
  body('recurringFrequency')
    .optional()
    .isIn(['daily', 'weekly', 'monthly', 'yearly'])
    .withMessage('Invalid recurring frequency'),
  body('notes')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Notes cannot exceed 500 characters'),
];

// Category validation
export const categoryValidation = (): ValidationChain[] => [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Category name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Category name must be between 2 and 50 characters'),
  body('icon')
    .trim()
    .notEmpty()
    .withMessage('Icon is required'),
  body('color')
    .trim()
    .notEmpty()
    .withMessage('Color is required')
    .matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
    .withMessage('Color must be a valid hex code'),
  body('type')
    .isIn(['income', 'expense', 'both'])
    .withMessage('Type must be income, expense, or both'),
  body('budget')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Budget must be a positive number'),
];

// Budget validation
export const budgetValidation = (): ValidationChain[] => [
  body('month')
    .notEmpty()
    .withMessage('Month is required')
    .isISO8601()
    .withMessage('Month must be a valid date'),
  body('totalBudget')
    .isFloat({ min: 0 })
    .withMessage('Total budget must be a positive number'),
  body('categoryBudgets')
    .isArray()
    .withMessage('Category budgets must be an array')
    .isLength({ min: 1 })
    .withMessage('At least one category budget is required'),
  body('categoryBudgets.*.category')
    .trim()
    .notEmpty()
    .withMessage('Category name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Category name must be between 2 and 50 characters'),
  body('categoryBudgets.*.budget')
    .isFloat({ min: 0 })
    .withMessage('Category budget must be a positive number'),
  body('currency')
    .optional()
    .isIn(['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD'])
    .withMessage('Invalid currency'),
];

// Filter validation
export const transactionFilterValidation = (): ValidationChain[] => [
  query('type')
    .optional()
    .isIn(['income', 'expense'])
    .withMessage('Type must be either income or expense'),
  query('category')
    .optional()
    .isString()
    .withMessage('Category must be a string'),
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid date'),
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid date'),
  query('minAmount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Minimum amount must be a positive number'),
  query('maxAmount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Maximum amount must be a positive number'),
  query('search')
    .optional()
    .isString()
    .withMessage('Search must be a string'),
];

// Export validation
export const exportValidation = (): ValidationChain[] => [
  body('format')
    .isIn(['csv', 'json', 'pdf'])
    .withMessage('Format must be csv, json, or pdf'),
  body('filters')
    .optional()
    .isObject()
    .withMessage('Filters must be an object'),
  body('includeSummary')
    .optional()
    .isBoolean()
    .withMessage('Include summary must be a boolean'),
];

// Custom validators
export const validateCurrency = (value: string): boolean => {
  const validCurrencies = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD'];
  return validCurrencies.includes(value.toUpperCase());
};

export const validateHexColor = (value: string): boolean => {
  const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
  return hexColorRegex.test(value);
};

export const validateAmount = (value: number): boolean => {
  return value >= 0.01 && value <= 1000000; // Between 0.01 and 1,000,000
};

export const validateDateRange = (startDate: Date, endDate: Date): boolean => {
  if (!startDate || !endDate) return true;
  return startDate <= endDate;
};

// Sanitizers
export const sanitizeTransaction = (transaction: any): any => {
  return {
    date: transaction.date ? new Date(transaction.date) : new Date(),
    category: String(transaction.category || '').trim(),
    description: String(transaction.description || '').trim(),
    amount: Math.abs(parseFloat(transaction.amount || 0)),
    type: ['income', 'expense'].includes(transaction.type) 
      ? transaction.type 
      : transaction.amount >= 0 ? 'income' : 'expense',
    paymentMethod: ['cash', 'card', 'bank_transfer', 'digital_wallet', 'other']
      .includes(transaction.paymentMethod) ? transaction.paymentMethod : undefined,
    tags: Array.isArray(transaction.tags) 
      ? transaction.tags.map((tag: any) => String(tag).trim()).filter(Boolean)
      : undefined,
    recurring: Boolean(transaction.recurring),
    recurringFrequency: ['daily', 'weekly', 'monthly', 'yearly']
      .includes(transaction.recurringFrequency) ? transaction.recurringFrequency : undefined,
    notes: transaction.notes ? String(transaction.notes).trim() : undefined,
  };
};