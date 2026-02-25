import mongoose, { Document, Schema } from "mongoose";

export interface IBudget extends Document {
  userId: mongoose.Types.ObjectId;
  month: Date;
  totalBudget: number;
  categoryBudgets: {
    category: string;
    budget: number;
    spent: number;
  }[];
  currency: string;
  createdAt: Date;
  updatedAt: Date;
}

const budgetSchema = new Schema<IBudget>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
      index: true,
    },
    month: {
      type: Date,
      required: [true, "Month is required"],
      index: true,
    },
    totalBudget: {
      type: Number,
      required: [true, "Total budget is required"],
      min: [0, "Total budget cannot be negative"],
    },
    categoryBudgets: [
      {
        category: {
          type: String,
          required: [true, "Category name is required"],
        },
        budget: {
          type: Number,
          required: [true, "Category budget is required"],
          min: [0, "Category budget cannot be negative"],
        },
        spent: {
          type: Number,
          default: 0,
          min: [0, "Spent amount cannot be negative"],
        },
      },
    ],
    currency: {
      type: String,
      required: [true, "Currency is required"],
      enum: ["USD", "EUR", "GBP", "JPY", "CAD", "AUD"],
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (_doc, ret) {
        const { __v, ...rest } = ret;
        return rest;
      },
    },
  },
);

// Ensure one budget per user per month
budgetSchema.index({ userId: 1, month: 1 }, { unique: true });

export const Budget = mongoose.model<IBudget>("Budget", budgetSchema);
