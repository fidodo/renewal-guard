// utils/send-sms.js
import twilio from "twilio";
import {
  TWILIO_ACCOUNT_SID,
  TWILIO_AUTH_TOKEN,
  TWILIO_PHONE_NUMBER,
} from "../config/env.js";

const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
export const sendReminderSMS = async ({ to, type, subscription }) => {
  try {
    if (!to) {
      throw new Error("Recipient phone number (to) is required");
    }

    if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_PHONE_NUMBER) {
      throw new Error(
        "Twilio account SID, auth token, and phone number are required"
      );
    }

    if (!subscription) {
      throw new Error("Subscription data is required");
    }

    if (!type) {
      throw new Error("Email template type is required");
    }

    const userName = subscription.user?.name || "Valued Customer";
    const subscriptionName = subscription.name;
    const renewalDate = new Date(subscription.billingDate.nextBillingDate);

    // Calculate days left
    const today = new Date();
    const daysLeft = Math.ceil((renewalDate - today) / (1000 * 60 * 60 * 24));

    // Format the renewal date
    const formattedDate = renewalDate.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const message = generateSMSTemplate({
      userName,
      subscriptionName,
      renewalDate: formattedDate,
      daysLeft,
    });

    console.log("Sending SMS:", {
      to,
      userName,
      subscriptionName,
      renewalDate: formattedDate,
      daysLeft,
      type,
    });

    const result = await client.messages.create({
      body: message,
      from: TWILIO_PHONE_NUMBER,
      to: to.trim(),
    });

    console.log("✅ SMS sent successfully:", result.sid);
    return result;
  } catch (error) {
    console.error("❌ Failed to send SMS:", error.message);
    console.error("Error details:", {
      to,
      from: TWILIO_PHONE_NUMBER,
      subscriptionId: subscription?._id || subscription?.id,
      error: error.response?.data || error.message,
    });
    throw error;
  }
};
