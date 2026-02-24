import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";

export const validateRequest = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array().map((err) => ({
        field: "param" in err ? err.param : "unknown",
        message: err.msg,
      })),
    });
  }
  return next();
};

export const transactionValidators = [
  (req: Request, res: Response, next: NextFunction) => {
    // Custom validation logic for transactions
    if (req.body.amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Amount must be greater than 0",
      });
    }

    if (!["income", "expense"].includes(req.body.type)) {
      return res.status(400).json({
        success: false,
        message: "Type must be either income or expense",
      });
    }

    return next();
  },
];
