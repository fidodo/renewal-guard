// utils/email-template.js

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
  billingCycle = "monthly",
}) => `
  <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
    <div style="background-color: #4CAF50; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
      <h1 style="color: white; margin: 0;">Renewal Guard</h1>
    </div>
    
    <div style="background-color: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; border: 1px solid #ddd; border-top: none;">
      <h2 style="color: #4CAF50; margin-top: 0;">Subscription Renewal Reminder</h2>
      
      <p>Dear <strong>${userName}</strong>,</p>
      
      <p>Your subscription to <strong>${subscriptionName}</strong> is set to <strong style="color: #ff6b6b;">renew in ${daysLeft} days</strong> (on ${renewalDate}).</p>
      
      <div style="background-color: #fff; padding: 15px; border-radius: 8px; margin: 20px 0; border: 1px solid #eee;">
        <h3 style="margin-top: 0; color: #333;">📋 Subscription Details:</h3>
        <ul style="margin: 0; padding-left: 20px;">
          <li><strong>Plan:</strong> ${planName}</li>
          <li><strong>Price:</strong> $${price} per ${billingCycle}</li>
          <li><strong>Payment Method:</strong> ${PaymentMethod}</li>
          <li><strong>Renewal Date:</strong> ${renewalDate}</li>
          <li><strong>Days Left:</strong> <span style="color: ${daysLeft <= 3 ? "#ff6b6b" : "#ffa500"}; font-weight: bold;">${daysLeft} days</span></li>
        </ul>
      </div>
      
      <div style="background-color: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
        <p style="margin: 0; color: #856404;">
          <strong>⚠️ Important:</strong> To avoid being charged, please cancel or modify your subscription before ${renewalDate}.
        </p>
      </div>
      
      <p><a href="${accountSettingsLink}" style="color: #4CAF50;">Manage Subscription →</a></p>
      
      <p>Need help? <a href="${supportLink}" style="color: #4CAF50;">Contact Support</a></p>
      
      <p>Best regards,<br><strong>Renewal Guard Team</strong></p>
      
      <hr style="margin: 20px 0;" />
      <p style="font-size: 12px; color: #999; text-align: center;">
        <a href="${accountSettingsLink}" style="color: #999;">Notification Settings</a>
      </p>
    </div>
  </div>
`;

export const generateSubscriptionCreatedTemplate = ({
  userName,
  subscriptionName,
  renewalDate,
  planName,
  price,
  paymentMethod,
  billingCycle,
  reminderDays,
  dashboardLink,
  supportLink,
}) => `
  <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
    <div style="background-color: #4CAF50; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
      <h1 style="color: white; margin: 0;">✅ Subscription Created!</h1>
    </div>
    
    <div style="background-color: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; border: 1px solid #ddd; border-top: none;">
      <h2 style="color: #4CAF50; margin-top: 0;">Welcome to Renewal Guard!</h2>
      
      <p>Dear <strong>${userName}</strong>,</p>
      
      <p>Your subscription to <strong>${subscriptionName}</strong> has been successfully created.</p>
      
      <div style="background-color: #fff; padding: 15px; border-radius: 8px; margin: 20px 0; border: 1px solid #eee;">
        <h3 style="margin-top: 0;">📋 Details:</h3>
        <ul>
          <li><strong>Service:</strong> ${planName}</li>
          <li><strong>Amount:</strong> $${price} per ${billingCycle}</li>
          <li><strong>Payment Method:</strong> ${paymentMethod}</li>
          <li><strong>Next Billing:</strong> ${new Date(renewalDate).toLocaleDateString()}</li>
        </ul>
      </div>
      
      <div style="background-color: #e8f5e9; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 0;"><strong>📌 You'll receive reminders at:</strong> ${reminderDays.join(", ")} day(s) before renewal.</p>
      </div>
      
      <p><a href="${dashboardLink}" style="color: #4CAF50;">Go to Dashboard →</a></p>
      
      <p>Best regards,<br><strong>Renewal Guard Team</strong></p>
    </div>
  </div>
`;

// ✅ Function to generate reminder template for any number of days
const generateReminderTemplate = (days) => ({
  label: `${days} days before reminder`,
  generateSubject: (data) =>
    `⏰ Reminder: ${data.subscriptionName} renews in ${days} days`,
  generateBody: (data) =>
    generateEmailTemplate({
      userName: data.userName,
      subscriptionName: data.subscriptionName,
      renewalDate: data.renewalDate,
      planName: data.planName,
      price: data.price,
      PaymentMethod: data.PaymentMethod,
      accountSettingsLink: `${process.env.FRONTEND_URL}/settings`,
      supportLink: `${process.env.FRONTEND_URL}/support`,
      daysLeft: days,
      billingCycle: data.billingCycle || "monthly",
    }),
});

const ALL_REMINDER_DAYS = [30, 14, 7, 5, 3, 2, 1];

const reminderTemplates = ALL_REMINDER_DAYS.map((days) =>
  generateReminderTemplate(days),
);

// ✅ Complete email templates array
export const emailTemplates = [
  {
    label: "subscription_created",
    generateSubject: (data) =>
      `✅ Subscription Created: ${data.subscriptionName}`,
    generateBody: (data) =>
      generateSubscriptionCreatedTemplate({
        userName: data.userName,
        subscriptionName: data.subscriptionName,
        renewalDate: data.renewalDate,
        planName: data.planName,
        price: data.price,
        paymentMethod: data.PaymentMethod,
        billingCycle: data.billingCycle || "monthly",
        reminderDays: data.reminderDays || [7, 5, 2, 1],
        dashboardLink: `${process.env.FRONTEND_URL}/dashboard`,
        supportLink: `${process.env.FRONTEND_URL}/support`,
      }),
  },
  ...reminderTemplates,
];
