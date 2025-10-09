// backend/models/setting.model.js
import mongoose from "mongoose";

const settingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    emailNotifications: {
      type: Boolean,
      default: true,
    },
    pushNotifications: {
      type: Boolean,
      default: false,
    },
    smsReminders: {
      type: Boolean,
      default: false,
    },
    reminderDays: [
      {
        type: Number,
        default: [7, 3, 1],
      },
    ],
    currency: {
      type: String,
      default: "USD",
      enum: ["USD", "EUR", "GBP", "CAD", "AUD"], // Add validation
    },
    dateFormat: {
      type: String,
      default: "MM/DD/YYYY",
      enum: ["MM/DD/YYYY", "DD/MM/YYYY", "YYYY-MM-DD"], // Add validation
    },
    dataSharing: {
      type: Boolean,
      default: false,
    },
    phoneNumber: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Setting", settingSchema);
