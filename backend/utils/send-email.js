import { emailTemplates } from "./email-template.js";
import dayjs from "dayjs";
import transporter, { accountEmail } from "../config/nodemailer.js";

export const sendReminderEmail = async ({ to, type, subscription }) => {
  if (!to || !type) {
    throw new Error("Missing required parameters");
  }

  const template = emailTemplates.find((t) => t.label === type);

  if (!template) {
    throw new Error("Invalid email template type");
  }

  const mailInfo = {
    userName: subscription.user.name,
    subscriptionName: subscription.name,
    renewalDate: dayjs(subscription.renewalDate).format("MMMM D, YYYY"),
    planName: subscription.name,
    price: ` ${subscription.currency} ${subscription.price}  (${subscription.frequency})`,
    PaymentMethod: subscription.paymentMethod,
  };

  const subject = template.generateSubject(mailInfo);
  const message = template.generateBody(mailInfo);

  const mailOptions = {
    from: accountEmail,
    to,
    subject,
    html: message,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error sending email:", error);
    } else {
      console.log("Email sent:", info.response);
    }
  });
};
