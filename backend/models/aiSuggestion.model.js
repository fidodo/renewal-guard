// backend/models/ai-suggestion.model.js
import mongoose from "mongoose";

const aiSuggestionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  subscriptionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Subscription",
  },
  originalSubscription: {
    type: String,
    required: true,
  },
  originalPrice: {
    type: Number,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  suggestedAlternative: {
    type: String,
    required: true,
  },
  suggestedPrice: {
    type: Number,
    required: true,
  },
  savings: {
    type: Number,
    required: true,
  },
  aiResponse: {
    type: mongoose.Schema.Types.Mixed,
  },
  userFeedback: {
    type: String,
    enum: ["helpful", "not_helpful", null],
    default: null,
  },
  userAction: {
    type: String,
    enum: ["switched", "considered", "rejected", null],
    default: null,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("AISuggestion", aiSuggestionSchema);
