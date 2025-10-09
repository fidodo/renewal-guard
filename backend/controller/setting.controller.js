import Setting from "../models/setting.model.js";

// In your backend setting.controller.js - getSettings function
export const getSetting = async (req, res, next) => {
  try {
    const userId = req.user._id;

    console.log("🔍 GET SETTINGS - User ID:", userId);

    const settings = await Setting.findOne({ userId: userId });

    console.log("🔍 Settings found in database:", settings);

    // If no settings found, return default settings
    if (!settings) {
      console.log("⚠️ No settings found for user, returning defaults");
      const defaultSettings = {
        emailNotifications: true,
        pushNotifications: false,
        smsReminders: false,
        reminderDays: [7, 3, 1],
        currency: "USD",
        dateFormat: "MM/DD/YYYY",
        dataSharing: false,
        phoneNumber: "",
        userId: userId,
      };

      return res.status(200).json({
        success: true,
        data: defaultSettings,
      });
    }

    console.log("✅ Returning settings from database");
    res.status(200).json({
      success: true,
      data: settings,
    });
  } catch (error) {
    console.error("❌ Error fetching settings:", error);
    next(error);
  }
};
export const getSettingByUserId = async (req, res, next) => {
  try {
    const userId = req.params._id;
    const settings = await Setting.find({ userId });

    if (!settings) {
      const defaultSettings = {
        emailNotifications: true,
        pushNotifications: false,
        smsReminders: false,
        reminderDays: [7, 3, 1],
        currency: "USD",
        dateFormat: "MM/DD/YYYY",
        dataSharing: false,
        phoneNumber: "",
        userId: userId,
      };

      return res.status(200).json({
        success: true,
        data: defaultSettings,
      });
    }

    res.status(200).json({
      success: true,
      data: settings,
    });
  } catch (error) {
    next(error);
  }
};

// backend/controller/setting.controller.js
export const updateSetting = async (req, res, next) => {
  try {
    console.log("🔍 UPDATE SETTING - Request received");
    console.log("🔍 User ID from params:", req.params.userId);
    console.log("🔍 Request body:", req.body);
    console.log("🔍 Authenticated user:", req.user);

    const userId = req.params.userId;

    if (!userId || userId === "null" || userId === "undefined") {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    // Validate MongoDB ObjectId format
    if (!userId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID format",
      });
    }

    // Check if authenticated user matches the requested user
    if (req.user._id.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update these settings",
      });
    }

    console.log("🔍 Searching for settings with userId:", userId);

    // Try to find existing settings
    const existingSettings = await Setting.findOne({ userId: userId });
    console.log("🔍 Existing settings found:", existingSettings);

    // Update or create settings
    const updateData = {
      ...req.body,
      userId: userId,
    };

    console.log("🔍 Update data:", updateData);

    const settings = await Setting.findOneAndUpdate(
      { userId: userId },
      updateData,
      {
        new: true,
        upsert: true, // Create if doesn't exist
        runValidators: true,
        setDefaultsOnInsert: true,
      }
    );

    console.log("🔍 Settings after update:", settings);

    if (!settings) {
      console.log("❌ Settings update failed - no document returned");
      return res.status(500).json({
        success: false,
        message: "Failed to save settings",
      });
    }

    console.log("✅ Settings saved successfully to database");

    res.status(200).json({
      success: true,
      message: "Settings updated successfully",
      data: settings,
    });
  } catch (error) {
    console.error("❌ Error updating settings:", error);

    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID format",
      });
    }

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: `Validation error: ${error.message}`,
      });
    }

    next(error);
  }
};
