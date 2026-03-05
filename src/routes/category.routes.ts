import express from "express";
import { body } from "express-validator";
import {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
  initializeDefaultCategories,
} from "../controllers/category.controller";
import { protect } from "../middleware/auth.middleware";
import { validateRequest } from "../middleware/validation.middleware";

const router = express.Router();

// All routes require authentication
router.use(protect);

// Validation middleware
const categoryValidation = [
  body("name").notEmpty().withMessage("Category name is required"),
  body("icon").notEmpty().withMessage("Icon is required"),
  body("color")
    .matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
    .withMessage("Invalid color format"),
  body("type")
    .isIn(["income", "expense", "both"])
    .withMessage("Type must be income, expense, or both"),
];

/**
 * @swagger
 * /categories:
 *   get:
 *     summary: Get all categories
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of categories
 *   post:
 *     summary: Create category
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, icon, color, type]
 *             properties:
 *               name:
 *                 type: string
 *               icon:
 *                 type: string
 *               color:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [income, expense, both]
 *     responses:
 *       201:
 *         description: Category created
 */
router
  .route("/")
  .get(getCategories)
  .post(categoryValidation, validateRequest, createCategory);

/**
 * @swagger
 * /categories/{id}:
 *   get:
 *     summary: Get single category
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Category details
 *   put:
 *     summary: Update category
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Category updated
 *   delete:
 *     summary: Delete category
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Category deleted
 */
router
  .route("/:id")
  .get(getCategory)
  .put(categoryValidation, validateRequest, updateCategory)
  .delete(deleteCategory);

/**
 * @swagger
 * /categories/init-defaults:
 *   post:
 *     summary: Initialize default categories
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Default categories created
 */
router.post("/init-defaults", initializeDefaultCategories);

export default router;
