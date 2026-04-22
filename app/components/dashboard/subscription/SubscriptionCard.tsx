import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Subscription } from "./SubscriptionForm";
import { getDaysUntilRenewal } from "@/app/helper/getDaysUntilRenewal";
import { useAppSelector } from "@/app/hooks/redux";
import { getStatusColors } from "@/app/store/slices/themeSlice";

interface SubscriptionCardProps {
  subscription: Subscription;
  onCancel: (id: string) => void;
  onDelete: (id: string) => void;
  isCancelling?: boolean;
  onEdit?: () => void;
}

const SubscriptionCard = ({
  subscription,
  onCancel,
  onDelete,
  isCancelling = false,
  onEdit,
}: SubscriptionCardProps) => {
  const theme = useAppSelector((state) => state.theme.current);
  const colors = getStatusColors(theme);

  const getStatusColor = () => {
    switch (subscription.status) {
      case "active":
        return colors.active;
      case "expired":
        return colors.expired;
      case "cancelled":
        return colors.cancelled;
      default:
        return colors.default;
    }
  };

  const statusColor = getStatusColor();

  const daysUntilRenewal = getDaysUntilRenewal(
    subscription.billingDate?.nextBillingDate,
  );

  const formattedPrice = subscription.price.amount
    ? `${subscription.price.amount.toFixed(2)} `
    : "0.00";

  const getBadgeVariant = (): "default" | "secondary" | "destructive" => {
    switch (subscription.status) {
      case "active":
        return "default";
      case "expired":
        return "secondary";
      case "cancelled":
      case "deleted":
      case "inactive":
      case "pending":
        return "destructive";
      default:
        return "secondary";
    }
  };

  return (
    <Card
      className={`border-2 ${statusColor.border} ${statusColor.bg} transition-all duration-200 hover:shadow-md`}
    >
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl">
          {subscription.name
            .toLowerCase()
            .replace(/\b\w/g, (char) => char.toUpperCase())}
        </CardTitle>
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
              className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-800"
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
            <p className="text-lg font-semibold">
              {formattedPrice} {subscription.price?.currency ?? "USD"}
            </p>
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
              <Button variant="outline" size="sm" onClick={onEdit}>
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
