export const generateSMSTemplate = ({
  userName,
  subscriptionName,
  renewalDate,
  daysLeft,
}) =>
  `Hi ${userName}, your ${subscriptionName} subscription renews on ${renewalDate}. ${
    daysLeft > 0 ? `${daysLeft} day(s) left.` : "Renewing today!"
  }Manage your subscriptions: https://renewal-guard.vercel.app/dashboard`;
