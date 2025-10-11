// app/subscriptions/[id]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  Edit,
  Save,
  X,
  Calendar,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Clock,
  FileText,
  Bell,
  MoreVertical,
} from "lucide-react";
import { useAppSelector, useAppDispatch } from "@/app/hooks/redux";
import { updateSubscriptionById } from "@/app/store/slices/subscriptionSlice";
import { Subscription } from "@/app/components/dashboard/SubscriptionForm";

export default function SubscriptionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const subscriptions = useAppSelector(
    (state) => state.subscription.subscriptions
  );
  const loading = useAppSelector((state) => state.subscription.loading);

  const [isEditing, setIsEditing] = useState(false);

  const [isSaving, setIsSaving] = useState(false);
  const [editData, setEditData] = useState<Partial<Subscription>>({});

  const subscription = subscriptions.find((sub) => sub._id === params.id);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (subscription) {
      setEditData(subscription);
    }
  }, [subscription]);

  const handleSave = async () => {
    if (!subscription?._id) return;
    setIsSaving(true);
    try {
      // Dispatch Redux action to update subscription
      dispatch(
        updateSubscriptionById({ id: subscription?._id, updates: editData })
      );
      setIsEditing(false);
      console.log("Subscription updated successfully");
    } catch (error) {
      console.error("Error updating subscription:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditData(subscription || {});
    setIsEditing(false);
  };

  const handleInputChange = (
    field: keyof Subscription,
    value: string | number | boolean
  ) => {
    setEditData((prev) => ({ ...prev, [field]: value }));
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { variant: "default" as const, label: "Active" },
      cancelled: { variant: "secondary" as const, label: "Cancelled" },
      expired: { variant: "destructive" as const, label: "Expired" },
      pending: { variant: "outline" as const, label: "Pending" },
    };
    const config = statusConfig[status as keyof typeof statusConfig];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getDaysUntilBilling = (nextBillingDate: string) => {
    const today = new Date();
    const billingDate = new Date(nextBillingDate);
    const diffTime = billingDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 mx-auto text-muted-foreground" />
          <h2 className="text-xl font-semibold mt-4">Subscription not found</h2>
          <Button onClick={() => router.push("/dashboard")} className="mt-4">
            Back to Subscriptions
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/dashboard")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">
              {isEditing ? (
                <Input
                  value={editData.name || ""}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className="text-3xl font-bold h-12"
                />
              ) : (
                subscription.name
              )}
            </h1>
            <p className="text-muted-foreground">
              {isEditing ? (
                <Input
                  value={editData.category || ""}
                  onChange={(e) =>
                    handleInputChange("category", e.target.value)
                  }
                  className="mt-1"
                  placeholder="category"
                />
              ) : (
                subscription.category
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {!isEditing ? (
            <>
              <Button onClick={() => setIsEditing(true)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button variant="outline">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <>
              <Button onClick={handleSave} disabled={isSaving}>
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? "Saving..." : "Save"}
              </Button>
              <Button variant="outline" onClick={handleCancel}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Status Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Subscription Status</span>
                {getStatusBadge(subscription.status)}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Billing Cycle</Label>
                  {isEditing ? (
                    <Select
                      value={editData.billingDate?.nextBillingDate}
                      onValueChange={(value) =>
                        handleInputChange("billingDate", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="quarterly">Quarterly</SelectItem>
                        <SelectItem value="yearly">Yearly</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="text-sm capitalize">
                      {subscription.billingDate?.nextBillingDate}
                    </p>
                  )}
                </div>
                <div>
                  <Label>Price</Label>
                  {isEditing ? (
                    <Input
                      type="number"
                      value={editData.price?.amount || ""}
                      onChange={(e) =>
                        handleInputChange("price", parseFloat(e.target.value))
                      }
                    />
                  ) : (
                    <p className="text-sm">
                      ${subscription.price?.amount}/
                      {subscription.billingDate?.nextBillingDate}
                    </p>
                  )}
                </div>
                <div>
                  <Label>Next Billing</Label>
                  <p className="text-sm flex items-center">
                    <Calendar className="h-3 w-3 mr-1" />
                    {new Date(
                      subscription.billingDate?.nextBillingDate
                    ).toLocaleDateString()}
                    <Badge variant="outline" className="ml-2">
                      {getDaysUntilBilling(
                        subscription.billingDate?.nextBillingDate
                      )}{" "}
                      days
                    </Badge>
                  </p>
                </div>
                <div>
                  <Label>Auto Renew</Label>
                  {isEditing ? (
                    <Select
                      value={editData.autoRenew?.toString()}
                      onValueChange={(value) =>
                        handleInputChange("autoRenew", value === "true")
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">Enabled</SelectItem>
                        <SelectItem value="false">Disabled</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="flex items-center">
                      {subscription.autoRenew ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500 mr-1" />
                      ) : (
                        <Clock className="h-4 w-4 text-yellow-500 mr-1" />
                      )}
                      <span>
                        {subscription.autoRenew ? "Enabled" : "Disabled"}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notes Card */}
          <Card>
            <CardHeader>
              <CardTitle>Notes</CardTitle>
              <CardDescription>
                Additional information about this subscription
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <Textarea
                  value={editData.notes || ""}
                  onChange={(e) => handleInputChange("notes", e.target.value)}
                  placeholder="Add notes about this subscription..."
                  rows={4}
                />
              ) : (
                <p className="text-sm">
                  {subscription.notes || "No notes added."}
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Actions Card */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                <RefreshCw className="h-4 w-4 mr-2" />
                Renew Subscription
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Bell className="h-4 w-4 mr-2" />
                Set Reminder
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <FileText className="h-4 w-4 mr-2" />
                View Invoices
              </Button>
            </CardContent>
          </Card>

          {/* Information Card */}
          <Card>
            <CardHeader>
              <CardTitle>Subscription Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label>Category</Label>
                {isEditing ? (
                  <Input
                    value={editData.category || ""}
                    onChange={(e) =>
                      handleInputChange("category", e.target.value)
                    }
                  />
                ) : (
                  <p className="text-sm">{subscription.category}</p>
                )}
              </div>
              <div>
                <Label>Start Date</Label>
                <p className="text-sm">
                  {new Date(
                    subscription.billingDate?.startDate
                  ).toLocaleDateString()}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
