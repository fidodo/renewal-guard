// backend/models/Service.js
import mongoose from "mongoose";

const serviceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
    category: {
      type: String,
      required: true,
      enum: [
        "entertainment",
        "productivity",
        "utilities",
        "software",
        "health",
        "education",
        "finance",
        "shopping",
        "food",
        "other",
      ],
      index: true,
    },
    website: {
      type: String,
      trim: true,
    },
    logo: {
      type: String,
      trim: true,
    },
    tags: [
      {
        type: String,
        trim: true,
        maxlength: 50,
      },
    ],
    popularity: {
      type: Number,
      default: 0,
      min: 0,
    },
    features: [
      {
        name: String,
        description: String,
      },
    ],
    pricing: [
      {
        plan: String,
        price: Number,
        currency: { type: String, default: "USD" },
        billingCycle: String,
        features: [String],
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for service search
serviceSchema.index({ name: 1 });

serviceSchema.index({ isActive: 1 });
serviceSchema.index({ tags: 1 });

export default mongoose.model("Service", serviceSchema);
