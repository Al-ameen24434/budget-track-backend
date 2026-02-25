import mongoose from "mongoose";
import dotenv from "dotenv";
import { User } from "../src/models/user.model";
import { Category } from "../src/models/category.model";
import { Transaction } from "../src/models/transaction.model";
import { Budget } from "../src/models/budget.model";
import { logger } from "../src/utils/logger";

dotenv.config();

const seedDatabase = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI!);
    logger.info("Connected to database for seeding");

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Category.deleteMany({}),
      Transaction.deleteMany({}),
      Budget.deleteMany({}),
    ]);
    logger.info("Cleared existing data");

    // Create test user
    const user = await User.create({
      name: "Test User",
      email: "test@example.com",
      password: "password123",
      currency: "USD",
    });
    logger.info(`Created test user: ${user.email}`);

    // Create default categories
    const defaultCategories = [
      // Expense categories
      {
        name: "Food & Dining",
        icon: "🍽️",
        color: "#ef4444",
        type: "expense",
        userId: user._id,
        isDefault: true,
      },
      {
        name: "Transportation",
        icon: "🚗",
        color: "#f97316",
        type: "expense",
        userId: user._id,
        isDefault: true,
      },
      {
        name: "Shopping",
        icon: "🛍️",
        color: "#eab308",
        type: "expense",
        userId: user._id,
        isDefault: true,
      },
      {
        name: "Entertainment",
        icon: "🎬",
        color: "#22c55e",
        type: "expense",
        userId: user._id,
        isDefault: true,
      },
      {
        name: "Bills & Utilities",
        icon: "⚡",
        color: "#3b82f6",
        type: "expense",
        userId: user._id,
        isDefault: true,
      },
      {
        name: "Healthcare",
        icon: "🏥",
        color: "#8b5cf6",
        type: "expense",
        userId: user._id,
        isDefault: true,
      },
      {
        name: "Education",
        icon: "📚",
        color: "#06b6d4",
        type: "expense",
        userId: user._id,
        isDefault: true,
      },
      {
        name: "Travel",
        icon: "✈️",
        color: "#f43f5e",
        type: "expense",
        userId: user._id,
        isDefault: true,
      },

      // Income categories
      {
        name: "Salary",
        icon: "💰",
        color: "#10b981",
        type: "income",
        userId: user._id,
        isDefault: true,
      },
      {
        name: "Freelance",
        icon: "💻",
        color: "#6366f1",
        type: "income",
        userId: user._id,
        isDefault: true,
      },
      {
        name: "Investments",
        icon: "📈",
        color: "#84cc16",
        type: "income",
        userId: user._id,
        isDefault: true,
      },
      {
        name: "Other",
        icon: "📦",
        color: "#6b7280",
        type: "both",
        userId: user._id,
        isDefault: true,
      },
    ];

    const categories = await Category.insertMany(defaultCategories);
    logger.info(`Created ${categories.length} default categories`);

    // Create sample transactions
    const transactions = [
      {
        userId: user._id,
        date: new Date("2024-01-15"),
        category: "Salary",
        description: "Monthly Salary",
        amount: 5000,
        type: "income",
        paymentMethod: "bank_transfer",
      },
      {
        userId: user._id,
        date: new Date("2024-01-14"),
        category: "Food & Dining",
        description: "Grocery Shopping",
        amount: 120,
        type: "expense",
        paymentMethod: "card",
      },
      {
        userId: user._id,
        date: new Date("2024-01-13"),
        category: "Transportation",
        description: "Gas Station",
        amount: 45,
        type: "expense",
        paymentMethod: "card",
      },
      {
        userId: user._id,
        date: new Date("2024-01-12"),
        category: "Entertainment",
        description: "Movie Tickets",
        amount: 25,
        type: "expense",
        paymentMethod: "digital_wallet",
      },
      {
        userId: user._id,
        date: new Date("2024-01-11"),
        category: "Bills & Utilities",
        description: "Electricity Bill",
        amount: 85,
        type: "expense",
        paymentMethod: "bank_transfer",
      },
      {
        userId: user._id,
        date: new Date("2024-01-10"),
        category: "Freelance",
        description: "Web Design Project",
        amount: 800,
        type: "income",
        paymentMethod: "bank_transfer",
      },
      {
        userId: user._id,
        date: new Date("2024-01-09"),
        category: "Shopping",
        description: "New Laptop",
        amount: 1200,
        type: "expense",
        paymentMethod: "card",
        tags: ["electronics", "work"],
      },
      {
        userId: user._id,
        date: new Date("2024-01-08"),
        category: "Food & Dining",
        description: "Restaurant Dinner",
        amount: 65,
        type: "expense",
        paymentMethod: "card",
        tags: ["dining", "date"],
      },
      {
        userId: user._id,
        date: new Date("2024-01-07"),
        category: "Healthcare",
        description: "Doctor Visit",
        amount: 150,
        type: "expense",
        paymentMethod: "card",
      },
      {
        userId: user._id,
        date: new Date("2024-01-06"),
        category: "Transportation",
        description: "Uber Ride",
        amount: 18,
        type: "expense",
        paymentMethod: "digital_wallet",
      },
      {
        userId: user._id,
        date: new Date("2024-01-05"),
        category: "Investments",
        description: "Stock Dividend",
        amount: 200,
        type: "income",
        paymentMethod: "bank_transfer",
      },
    ];

    await Transaction.insertMany(transactions);
    logger.info(`Created ${transactions.length} sample transactions`);

    // Create sample budget for current month
    const currentMonth = new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      1,
    );
    const budget = await Budget.create({
      userId: user._id,
      month: currentMonth,
      totalBudget: 3000,
      categoryBudgets: [
        { category: "Food & Dining", budget: 500 },
        { category: "Transportation", budget: 300 },
        { category: "Shopping", budget: 400 },
        { category: "Entertainment", budget: 200 },
        { category: "Bills & Utilities", budget: 600 },
        { category: "Healthcare", budget: 300 },
        { category: "Education", budget: 200 },
        { category: "Travel", budget: 500 },
      ],
      currency: "USD",
    });
    logger.info(
      `Created sample budget for ${budget.month.toISOString().slice(0, 7)}`,
    );

    logger.info("Database seeding completed successfully!");
    logger.info(`Test user credentials:
      Email: test@example.com
      Password: password123
    `);

    process.exit(0);
  } catch (error) {
    logger.error("Error seeding database:", error);
    process.exit(1);
  }
};

seedDatabase();
