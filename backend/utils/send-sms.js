import twilio from "twilio";
import {
  TWILIO_ACCOUNT_SID,
  TWILIO_AUTH_TOKEN,
  TWILIO_PHONE_NUMBER,
} from "../config/env.js";

const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

export const sendReminderSMS = async ({ to, type, subscription }) => {
  const message = `Reminder: Your subscription for ${subscription.name} renews soon (${type}).`;
  await client.messages.create({
    body: message,
    from: TWILIO_PHONE_NUMBER,
    to,
  });
};
