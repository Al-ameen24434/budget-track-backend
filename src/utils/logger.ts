import winston from "winston";

const { combine, timestamp, printf, colorize } = winston.format;

const logFormat = printf(({ level, message, timestamp, stack }) => {
  return `${timestamp} ${level}: ${stack || message}`;
});

const transports: winston.transport[] = [new winston.transports.Console()];

// Only allow file logs locally
if (process.env.NODE_ENV === "development") {
  transports.push(
    new winston.transports.File({
      filename: "logs/error.log",
      level: "error",
    }),
    new winston.transports.File({
      filename: "logs/combined.log",
    }),
  );
}

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: combine(
    timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    colorize(),
    logFormat,
  ),
  transports,
});

// only local
if (process.env.NODE_ENV === "development") {
  logger.exceptions.handle(
    new winston.transports.File({ filename: "logs/exceptions.log" }),
  );

  logger.rejections.handle(
    new winston.transports.File({ filename: "logs/rejections.log" }),
  );
}
