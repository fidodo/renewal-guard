// models/SearchHistory.js
import mongoose from "mongoose";

const searchHistorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    query: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    filters: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
    },
    resultsCount: {
      type: Number,
      default: 0,
    },
    resultIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
      },
    ],
    searchType: {
      type: String,
      enum: ["quick", "advanced", "filtered"],
      default: "quick",
    },
  },
  {
    timestamps: true,
  }
);

// Index for frequent queries analysis
searchHistorySchema.index({ userId: 1, createdAt: -1 });
searchHistorySchema.index({ query: 1, userId: 1 });
searchHistorySchema.index({ createdAt: 1 });

export default mongoose.model("SearchHistory", searchHistorySchema);
