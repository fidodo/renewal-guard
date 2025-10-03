export const generateEmailTemplate = ({
  userName,
  subscriptionName,
  renewalDate,
  planName,
  price,
  PaymentMethod,
  accountSettingsLink,
  supportLink,
  daysLeft,
}) =>
  `<div style ="font-family: Arial, sans-serif; color: #333;">
        <h2 style="color: #4CAF50;">Subscription Renewal Reminder</h2>
        <p>Dear ${userName},</p>
        <p>We hope you're enjoying your ${subscriptionName} subscription. This is a friendly reminder that your subscription is set to renew on <strong>${renewalDate}</strong>.</p>
        <h3>Subscription Details:</h3>
        <ul>
            <li><strong>Plan Name:</strong> ${planName}</li>
            <li><strong>Price:</strong> $${price} per month</li>
            <li><strong>Payment Method:</strong> ${PaymentMethod}</li>
            <li><strong>Days Left Until Renewal:</strong> ${daysLeft} days</li>
        </ul>
        <p>If you wish to make any changes to your subscription or payment method, please visit your <a href="${accountSettingsLink}">Account Settings</a>.</p>
        <p>For any questions or concerns, please don't hesitate to <a href="${supportLink}">contact our support team</a>.</p>
        <p>Thank you for your continued support!</p>
        <p>Best regards,<br>${subscriptionName} Team</p>
    </div>`;

export const emailTemplates = [
  {
    label: "7 days before reminder",
    generateSubject: (data) =>
      `📅 Reminder: Your ${data.subscriptionName} subscription renews in 7 days`,
    generateBody: (data) =>
      generateEmailTemplate({
        userName: data.userName,
        subscriptionName: data.subscriptionName,
        renewalDate: data.renewalDate,
        planName: data.planName,
        price: data.price,
        PaymentMethod: data.PaymentMethod,
        accountSettingsLink: data.accountSettingsLink,
        supportLink: data.supportLink,
        daysLeft: 7,
      }),
  },
  {
    label: "5 days before reminder",
    generateSubject: (data) =>
      `⏳ Reminder: Your ${data.subscriptionName} subscription renews in 3 days`,
    generateBody: (data) =>
      generateEmailTemplate({
        userName: data.userName,
        subscriptionName: data.subscriptionName,
        renewalDate: data.renewalDate,
        planName: data.planName,
        price: data.price,
        PaymentMethod: data.PaymentMethod,
        accountSettingsLink: data.accountSettingsLink,
        supportLink: data.supportLink,
        daysLeft: 3,
      }),
  },
  {
    label: "2 days before reminder",
    generateSubject: (data) =>
      `⚠️ Urgent: Your ${data.subscriptionName} subscription renews tomorrow`,
    generateBody: (data) =>
      generateEmailTemplate({
        userName: data.userName,
        subscriptionName: data.subscriptionName,
        renewalDate: data.renewalDate,
        planName: data.planName,
        price: data.price,
        PaymentMethod: data.PaymentMethod,
        accountSettingsLink: data.accountSettingsLink,
        supportLink: data.supportLink,
        daysLeft: 1,
      }),
  },
  {
    label: "1 day before reminder",
    generateSubject: (data) =>
      `🚨 Last Chance: Your ${data.subscriptionName} subscription renews today`,
    generateBody: (data) =>
      generateEmailTemplate({
        userName: data.userName,
        subscriptionName: data.subscriptionName,
        renewalDate: data.renewalDate,
        planName: data.planName,
        price: data.price,
        PaymentMethod: data.PaymentMethod,
        accountSettingsLink: data.accountSettingsLink,
        supportLink: data.supportLink,
        daysLeft: 0,
      }),
  },
];
