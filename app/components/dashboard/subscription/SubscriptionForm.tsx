"use client";
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
} from "@/app/store/slices/subscriptionSlice";
import { refreshAuthToken } from "@/app/hooks/refresh-token";

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

export interface SubscriptionFormProps {
  subscription?: Subscription;
  onCancel: () => void;
  mode?: "create" | "edit";
  onSuccess?: () => void;
}

const SubscriptionForm = ({
  onSuccess,
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

  const [isSubmitting, setIsSubmitting] = useState(false);
  const dispatch = useAppDispatch();

  const getToken = () => {
    return localStorage.getItem("token") || localStorage.getItem("authToken");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const subscriptionData = {
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
      status: "active" as const,
    };

    try {
      let token = getToken();
      if (!token) {
        throw new Error("Authentication token not found");
      }

      const headers: HeadersInit = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      };

      let response;
      const subscriptionId = subscription?._id || subscription?.id;

      if (mode === "edit" && subscription) {
        response = await fetch(`/api/v1/subscriptions/${subscriptionId}`, {
          method: "PUT",
          headers,
          body: JSON.stringify(subscriptionData),
        });
      } else {
        response = await fetch(`/api/v1/subscriptions`, {
          method: "POST",
          headers,
          body: JSON.stringify(subscriptionData),
        });
      }

      if (response.status === 401) {
        const refreshSuccess = await refreshAuthToken();
        if (refreshSuccess) {
          token = getToken();
          if (token) {
            headers.Authorization = `Bearer ${token}`;
            response = await fetch(
              mode === "edit" && subscription
                ? `/api/v1/subscriptions/${subscriptionId}`
                : `/api/v1/subscriptions`,
              {
                method: mode === "edit" ? "PUT" : "POST",
                headers,
                body: JSON.stringify(subscriptionData),
              },
            );
          }
        }
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to save subscription");
      }

      const result = await response.json();
      const savedSubscription = result.data?.subscription || result.data;

      if (mode === "edit" && subscription) {
        dispatch(updateSubscription(savedSubscription));
      } else {
        dispatch(createSubscription(savedSubscription));
      }

      onSuccess?.();
      onCancel();
    } catch (error) {
      console.error("Error saving subscription:", error);
      alert(
        error instanceof Error ? error.message : "Failed to save subscription",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === "edit" ? "Edit Subscription" : "Create New Subscription"}
          </DialogTitle>
          <DialogDescription>
            {mode === "edit"
              ? "Update your subscription details below"
              : "Add a new subscription to track"}
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
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="Netflix Premium"
                required
                disabled={isSubmitting}
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
                disabled={isSubmitting}
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
              disabled={isSubmitting}
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
                disabled={isSubmitting}
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
                disabled={isSubmitting}
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
                disabled={isSubmitting}
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
                disabled={isSubmitting}
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
                disabled={isSubmitting}
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
                disabled={isSubmitting}
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
                disabled={isSubmitting}
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
                disabled={isSubmitting}
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
              disabled={isSubmitting}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Switch
                checked={formData.autoRenew}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({ ...prev, autoRenew: checked }))
                }
                disabled={isSubmitting}
              />
              <Label>Auto-renew</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                checked={formData.sendReminders}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({ ...prev, sendReminders: checked }))
                }
                disabled={isSubmitting}
              />
              <Label>Send reminders</Label>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? "Saving..."
                : mode === "edit"
                  ? "Update Subscription"
                  : "Create Subscription"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SubscriptionForm;
