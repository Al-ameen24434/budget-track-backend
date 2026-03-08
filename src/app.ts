import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import { config } from "dotenv";
import { connectDatabase } from "./config/database";
import { errorHandler } from "./middleware/error.middleware";
import { logger } from "./utils/logger";
import { setupSwagger } from "./docs/swagger";
import { log, logRequest, logResponse } from "./utils/debug";

// Load environment variables
config();

// Import routes
import authRoutes from "./routes/auth.routes";
import transactionRoutes from "./routes/transaction.routes";
import categoryRoutes from "./routes/category.routes";
import budgetRoutes from "./routes/budget.routes";
import analyticsRoutes from "./routes/analytics.routes";

const app = express();

// Log middleware registration
log.middleware("Registering middleware...");

if (process.env.NODE_ENV === "development") {
  setupSwagger(app);
}

// Connect to database - moved to a lazy connection approach for serverless
let isConnected = false;

const ensureDatabaseConnection = async () => {
  if (!isConnected) {
    try {
      await connectDatabase();
      isConnected = true;
    } catch (error) {
      logger.error(`Database connection failed: ${error}`);
      throw error;
    }
  }
};

// Middleware to ensure database connection before handling requests
app.use(async (req, res, next) => {
  try {
    await ensureDatabaseConnection();
    next();
  } catch (error) {
    logger.error(`Database connection error: ${error}`);
    res.status(500).json({
      success: false,
      message: "Database connection failed",
    });
  }
});

// Security middleware
app.use(helmet());
log.middleware("✓ Helmet middleware registered");
// CORS configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN || "http://localhost:5000",
  credentials: true,
};
app.use(cors(corsOptions));
log.middleware(
  `✓ CORS middleware registered with origin: ${corsOptions.origin}`,
);

if (process.env.NODE_ENV === "development") {
  setupSwagger(app);
}

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
});
app.use("/api/", limiter);
log.middleware("✓ Rate limiting middleware registered");

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());
app.use(compression());

// Request logging
// general logger (winston) for high‑level info
app.use((req, _res, next) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

// Debug helpers – only enable detailed request/response
// output when development or DEBUG is set.
if (process.env.NODE_ENV === "development" || process.env.DEBUG) {
  app.use(logRequest);
  app.use(logResponse);
}

// API Routes
const apiPrefix = process.env.API_PREFIX || "/api/v1";
app.use(`${apiPrefix}/auth`, authRoutes);
app.use(`${apiPrefix}/transactions`, transactionRoutes);
app.use(`${apiPrefix}/categories`, categoryRoutes);
app.use(`${apiPrefix}/budgets`, budgetRoutes);
app.use(`${apiPrefix}/analytics`, analyticsRoutes);

if (process.env.NODE_ENV === "development") {
  setupSwagger(app);
}

// Health check endpoint
app.get("/health", (_req, res) => {
  res.status(200).json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// 404 handler
app.use("*", (_req, res) => {
  res.status(404).json({
    success: false,
    message: "Endpoint not found",
  });
});

// Error handling middleware
app.use(errorHandler);

export default app;
