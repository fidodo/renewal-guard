// utils/send-email.js
import { emailTemplates } from "./email-template.js";
import dayjs from "dayjs";
import transporter, { accountEmail } from "../config/nodemailer.js";

export const sendReminderEmail = async ({ to, type, subscription }) => {
  if (!to || !type) {
    console.error("Missing required parameters:", { to, type });
    throw new Error("Missing required parameters");
  }

  // Log for debugging
  console.log(`📧 Sending ${type} email to: ${to}`);
  console.log("Subscription data:", {
    id: subscription._id,
    name: subscription.name,
    hasUser: !!subscription.user,
    userName: subscription.user?.name,
  });

  const template = emailTemplates.find((t) => t.label === type);

  if (!template) {
    console.error("Invalid email template type:", type);
    console.log(
      "Available templates:",
      emailTemplates.map((t) => t.label),
    );
    throw new Error(`Invalid email template type: ${type}`);
  }

  // Calculate days left for the template
  let daysLeft = 0;
  if (subscription.billingDate?.nextBillingDate) {
    const renewalDate = dayjs(subscription.billingDate.nextBillingDate);
    const today = dayjs();
    daysLeft = Math.max(0, renewalDate.diff(today, "day"));
  }

  // Prepare data for the template
  const mailInfo = {
    userName: subscription.user?.name || "Valued Customer",
    subscriptionName: subscription.name,
    renewalDate: subscription.billingDate?.nextBillingDate
      ? dayjs(subscription.billingDate.nextBillingDate).format("MMMM D, YYYY")
      : "Soon",
    planName: subscription.name,
    price: subscription.price?.amount || 0,
    PaymentMethod: subscription.paymentMethod || "Not specified",
    accountSettingsLink: `${process.env.FRONTEND_URL}/settings`,
    supportLink: `${process.env.FRONTEND_URL}/support`,
    daysLeft: daysLeft,
  };

  const subject = template.generateSubject(mailInfo);
  const message = template.generateBody(mailInfo);

  const mailOptions = {
    from: accountEmail,
    to,
    subject,
    html: message,
  };

  // Send email with Promise wrapper
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
