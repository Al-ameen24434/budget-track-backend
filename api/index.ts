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

export default app;
