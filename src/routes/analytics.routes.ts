import express from "express";
import { protect } from "../middleware/auth.middleware";
import { AnalyticsService } from "../services/analytics.service";

const router = express.Router();

router.use(protect);

// @desc    Get monthly summary
// @route   GET /api/v1/analytics/monthly-summary
// @access  Private
router.get("/monthly-summary", async (req: any, res) => {
  try {
    const months = parseInt(req.query.months) || 6;
    const data = await AnalyticsService.getMonthlySummary(req.user.id, months);
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// @desc    Get category spending
// @route   GET /api/v1/analytics/category-spending
// @access  Private
router.get("/category-spending", async (req: any, res) => {
  try {
    const { startDate, endDate } = req.query;
    const data = await AnalyticsService.getCategorySpending(
      req.user.id,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// @desc    Get spending trends
// @route   GET /api/v1/analytics/spending-trends
// @access  Private
router.get("/spending-trends", async (req: any, res) => {
  try {
    const period = (req.query.period || "month") as "week" | "month" | "year";
    const data = await AnalyticsService.getSpendingTrends(req.user.id, period);
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// @desc    Get budget progress
// @route   GET /api/v1/analytics/budget-progress
// @access  Private
router.get("/budget-progress", async (req: any, res) => {
  try {
    const month = req.query.month ? new Date(req.query.month) : undefined;
    const data = await AnalyticsService.getBudgetProgress(req.user.id, month);
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// @desc    Get financial overview
// @route   GET /api/v1/analytics/financial-overview
// @access  Private
router.get("/financial-overview", async (req: any, res) => {
  try {
    const data = await AnalyticsService.getFinancialOverview(req.user.id);
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

export default router;
