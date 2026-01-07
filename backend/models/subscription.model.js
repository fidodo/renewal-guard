// backend/models/Subscription.js
import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",

      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },
    serviceName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    category: {
      type: String,
      required: true,
      enum: [
        "streaming",
        "software",
        "cloud",
        "utilities",
        "other",
        "entertainment",
        "productivity",
        "health",
        "education",
        "finance",
        "shopping",
        "food",
      ],
      index: true,
    },
    price: {
      amount: {
        type: Number,
        required: true,
        min: 0,
      },
      currency: {
        type: String,
        default: "USD",
        enum: [
          "USD",
          "EUR",
          "GBP",
          "JPY",
          "AUD",
          "CAD",
          "CHF",
          "CNY",
          "SEK",
          "NZD",
        ],
      },
      billingCycle: {
        type: String,
        required: true,
        enum: ["daily", "weekly", "monthly", "yearly"],
      },
    },
    status: {
      type: String,
      required: true,
      enum: [
        "active",
        "expired",
        "cancelled",
        "deleted",
        "inactive",
        "pending",
      ],
      default: "active",
      index: true,
    },
    billingDate: {
      startDate: {
        type: Date,
        required: true,
      },
      nextBillingDate: {
        type: Date,
        required: true,
        index: true,
      },
      endDate: {
        type: Date,
      },
    },
    paymentMethod: {
      type: String,
      trim: true,
      default: "",
    },
    autoRenew: {
      type: Boolean,
      default: true,
    },
    sendReminders: {
      type: Boolean,
      default: true,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: "",
    },
    phone: {
      type: String,
      trim: true,
      default: "",
    },
    tags: [
      {
        type: String,
        trim: true,
        maxlength: 50,
      },
    ],
    importance: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "medium",
    },
  },
  {
    timestamps: true,
  }
);

// ========== SIMPLE PRE-SAVE MIDDLEWARE ==========
subscriptionSchema.pre("save", function (next) {
  // Only update if not cancelled/deleted
  if (this.status !== "cancelled" && this.status !== "deleted") {
    const today = new Date();
    const renewalDate = this.billingDate.nextBillingDate;

    // Calculate days until renewal
    const timeDiff = renewalDate.getTime() - today.getTime();
    const daysUntilRenewal = Math.ceil(timeDiff / (1000 * 3600 * 24));

    // Update status based on days
    if (daysUntilRenewal < 0) {
      this.status = "expired";
    } else {
      this.status = "active";
    }
  }

  next();
});

// ========== VIRTUAL FIELD (Calculates on-the-fly) ==========
subscriptionSchema.virtual("daysUntilRenewal").get(function () {
  if (!this.billingDate?.nextBillingDate) return null;
  const today = new Date();
  const renewalDate = this.billingDate.nextBillingDate;
  const timeDiff = renewalDate.getTime() - today.getTime();
  return Math.ceil(timeDiff / (1000 * 3600 * 24));
});

// ========== METHOD TO CHECK IF EXPIRED ==========
subscriptionSchema.methods.isExpired = function () {
  const days = this.daysUntilRenewal;
  return days < 0 || this.status === "expired";
};

// Enable virtuals
subscriptionSchema.set("toJSON", { virtuals: true });
subscriptionSchema.set("toObject", { virtuals: true });

// Indexes for search
subscriptionSchema.index({ userId: 1, name: 1 });
subscriptionSchema.index({ userId: 1, serviceName: 1 });

subscriptionSchema.index({ userId: 1, status: 1 });
subscriptionSchema.index({ tags: 1 });

export default mongoose.model("Subscription", subscriptionSchema);
