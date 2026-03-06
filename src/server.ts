import app from "./app";
import { logger } from "./utils/logger";
import { log } from "./utils/debug";

// Handle unhandled promise rejections
process.on("unhandledRejection", (err: Error) => {
  logger.error(`Unhandled Rejection: ${err.message}`);
  logger.error(err.stack);
  log.error("unhandledRejection", err.message);
  // In serverless, let the function fail instead of exiting
  throw err;
});

// Handle uncaught exceptions
process.on("uncaughtException", (err: Error) => {
  logger.error(`Uncaught Exception: ${err.message}`);
  logger.error(err.stack);
  log.error("uncaughtException", err.message);
  // In serverless, let the function fail instead of exiting
  throw err;
});

export default app;
