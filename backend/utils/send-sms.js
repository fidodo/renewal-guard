import twilio from "twilio";
import {
  TWILIO_ACCOUNT_SID,
  TWILIO_AUTH_TOKEN,
  TWILIO_PHONE_NUMBER,
} from "../config/env.js";

const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

export const sendReminderSMS = async ({ to, type, subscription }) => {
  try {
    const message = `Reminder: Your subscription for ${subscription.user.name} renews soon (${type}).`;
    const result = await client.messages.create({
      body: message,
      from: TWILIO_PHONE_NUMBER,
      to,
    });
    console.log("SMS sent successfully:", result.sid);
  } catch (error) {
    console.error("Failed to send SMS:", error.message);
    throw error;
  }
};
