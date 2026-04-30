// workflows/subscription/workflow.js
import { createRequire } from "module";
import dayjs from "dayjs";
import Subscription from "../models/subscription.model.js";
import { sendReminderEmail } from "../utils/send-email.js";
import { sendReminderSMS } from "../utils/send-sms.js";
import Setting from "../models/setting.model.js";

const require = createRequire(import.meta.url);
const { serve } = require("@upstash/workflow/express");

export const sendReminders = serve(async (context) => {
  const { subscriptionId } = context.requestPayload;
  console.log(`📋 Starting workflow for subscription: ${subscriptionId}`);

  // ✅ fetchSubscription is important - it gets the subscription data from database
  const subscription = await fetchSubscription(context, subscriptionId);

  if (!subscription || subscription.status !== "active") {
    console.log(`Subscription ${subscriptionId} is not active, skipping`);
    return;
  }

  if (!subscription.user || !subscription.user.email) {
    console.error(`No user email found for subscription ${subscriptionId}`);
    return;
  }

  // ✅ Get user settings for reminder days
  const settings = await Setting.findOne({ userId: subscription.user._id });
  const reminderDays = settings?.reminderDays || [7, 5, 2, 1];
  console.log(`📅 Reminder days from settings: ${reminderDays.join(", ")}`);

  const renewalDate = dayjs(subscription.billingDate.nextBillingDate);
  const today = dayjs();

  if (renewalDate.isBefore(today)) {
    console.log("Renewal date is in the past, skipping");
    return;
  }

  console.log(`Renewal date: ${renewalDate.format("YYYY-MM-DD")}`);
  console.log(`User email: ${subscription.user.email}`);

  for (const daysBefore of reminderDays) {
    const reminderDate = renewalDate.subtract(daysBefore, "day");

    if (reminderDate.isAfter(today)) {
      console.log(
        `⏰ Scheduling ${daysBefore} day reminder for ${reminderDate.format("YYYY-MM-DD")}`,
      );
      await context.sleepUntil(
        `${daysBefore} days before reminder`,
        reminderDate.toDate(),
      );
    }

    if (dayjs().isSame(reminderDate, "day") || dayjs().isAfter(reminderDate)) {
      await triggerReminder(
        context,
        `${daysBefore} days before reminder`,
        subscription,
      );
    }
  }
});

const fetchSubscription = async (context, subscriptionId) => {
  return await context.run("fetchSubscription", async () => {
    const subscription = await Subscription.findById(subscriptionId).populate(
      "user",
      "name email phone",
    );

    if (!subscription) {
      console.log(`Subscription ${subscriptionId} not found`);
      return null;
    }

    console.log(
      `Found subscription: ${subscription.name} for user: ${subscription.user?.name || "Unknown"}`,
    );
    return subscription;
  });
};

const triggerReminder = async (context, label, subscription) => {
  return await context.run(label, async () => {
    console.log(`📧 Sending ${label} email to: ${subscription.user.email}`);

    await sendReminderEmail({
      to: subscription.user.email,
      type: label,
      subscription,
    });

    if (subscription.user.phone) {
      console.log(`📱 Sending ${label} SMS to: ${subscription.user.phone}`);
      await sendReminderSMS({
        to: subscription.user.phone,
        type: label,
        subscription,
      });
    }
  });
};
