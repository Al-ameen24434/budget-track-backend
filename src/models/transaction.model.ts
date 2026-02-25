import mongoose, { Document, Schema } from "mongoose";

export interface ITransaction extends Document {
  userId: mongoose.Types.ObjectId;
  date: Date;
  category: string;
  description: string;
  amount: number;
  type: "income" | "expense";
  paymentMethod?: string;
  tags?: string[];
  recurring?: boolean;
  recurringFrequency?: "daily" | "weekly" | "monthly" | "yearly";
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const transactionSchema = new Schema<ITransaction>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
      index: true,
    },
    date: {
      type: Date,
      required: [true, "Date is required"],
      default: Date.now,
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      minlength: [2, "Description must be at least 2 characters"],
      maxlength: [200, "Description cannot exceed 200 characters"],
    },
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: [0.01, "Amount must be greater than 0"],
    },
    type: {
      type: String,
      required: [true, "Type is required"],
      enum: {
        values: ["income", "expense"],
        message: "Type must be either income or expense",
      },
    },
    paymentMethod: {
      type: String,
      enum: ["cash", "card", "bank_transfer", "digital_wallet", "other"],
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    recurring: {
      type: Boolean,
      default: false,
    },
    recurringFrequency: {
      type: String,
      enum: ["daily", "weekly", "monthly", "yearly"],
    },
    notes: {
      type: String,
      maxlength: [500, "Notes cannot exceed 500 characters"],
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

// Compound index for efficient querying
transactionSchema.index({ userId: 1, date: -1 });
transactionSchema.index({ userId: 1, category: 1 });
transactionSchema.index({ userId: 1, type: 1 });

export const Transaction = mongoose.model<ITransaction>(
  "Transaction",
  transactionSchema,
);
