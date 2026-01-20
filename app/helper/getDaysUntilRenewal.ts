export const getDaysUntilRenewal = (renewalDate: string) => {
  try {
    const renewal = new Date(renewalDate);
    const today = new Date();
    const diffTime = renewal.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  } catch (error) {
    console.log(error);
    console.error("Invalid date format:", renewalDate);
    return 0;
  }
};
