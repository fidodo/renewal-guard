// utils/send-email.js
import { emailTemplates } from "./email-template.js";
import dayjs from "dayjs";
import transporter, { accountEmail } from "../config/nodemailer.js";
import Setting from "../models/setting.model.js";

export const sendReminderEmail = async ({ to, type, subscription }) => {
  if (!to || !type) {
    console.error("Missing required parameters:", { to, type });
    throw new Error("Missing required parameters");
  }

  console.log(`📧 Sending ${type} email to: ${to}`);

  const template = emailTemplates.find((t) => t.label === type);

  if (!template) {
    console.error("Invalid email template type:", type);
    console.log(
      "Available templates:",
      emailTemplates.map((t) => t.label),
    );
    throw new Error(`Invalid email template type: ${type}`);
  }

  // ✅ Extract daysLeft from the type label (e.g., "7 days before reminder" -> 7)
  let daysLeft = 0;
  const daysMatch = type.match(/(\d+)\s*days? before reminder/);
  if (daysMatch) {
    daysLeft = parseInt(daysMatch[1]);
  }

  // Calculate actual days until renewal for comparison/debugging
  let actualDaysLeft = 0;
  const nextBillingDate = dayjs(subscription.billingDate?.nextBillingDate);
  const today = dayjs();
  if (subscription.billingDate?.nextBillingDate) {
    actualDaysLeft = Math.max(0, nextBillingDate.diff(today, "day"));
  }

  console.log("📅 Days Debug:", {
    reminderDaysFromLabel: daysLeft,
    actualDaysUntilRenewal: actualDaysLeft,
    subscriptionName: subscription.name,
    nextBillingDate: subscription.billingDate?.nextBillingDate,
  });

  // Get user settings
  const settings = await Setting.findOne({ userId: subscription.user._id });
  const reminderDays = settings?.reminderDays || [7, 5, 2, 1];

  const mailInfo = {
    userName: subscription.user?.name || "Valued Customer",
    subscriptionName: subscription.name,
    renewalDate: subscription.billingDate?.nextBillingDate
      ? nextBillingDate.format("MMMM D, YYYY")
      : "Soon",
    planName: subscription.name,
    price: subscription.price?.amount || 0,
    PaymentMethod: subscription.paymentMethod || "Not specified",
    accountSettingsLink: `${process.env.FRONTEND_URL}/settings`,
    supportLink: `${process.env.FRONTEND_URL}/support`,
    daysLeft: daysLeft, // ✅ Use the days from the reminder label
    billingCycle: subscription.price?.billingCycle || "monthly",
    reminderDays: reminderDays,
  };

  const subject = template.generateSubject(mailInfo);
  const message = template.generateBody(mailInfo);

  const mailOptions = {
    from: accountEmail,
    to,
    subject,
    html: message,
  };

  return new Promise((resolve, reject) => {
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("❌ Error sending email:", error);
        reject(error);
      } else {
        console.log("✅ Email sent successfully:", info.messageId);
        resolve(info);
      }
    });
  });
};
