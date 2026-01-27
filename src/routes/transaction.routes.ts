import express from 'express';
import {
  getTransactions,
  getTransaction,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  bulkCreateTransactions,
  importTransactions,
} from '../controllers/transaction.controller';
import { protect } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validation.middleware';

const router = express.Router();

// All routes require authentication
router.use(protect);

router
  .route('/')
  .get(getTransactions)
  .post(validateRequest, createTransaction);

router
  .route('/:id')
  .get(getTransaction)
  .put(validateRequest, updateTransaction)
  .delete(deleteTransaction);

router.post('/bulk', bulkCreateTransactions);
router.post('/import', importTransactions);

export default router;