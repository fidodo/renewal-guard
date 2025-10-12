// controller/subscription.controller.js
import workflowClient from "../config/upstash.js";
import Subscription from "../models/subscription.model.js";
import { SERVER_URL } from "../config/env.js";
import mongoose from "mongoose";

export const createSubscription = async (req, res, next) => {
  try {
    const subscription = await Subscription.create({
      ...req.body,
      user: req.user.id,
    });

    // Handle QStash workflow with error handling
    let workflowRunId = null;
    try {
      const workflowResult = await workflowClient.trigger({
        url: `${SERVER_URL}/api/v1/workflows/subscription/reminder`,
        body: { subscriptionId: subscription.id },
        headers: { "Content-Type": "application/json" },
        retries: 0,
      });
      workflowRunId = workflowResult.workflowRunId;
    } catch (workflowError) {
      console.warn(
        "⚠️ QStash workflow failed (subscription still created):",
        workflowError.message
      );
      // Continue without workflow - subscription is still created
    }

    res.status(201).json({
      success: true,
      message: "Subscription created successfully",
      data: {
        subscription,
        ...(workflowRunId && { workflowRunId }),
      },
    });
  } catch (error) {
    next(error);
  }
};

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
      { new: true, runValidators: true }
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

    console.log("User ID from request:", userId);
    console.log("Subscription user ID:", subscriptionUserId);

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
    });
  } catch (error) {
    next(error);
  }
};
