// components/dashboard/SubscriptionForm.tsx
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAppDispatch } from "@/app/hooks/redux";
import {
  createSubscription,
  updateSubscription,
  setSubscriptions,
} from "@/app/store/slices/subscriptionSlice";
import { AppDispatch } from "@/app/store/store";

// Pure subscription data (from backend / DB)
export interface Subscription {
  _id?: string;
  id: string;
  name: string;
  serviceName: string;
  description?: string;
  category: string;
  price: {
    amount: number;
    currency: string;
    billingCycle: string;
  };
  billingDate: {
    startDate: string;
    nextBillingDate: string;
    endDate?: string;
  };
  status:
    | "active"
    | "expired"
    | "cancelled"
    | "inactive"
    | "pending"
    | "deleted";
  paymentMethod: string;
  autoRenew: boolean;
  sendReminders: boolean;
  notes?: string;
  phone?: string;
  tags?: string[];
  importance?: "low" | "medium" | "high" | "critical";
}

// Form data type (for the form state)
interface SubscriptionFormData {
  name: string;
  serviceName: string;
  description: string;
  category: string;
  priceAmount: string;
  currency: string;
  billingCycle: string;
  startDate: string;
  nextBillingDate: string;
  paymentMethod: string;
  autoRenew: boolean;
  sendReminders: boolean;
  notes: string;
  phone: string;
}

// Component props (UI-related actions)
export interface SubscriptionFormProps {
  subscription?: Subscription;
  onCancel: () => void;
  onSubmit?: (data: Omit<Subscription, "id" | "status">) => void;
  mode?: "create" | "edit";
  onSuccess?: () => void;
}

const SubscriptionForm = ({
  onSuccess,
  onSubmit,
  onCancel,
  subscription,
  mode = "create",
}: SubscriptionFormProps) => {
  const [formData, setFormData] = useState<SubscriptionFormData>({
    name: subscription?.name || "",
    serviceName: subscription?.serviceName || "",
    description: subscription?.description || "",
    category: subscription?.category || "",
    priceAmount: subscription?.price.amount.toString() || "",
    currency: subscription?.price.currency || "USD",
    billingCycle: subscription?.price.billingCycle || "monthly",
    startDate: subscription?.billingDate.startDate.split("T")[0] || "",
    nextBillingDate:
      subscription?.billingDate.nextBillingDate.split("T")[0] || "",
    paymentMethod: subscription?.paymentMethod || "",
    autoRenew: subscription?.autoRenew ?? true,
    sendReminders: subscription?.sendReminders ?? true,
    notes: subscription?.notes || "",
    phone: subscription?.phone || "",
  });
  const dispatch = useAppDispatch();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const subscriptionData: Omit<Subscription, "id" | "status"> = {
      name: formData.name,
      serviceName: formData.serviceName || formData.name,
      description: formData.description,
      category: formData.category,
      billingDate: {
        startDate: new Date(formData.startDate).toISOString(),
        nextBillingDate: new Date(formData.nextBillingDate).toISOString(),
      },
      price: {
        amount: parseFloat(formData.priceAmount) || 0,
        currency: formData.currency,
        billingCycle: formData.billingCycle,
      },
      notes: formData.notes,
      autoRenew: formData.autoRenew,
      sendReminders: formData.sendReminders,
      paymentMethod: formData.paymentMethod,
      importance: "medium" as const,
      phone: formData.phone,
      tags: [],
    };

    try {
      const token =
        localStorage.getItem("authToken") || localStorage.getItem("token");

      if (!token) {
        throw new Error("Token not found");
      }

      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };

      // Add authorization header if token exists
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      let response;

      const subscriptionId = subscription?._id || subscription?.id;
      console.log("subscriptionId", subscriptionId);

      if (mode === "edit" && subscription) {
        // Update existing subscription
        response = await fetch(
          `http://localhost:5000/api/v1/subscriptions/${subscriptionId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(subscriptionData),
          }
        );
        console.log("response", response);
      } else {
        // Create new subscription
        response = await fetch("http://localhost:5000/api/v1/subscriptions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify(subscriptionData),
        });
      }
      console.log("response", response);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      console.log("result", result);
      // Update Redux store with the response from backend
      if (mode === "edit" && subscription) {
        dispatch(updateSubscription(result.data));
      } else {
        dispatch(createSubscription(result.data));
      }
      await fetchAllSubscriptions(dispatch, token);
      // If there's still a prop callback (for backward compatibility), call it
      if (onSubmit) {
        onSubmit(result.data);
      }

      // Show success message (you can use toast or alert)
      console.log(
        `${mode === "edit" ? "Updated" : "Created"} subscription successfully!`
      );
      onSuccess?.();

      // Close the form
      onCancel();
    } catch (error) {
      console.error("Error saving subscription:", error);
    }
  };

  const fetchAllSubscriptions = async (
    dispatch: AppDispatch,
    token: string
  ) => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/v1/subscriptions",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const result = await response.json();
        dispatch(setSubscriptions(result.data || result));
      }
    } catch (error) {
      console.error("Error fetching subscriptions:", error);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Your Dialog Title</DialogTitle>
          <DialogDescription>
            {/* Add a meaningful description */}
            {mode === "edit"
              ? "Edit existing subscription"
              : "Create a new subscription"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Subscription Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    name: e.target.value,
                  }))
                }
                placeholder="Netflix Premium"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="serviceName">Service Name *</Label>
              <Input
                id="serviceName"
                value={formData.serviceName}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    serviceName: e.target.value,
                  }))
                }
                placeholder="Netflix"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              placeholder="Subscription description..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, category: value }))
                }
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="streaming">Streaming</SelectItem>
                  <SelectItem value="software">Software</SelectItem>
                  <SelectItem value="cloud">Cloud Services</SelectItem>
                  <SelectItem value="utilities">Utilities</SelectItem>
                  <SelectItem value="entertainment">Entertainment</SelectItem>
                  <SelectItem value="productivity">Productivity</SelectItem>
                  <SelectItem value="health">Health</SelectItem>
                  <SelectItem value="education">Education</SelectItem>
                  <SelectItem value="finance">Finance</SelectItem>
                  <SelectItem value="shopping">Shopping</SelectItem>
                  <SelectItem value="food">Food</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priceAmount">Price *</Label>
              <Input
                id="priceAmount"
                type="number"
                step="0.01"
                min="0"
                value={formData.priceAmount}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    priceAmount: e.target.value,
                  }))
                }
                placeholder="8.99"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="currency">Currency *</Label>
              <Select
                value={formData.currency}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, currency: value }))
                }
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD ($)</SelectItem>
                  <SelectItem value="EUR">EUR (€)</SelectItem>
                  <SelectItem value="GBP">GBP (£)</SelectItem>
                  <SelectItem value="JPY">JPY (¥)</SelectItem>
                  <SelectItem value="AUD">AUD (A$)</SelectItem>
                  <SelectItem value="CAD">CAD (C$)</SelectItem>
                  <SelectItem value="CHF">CHF (CHF)</SelectItem>
                  <SelectItem value="CNY">CNY (¥)</SelectItem>
                  <SelectItem value="SEK">SEK (kr)</SelectItem>
                  <SelectItem value="NZD">NZD (NZ$)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="billingCycle">Billing Cycle *</Label>
              <Select
                value={formData.billingCycle}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, billingCycle: value }))
                }
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select billing cycle" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date *</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    startDate: e.target.value,
                  }))
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="nextBillingDate">Next Billing Date *</Label>
              <Input
                id="nextBillingDate"
                type="date"
                value={formData.nextBillingDate}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    nextBillingDate: e.target.value,
                  }))
                }
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="paymentMethod">Payment Method</Label>
              <Input
                id="paymentMethod"
                value={formData.paymentMethod}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    paymentMethod: e.target.value,
                  }))
                }
                placeholder="Credit Card, PayPal, etc."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone (Optional)</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, phone: e.target.value }))
                }
                placeholder="+1 (555) 123-4567"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, notes: e.target.value }))
              }
              placeholder="Optional notes..."
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Switch
                checked={formData.autoRenew}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({ ...prev, autoRenew: checked }))
                }
              />
              <Label htmlFor="auto-renew">Auto-renew</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                checked={formData.sendReminders}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({ ...prev, sendReminders: checked }))
                }
              />
              <Label htmlFor="send-reminders">Send reminders</Label>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit">
              {mode === "edit" ? "Update Subscription" : "Create Subscription"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SubscriptionForm;
