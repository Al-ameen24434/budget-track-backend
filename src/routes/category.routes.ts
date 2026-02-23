import express from 'express';
import { body } from 'express-validator';
import {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
  initializeDefaultCategories,
} from '../controllers/category.controller';
import { protect } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validation.middleware';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Validation middleware
const categoryValidation = [
  body('name').notEmpty().withMessage('Category name is required'),
  body('icon').notEmpty().withMessage('Icon is required'),
  body('color')
    .matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
    .withMessage('Invalid color format'),
  body('type')
    .isIn(['income', 'expense', 'both'])
    .withMessage('Type must be income, expense, or both'),
];

router
  .route('/')
  .get(getCategories)
  .post(categoryValidation, validateRequest, createCategory);

router
  .route('/:id')
  .get(getCategory)
  .put(categoryValidation, validateRequest, updateCategory)
  .delete(deleteCategory);

router.post('/init-defaults', initializeDefaultCategories);

export default router;