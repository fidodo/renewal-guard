// workflows/subscription/workflow.js
import { createRequire } from "module";
import dayjs from "dayjs";
import Subscription from "../models/subscription.model.js";
import { sendReminderEmail } from "../utils/send-email.js";
import { sendReminderSMS } from "../utils/send-sms.js";

const require = createRequire(import.meta.url);
const { serve } = require("@upstash/workflow/express");

const REMINDERS = [
  { days: 7, label: "7 days before reminder" },
  { days: 5, label: "5 days before reminder" },
  { days: 2, label: "2 days before reminder" },
  { days: 1, label: "1 day before reminder" },
];

export const sendReminders = serve(async (context) => {
  const { subscriptionId } = context.requestPayload;
  console.log(`📋 Starting workflow for subscription: ${subscriptionId}`);

  const subscription = await fetchSubscription(context, subscriptionId);

  if (!subscription || subscription.status !== "active") {
    console.log(`Subscription ${subscriptionId} is not active, skipping`);
    return;
  }

  if (!subscription.user || !subscription.user.email) {
    console.error(`No user email found for subscription ${subscriptionId}`);
    return;
  }

  const renewalDate = dayjs(subscription.billingDate.nextBillingDate);
  const today = dayjs();

  if (renewalDate.isBefore(today)) {
    console.log("Renewal date is in the past, skipping");
    return;
  }

  console.log(`Renewal date: ${renewalDate.format("YYYY-MM-DD")}`);
  console.log(`User email: ${subscription.user.email}`);

  for (const reminder of REMINDERS) {
    const reminderDate = renewalDate.subtract(reminder.days, "day");

    if (reminderDate.isAfter(today)) {
      console.log(
        `⏰ Scheduling ${reminder.label} for ${reminderDate.format("YYYY-MM-DD")}`,
      );
      await context.sleepUntil(reminder.label, reminderDate.toDate());
    }

    if (dayjs().isSame(reminderDate, "day") || dayjs().isAfter(reminderDate)) {
      await triggerReminder(context, reminder.label, subscription);
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
