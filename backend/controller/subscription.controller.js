// controller/subscription.controller.js
import workflowClient from "../config/upstash.js";
import Subscription from "../models/subscription.model.js";
import { SERVER_URL } from "../config/env.js";
import mongoose from "mongoose";

// export const createSubscription = async (req, res, next) => {
//   try {
//     const subscription = await Subscription.create({
//       ...req.body,
//       user: req.user._id,
//     });
//     console.log("subscription", subscription);

//     const { workflowRunId } = await workflowClient.trigger({
//       url: `${SERVER_URL}/api/v1/workflows/subscription/reminder`,
//       body: { subscriptionId: subscription.id },
//       headers: { "Content-Type": "application/json" },
//       retries: 0,
//     });

//     res.status(201).json({
//       success: true,
//       message: "Subscription created successfully",
//       data: {
//         subscription,
//         workflowRunId,
//       },
//     });
//   } catch (error) {
//     next(error);
//   }
// };

export const createSubscription = async (req, res, next) => {
  let subscription;

  try {
    // 1. Create subscription
    subscription = await Subscription.create({
      ...req.body,
      user: req.user._id,
    });
    console.log("✅ Subscription created:", subscription._id);

    // 2. Send immediate response
    res.status(201).json({
      success: true,
      message: "Subscription created successfully",
      data: { subscription },
    });

    // 3. Trigger workflow ASYNCHRONOUSLY (don't await)
    // This won't block the response or cause 500 errors
    triggerWorkflowAsync(subscription.id).catch((err) => {
      console.warn("⚠️ Background workflow trigger failed:", err.message);
      // Can log to monitoring service
    });
  } catch (error) {
    console.error("❌ Error creating subscription:", error);
    next(error);
  }
};

// Separate async function for workflow
async function triggerWorkflowAsync(subscriptionId) {
  // Don't trigger in development or if URL missing
  if (process.env.NODE_ENV !== "production" || !process.env.SERVER_URL) {
    console.log("⏸️ Skipping workflow trigger in development");
    return;
  }

  try {
    const { workflowRunId } = await workflowClient.trigger({
      url: `${SERVER_URL}/api/v1/workflows/subscription/reminder`,
      body: { subscriptionId },
      headers: { "Content-Type": "application/json" },
      retries: 1, // Single retry
    });

    console.log("✅ Background workflow triggered:", workflowRunId);
    return workflowRunId;
  } catch (error) {
    // Log but don't throw - this is background processing
    console.error("❌ Background workflow failed:", error.message);
    // Could queue for retry later
    await queueWorkflowRetry(subscriptionId);
    throw error; // Throw to catch in caller if needed
  }
}

// Optional: Queue failed workflows for retry
async function queueWorkflowRetry(subscriptionId) {
  // Store in database or message queue for retry
  await FailedWorkflow.create({
    subscriptionId,
    type: "reminder",
    error: "Trigger failed",
    retryAt: new Date(Date.now() + 5 * 60 * 1000), // Retry in 5 minutes
  });
}

export const getAllSubscriptions = async (req, res, next) => {
  try {
    // Get subscriptions for the authenticated user (from token)
    const subscriptions = await Subscription.find({ user: req.user._id });

    res.status(200).json({
      success: true,
      count: subscriptions.length,
      data: subscriptions,
    });
  } catch (error) {
    next(error);
  }
};

export const getUserSubscriptions = async (req, res, next) => {
  try {
    // This is the same as getAllSubscriptions but for the authenticated user
    const subscriptions = await Subscription.find({ user: req.user._id });

    res.status(200).json({
      success: true,
      count: subscriptions.length,
      data: subscriptions,
    });
  } catch (error) {
    next(error);
  }
};

export const getSubscriptionById = async (req, res, next) => {
  try {
    const subscription = await Subscription.findById(req.params.id);

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: "Subscription not found",
      });
    }

    // Check if user owns the subscription
    if (subscription.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to access this subscription",
      });
    }

    res.status(200).json({
      success: true,
      data: subscription,
    });
  } catch (error) {
    next(error);
  }
};

export const getUpcomingRenewals = async (req, res, next) => {
  try {
    const upcomingDate = new Date();
    upcomingDate.setDate(upcomingDate.getDate() + 30); // Next 30 days

    const upcomingRenewals = await Subscription.find({
      user: req.user._id,
      status: "active",
      renewalDate: {
        $gte: new Date(),
        $lte: upcomingDate,
      },
    }).sort({ renewalDate: 1 });

    res.status(200).json({
      success: true,
      count: upcomingRenewals.length,
      data: upcomingRenewals,
    });
  } catch (error) {
    next(error);
  }
};

export const updateSubscription = async (req, res, next) => {
  try {
    let subscription = await Subscription.findById(req.params.id);

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: "Subscription not found",
      });
    }

    // Check ownership
    if (subscription.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this subscription",
      });
    }

    subscription = await Subscription.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true },
    );

    res.status(200).json({
      success: true,
      message: "Subscription updated successfully",
      data: subscription,
    });
  } catch (error) {
    next(error);
  }
};

export const cancelSubscription = async (req, res, next) => {
  try {
    const { id } = req.params;
    console.log("Canceling subscription with ID:", id);
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid subscription ID format",
      });
    }
    const subscription = await Subscription.findById(req.params.id);
    console.log("subscription", subscription);
    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: "Subscription not found",
      });
    }

    // Check if user exists in request
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }
    const objectId = subscription.user;
    // Check ownership
    if (objectId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to cancel this subscription",
      });
    }

    const userId = req.user._id.toString();
    const subscriptionUserId = objectId.toString();

    if (subscriptionUserId !== userId) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to cancel this subscription",
      });
    }

    subscription.status = "cancelled";
    await subscription.save();

    res.status(200).json({
      success: true,
      message: "Subscription cancelled successfully",
      data: subscription,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteSubscription = async (req, res, next) => {
  try {
    const subscription = await Subscription.findById(req.params.id);

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: "Subscription not found",
      });
    }

    // Check ownership
    if (subscription.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this subscription",
      });
    }

    await Subscription.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Subscription deleted permanently",
      deletedId: req.params.id,
    });
  } catch (error) {
    next(error);
  }
};
