import express from 'express';
import { body } from 'express-validator';
import {
  getBudgets,
  getBudget,
  createBudget,
  updateBudget,
  deleteBudget,
  getCurrentBudget,
} from '../controllers/budget.controller';
import { protect } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validation.middleware';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Validation middleware
const budgetValidation = [
  body('month').isISO8601().withMessage('Valid month date is required'),
  body('totalBudget')
    .isFloat({ min: 0 })
    .withMessage('Total budget must be a positive number'),
  body('categoryBudgets')
    .isArray()
    .withMessage('Category budgets must be an array'),
  body('categoryBudgets.*.category')
    .notEmpty()
    .withMessage('Category name is required'),
  body('categoryBudgets.*.budget')
    .isFloat({ min: 0 })
    .withMessage('Category budget must be a positive number'),
];

router
  .route('/')
  .get(getBudgets)
  .post(budgetValidation, validateRequest, createBudget);

router.route('/current').get(getCurrentBudget);

router
  .route('/:id')
  .get(getBudget)
  .put(budgetValidation, validateRequest, updateBudget)
  .delete(deleteBudget);

export default router;