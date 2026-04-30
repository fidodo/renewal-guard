// controller/subscription.controller.js
import workflowClient from "../config/upstash.js";
import Subscription from "../models/subscription.model.js";
import { SERVER_URL } from "../config/env.js";
import mongoose from "mongoose";
import { sendReminderEmail } from "../utils/send-email.js";
import { extractSubscriptionFromReceipt } from "../services/receipt-parser.service.js";

export const extractSubscriptionFromImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No image file provided",
      });
    }

    console.log("📸 Processing image:", {
      originalname: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype,
    });

    // Use Azure Vision to extract subscription data
    const extractedData = await extractSubscriptionFromReceipt(req.file.buffer);

    console.log("✅ Extracted subscription data:", extractedData);

    res.status(200).json({
      success: true,
      data: extractedData,
    });
  } catch (error) {
    console.error("❌ Error extracting subscription from image:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to extract information from image",
    });
  }
};

export const createSubscription = async (req, res, next) => {
  let subscription;

  try {
    const userId = req.user._id || req.user.id;
    const { name, serviceName } = req.body;

    // ✅ Check for duplicate ACTIVE subscription only (not cancelled or expired)
    const existingSubscription = await Subscription.findOne({
      user: userId,
      name: { $regex: new RegExp(`^${name}$`, "i") },
      status: "active", // ✅ Only check ACTIVE subscriptions
    });

    if (existingSubscription) {
      return res.status(409).json({
        success: false,
        message: `You already have an ACTIVE subscription for "${name}". Please edit or cancel the existing one instead.`,
        existingSubscription: {
          id: existingSubscription._id,
          name: existingSubscription.name,
          status: existingSubscription.status,
        },
      });
    }

    // Optional: Check by serviceName for ACTIVE subscriptions only
    if (serviceName) {
      const existingByService = await Subscription.findOne({
        user: userId,
        serviceName: { $regex: new RegExp(`^${serviceName}$`, "i") },
        status: "active", // ✅ Only check ACTIVE subscriptions
      });

      if (existingByService) {
        return res.status(409).json({
          success: false,
          message: `You already have an ACTIVE subscription for "${serviceName}". Please edit or cancel the existing one instead.`,
          existingSubscription: {
            id: existingByService._id,
            name: existingByService.name,
            status: existingByService.status,
          },
        });
      }
    }

    subscription = await Subscription.create({
      ...req.body,
      user: userId,
    });
    console.log("✅ Subscription created:", subscription._id);

    const populatedSubscription = await Subscription.findById(
      subscription._id,
    ).populate("user", "name email phone");

    res.status(201).json({
      success: true,
      message: "Subscription created successfully",
      data: { subscription: populatedSubscription },
    });

    // Send confirmation email
    await sendReminderEmail({
      to: req.user.email,
      type: "subscription_created", // ✅ Use subscription_created template
      subscription: populatedSubscription,
    }).catch((err) => console.error("❌ Email error:", err.message));

    // Trigger workflow for future reminders (only in production)
    if (process.env.NODE_ENV === "production") {
      triggerWorkflowAsync(subscription._id).catch((err) => {
        console.warn("⚠️ Workflow trigger failed:", err.message);
      });
    }
  } catch (error) {
    console.error("❌ Error creating subscription:", error);
    next(error);
  }
};

async function triggerWorkflowAsync(subscriptionId) {
  // Allow in development if explicitly enabled OR in production
  const shouldTrigger =
    process.env.NODE_ENV === "production" ||
    process.env.ENABLE_WORKFLOW === "true";

  if (!shouldTrigger) {
    console.log(
      "⏸️ Skipping workflow trigger. Set ENABLE_WORKFLOW=true to enable in development",
    );
    return;
  }

  // Get the correct URL for the environment
  const workflowUrl =
    process.env.NODE_ENV === "production"
      ? `${SERVER_URL}/api/v1/workflows/subscription/reminder`
      : `http://localhost:5000/api/v1/workflows/subscription/reminder`;

  console.log(`🚀 Triggering workflow at: ${workflowUrl}`);

  try {
    const { workflowRunId } = await workflowClient.trigger({
      url: workflowUrl,
      body: { subscriptionId },
      headers: { "Content-Type": "application/json" },
      retries: 1,
    });

    console.log("✅ Background workflow triggered:", workflowRunId);
    return workflowRunId;
  } catch (error) {
    console.error("❌ Background workflow failed:", error.message);
    return null;
  }
}

// Optional: Queue failed workflows for retry
// async function queueWorkflowRetry(subscriptionId) {
//   // Store in database or message queue for retry
//   await FailedWorkflow.create({
//     subscriptionId,
//     type: "reminder",
//     error: "Trigger failed",
//     retryAt: new Date(Date.now() + 5 * 60 * 1000), // Retry in 5 minutes
//   });
// }

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
