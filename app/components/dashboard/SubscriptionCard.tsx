// components/dashboard/SubscriptionCard.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Subscription } from "./SubscriptionForm";

interface SubscriptionCardProps {
  subscription: Subscription;
  onCancel: (id: string) => void;
  onDelete: (id: string) => void;
  isCancelling?: boolean;
}

const SubscriptionCard = ({
  subscription,
  onCancel,
  onDelete,
  isCancelling = false,
}: SubscriptionCardProps) => {
  const getDaysUntilRenewal = (renewalDate: string) => {
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

  const daysUntilRenewal = getDaysUntilRenewal(
    subscription.billingDate?.nextBillingDate
  );

  const formattedPrice = subscription.price.amount
    ? `${subscription.price?.amount?.toFixed(2)}`
    : "0.00";

  const getBadgeVariant = () => {
    switch (subscription.status) {
      case "active":
        return "default";
      case "expired":
        return "secondary";
      case "cancelled":
        return "destructive";
      case "deleted":
        return "destructive";
      case "inactive":
        return "destructive";
      case "pending":
        return "destructive";
      default:
        return "secondary";
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl">{subscription.name}</CardTitle>
        <div className="flex items-center gap-2">
          <Badge variant={getBadgeVariant()}>{subscription.status}</Badge>
          {subscription.autoRenew && subscription.status === "active" && (
            <Badge variant="outline">Auto-renew</Badge>
          )}
          {subscription.status === "active" && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(subscription.id)}
              className="border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800"
            >
              Delete
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center">
          <div>
            <p className="text-muted-foreground capitalize">
              {subscription.category} •{" "}
              {subscription.price.billingCycle || "Monthly"}
            </p>
            <p className="text-lg font-semibold">{formattedPrice} </p>
            <p className="text-sm text-muted-foreground">
              {subscription.status === "active"
                ? daysUntilRenewal > 0
                  ? `Renews in ${daysUntilRenewal} days`
                  : "Renews today"
                : `Status: ${subscription.status}`}
            </p>
          </div>
          {subscription.status === "active" && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onCancel(subscription.id)}
                disabled={isCancelling}
              >
                {isCancelling ? "Cancelling..." : "Cancel"}
              </Button>
              <Button variant="outline" size="sm">
                Edit
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SubscriptionCard;
