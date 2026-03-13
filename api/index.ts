import app from "../src/app";
import { logger } from "../src/utils/logger";
import { log } from "../src/utils/debug";

// Handle unhandled promise rejections
process.on("unhandledRejection", (err: Error) => {
  logger.error(`Unhandled Rejection: ${err.message}`);
  logger.error(err.stack);
  log.error("unhandledRejection", err.message);
  throw err;
});

// Handle uncaught exceptions
process.on("uncaughtException", (err: Error) => {
  logger.error(`Uncaught Exception: ${err.message}`);
  logger.error(err.stack);
  log.error("uncaughtException", err.message);
  throw err;
});

// Vercel serverless function handler
export default async function handler(req: any, res: any) {
  try {
    // Handle the request with Express app
    return app(req, res);
  } catch (error) {
    logger.error(`Serverless function error: ${error}`);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" && error && typeof error === "object" && "message" in error ? (error as { message: string }).message : undefined,
    });
  }
}
