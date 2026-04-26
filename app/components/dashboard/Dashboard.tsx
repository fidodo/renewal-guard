"use client";
import { useState, useMemo, useEffect, useCallback } from "react";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import { Button } from "@/components/ui/button";
import SubscriptionCard from "./subscription/SubscriptionCard";
import SubscriptionForm from "./subscription/SubscriptionForm";
import {
  setSubscriptions,
  updateSubscriptionStatus,
  deleteSubscription,
  createSubscription,
  updateSubscription,
} from "../../store/slices/subscriptionSlice";
import { ConditionalPaginatedSubscriptions } from "./ConditionalPaginatedSubscriptions";
import { Subscription } from "./subscription/SubscriptionForm";
import { ArrowUpDown, ArrowUp, ArrowDown, Plus } from "lucide-react";

import { AddSubscriptionOptions } from "./AddSubscriptionOptions";
import { ImageUploadSubscription } from "./ImageUploadSubscription";
import { fetchWithAuth } from "@/lib/fetchWithAuth";

const Dashboard = () => {
  const [showForm, setShowForm] = useState(false);
  const [showAddOptions, setShowAddOptions] = useState(false);
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [showManualForm, setShowManualForm] = useState(false);
  const [cancellingIds, setCancellingIds] = useState<Set<string>>(new Set());
  const dispatch = useAppDispatch();
  const [error, setError] = useState<string | null>(null);
  const [editingSubscription, setEditingSubscription] =
    useState<Subscription | null>(null);

  const [sortBy, setSortBy] = useState<
    "autoRenew" | "nextBillingDate" | "name"
  >("nextBillingDate");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  const subscriptions = useAppSelector(
    (state) => state.subscription.subscriptions,
  );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const currentDate = new Date();

  const processSubscriptionStatus = useCallback(
    (sub: Subscription): Subscription => {
      const nextBillingDate = sub?.billingDate?.nextBillingDate;
      if (nextBillingDate) {
        const billingDate = new Date(nextBillingDate);
        if (sub.status === "active" && billingDate <= currentDate) {
          return { ...sub, status: "expired" };
        }
        if (sub.status === "expired" && billingDate > currentDate) {
          return { ...sub, status: "active" };
        }
      }
      return sub;
    },
    [currentDate],
  );

  const processedSubscriptions = useMemo(
    () => subscriptions?.map(processSubscriptionStatus) || [],
    [subscriptions, processSubscriptionStatus],
  );

  const activeSubscriptions = useMemo(
    () => processedSubscriptions.filter((sub) => sub.status === "active"),
    [processedSubscriptions],
  );

  const expiredSubscriptions = useMemo(
    () => processedSubscriptions.filter((sub) => sub.status === "expired"),
    [processedSubscriptions],
  );

  const cancelledSubscriptions = useMemo(
    () => processedSubscriptions.filter((sub) => sub.status === "cancelled"),
    [processedSubscriptions],
  );

  const sortedActiveSubscriptions = useMemo(() => {
    return [...activeSubscriptions].sort((a, b) => {
      let aValue, bValue;
      switch (sortBy) {
        case "autoRenew":
          aValue = a.autoRenew ? 1 : 0;
          bValue = b.autoRenew ? 1 : 0;
          break;
        case "nextBillingDate":
          aValue = new Date(a.billingDate.nextBillingDate).getTime();
          bValue = new Date(b.billingDate.nextBillingDate).getTime();
          break;
        case "name":
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        default:
          return 0;
      }
      return sortOrder === "asc"
        ? aValue < bValue
          ? -1
          : aValue > bValue
            ? 1
            : 0
        : aValue > bValue
          ? -1
          : aValue < bValue
            ? 1
            : 0;
    });
  }, [activeSubscriptions, sortBy, sortOrder]);

  const handleSortClick = (
    newSortBy: "autoRenew" | "nextBillingDate" | "name",
  ) => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(newSortBy);
      setSortOrder("asc");
    }
  };

  const getSortIcon = (column: "autoRenew" | "nextBillingDate" | "name") => {
    if (sortBy !== column) return <ArrowUpDown className="w-4 h-4" />;
    return sortOrder === "asc" ? (
      <ArrowUp className="w-4 h-4" />
    ) : (
      <ArrowDown className="w-4 h-4" />
    );
  };

  const getSortButtonLabel = (
    column: "autoRenew" | "nextBillingDate" | "name",
  ) => {
    const labels = {
      autoRenew: "Auto Renew",
      nextBillingDate: "Next Billing",
      name: "Name",
    };
    if (sortBy === column)
      return `${labels[column]} ${sortOrder === "asc" ? "↑" : "↓"}`;
    return labels[column];
  };

  const handleEditClick = (subscription: Subscription) => {
    setEditingSubscription(subscription);

    setShowForm(true);
  };

  const handleAddNewClick = () => {
    setShowAddOptions(true);
  };

  const handleSelectImageUpload = () => {
    setShowAddOptions(false);
    setShowImageUpload(true);
  };

  const handleSelectManualForm = () => {
    setShowAddOptions(false);
    setShowManualForm(true);
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingSubscription(null);
  };

  const fetchSubscriptions = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Please log in to view subscriptions");
        dispatch(setSubscriptions([]));
        setIsInitialLoading(false);
        return;
      }

      const response = await fetchWithAuth(`/api/v1/subscriptions/user`, {
        method: "GET",
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch subscriptions: ${response.status}`);
      }

      const result = await response.json();
      if (result.success && result.data) {
        const subscriptionsData = Array.isArray(result.data)
          ? result.data
          : [result.data];
        dispatch(setSubscriptions(subscriptionsData));
      }
    } catch (error) {
      console.error("Error fetching subscriptions:", error);
      setError("Failed to load subscriptions");
    } finally {
      setIsInitialLoading(false);
    }
  }, [dispatch]);

  useEffect(() => {
    fetchSubscriptions();
  }, [fetchSubscriptions]);

  // ✅ SINGLE HANDLER FOR CREATE (used by both manual form and image upload)
  const handleCreateSuccess = useCallback(
    (newSubscription?: Subscription) => {
      setShowManualForm(false);
      setShowImageUpload(false);

      if (newSubscription && newSubscription._id) {
        const processedSub = processSubscriptionStatus(newSubscription);
        dispatch(createSubscription(processedSub));
        console.log("✅ Added subscription instantly:", newSubscription.name);
      } else {
        fetchSubscriptions();
      }
    },
    [dispatch, processSubscriptionStatus, fetchSubscriptions],
  );

  // ✅ SINGLE HANDLER FOR EDIT
  const handleEditSuccess = useCallback(
    (updatedSubscription?: Subscription) => {
      setShowForm(false);
      setEditingSubscription(null);

      if (updatedSubscription && updatedSubscription._id) {
        const processedSub = processSubscriptionStatus(updatedSubscription);
        dispatch(updateSubscription(processedSub));
        console.log(
          "✅ Updated subscription instantly:",
          updatedSubscription.name,
        );
      } else {
        fetchSubscriptions();
      }
    },
    [dispatch, processSubscriptionStatus, fetchSubscriptions],
  );

  const handleCancelSubscription = async (id: string) => {
    const subscriptionToCancel = subscriptions.find(
      (sub) => sub.id === id || sub._id === id,
    );
    if (!subscriptionToCancel) return;

    const isConfirmed = window.confirm(
      "Are you sure you want to cancel this subscription?",
    );
    if (!isConfirmed) return;

    setCancellingIds((prev) => new Set(prev).add(id));
    dispatch(updateSubscriptionStatus({ id, status: "cancelled" }));

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token");

      const response = await fetch(
        `/api/v1/subscriptions/${subscriptionToCancel._id}/cancel`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        dispatch(updateSubscriptionStatus({ id, status: "active" }));
        alert("Failed to cancel subscription");
      } else {
        alert("Subscription cancelled successfully!");
      }
    } catch (error) {
      console.error("Error cancelling subscription:", error);
      dispatch(updateSubscriptionStatus({ id, status: "active" }));
      alert("Failed to cancel subscription");
    } finally {
      setCancellingIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };

  const handleDeleteSubscription = async (id: string) => {
    const subscriptionToDelete = subscriptions.find(
      (sub) => sub.id === id || sub._id === id,
    );
    if (!subscriptionToDelete) return;

    const isConfirmed = window.confirm(
      "Are you sure you want to delete this subscription? This action cannot be undone.",
    );
    if (!isConfirmed) return;

    dispatch(deleteSubscription(id));

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token");

      const response = await fetch(
        `/api/v1/subscriptions/${subscriptionToDelete._id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        await fetchSubscriptions();
        alert("Failed to delete subscription");
      } else {
        alert("Subscription deleted successfully!");
      }
    } catch (error) {
      console.error("Error deleting subscription:", error);
      await fetchSubscriptions();
      alert("Failed to delete subscription");
    }
  };

  if (isInitialLoading) {
    return (
      <div className="flex-1 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading subscriptions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-4 sm:p-6">
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex justify-between items-center">
          <span className="text-red-800">{error}</span>
          <button
            onClick={() => setError(null)}
            className="text-red-500 hover:text-red-700"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      )}

      <div className="flex flex-col gap-4 mb-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <h2 className="text-xl sm:text-2xl font-bold">
            UPCOMING RENEWALS ({sortedActiveSubscriptions.length})
          </h2>
          <div className="hidden sm:flex items-center gap-4">
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSortClick("autoRenew")}
                className="flex items-center gap-2"
              >
                {getSortIcon("autoRenew")}
                {getSortButtonLabel("autoRenew")}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSortClick("nextBillingDate")}
                className="flex items-center gap-2"
              >
                {getSortIcon("nextBillingDate")}
                {getSortButtonLabel("nextBillingDate")}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSortClick("name")}
                className="flex items-center gap-2"
              >
                {getSortIcon("name")}
                {getSortButtonLabel("name")}
              </Button>
            </div>
            <Button
              onClick={handleAddNewClick}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Add New Subscription
            </Button>
          </div>
        </div>

        <div className="sm:hidden flex flex-col gap-3">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSortClick("autoRenew")}
              className="flex-1"
            >
              {getSortIcon("autoRenew")}
              <span className="text-xs ml-1">Auto Renew</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSortClick("nextBillingDate")}
              className="flex-1"
            >
              {getSortIcon("nextBillingDate")}
              <span className="text-xs ml-1">Next Billing</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSortClick("name")}
              className="flex-1"
            >
              {getSortIcon("name")}
              <span className="text-xs ml-1">Name</span>
            </Button>
          </div>
          <Button onClick={handleAddNewClick} className="w-full" size="sm">
            <Plus className="w-4 h-4 mr-2" /> Add New Subscription
          </Button>
        </div>
      </div>

      <section className="mb-8">
        <h3 className="text-lg font-semibold mb-4">Active Subscriptions</h3>
        <div className="grid gap-4">
          {sortedActiveSubscriptions.length > 0 ? (
            sortedActiveSubscriptions.map((subscription) => (
              <SubscriptionCard
                key={subscription._id || subscription.id}
                subscription={subscription}
                onCancel={handleCancelSubscription}
                onDelete={handleDeleteSubscription}
                isCancelling={cancellingIds.has(subscription.id)}
                onEdit={() => handleEditClick(subscription)}
              />
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground border rounded-lg">
              No active subscriptions. Add your first subscription to get
              started.
            </div>
          )}
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {expiredSubscriptions.length > 0 && (
          <ConditionalPaginatedSubscriptions
            title="Expired Subscriptions"
            subscriptions={expiredSubscriptions}
            onDelete={handleDeleteSubscription}
          />
        )}
        {cancelledSubscriptions.length > 0 && (
          <ConditionalPaginatedSubscriptions
            title="Cancelled Subscriptions"
            subscriptions={cancelledSubscriptions}
            onDelete={handleDeleteSubscription}
          />
        )}
      </div>

      <section className="mt-8 pt-6 border-t">
        <h3 className="text-lg font-semibold mb-4">
          All Subscriptions Summary
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 text-center">
          <div className="bg-green-50 p-3 sm:p-4 rounded-lg border">
            <div className="text-xl sm:text-2xl font-bold text-green-600">
              {activeSubscriptions.length}
            </div>
            <div className="text-xs sm:text-sm text-green-800">Active</div>
          </div>
          <div className="bg-yellow-50 p-3 sm:p-4 rounded-lg border">
            <div className="text-xl sm:text-2xl font-bold text-yellow-600">
              {expiredSubscriptions.length}
            </div>
            <div className="text-xs sm:text-sm text-yellow-800">Expired</div>
          </div>
          <div className="bg-red-50 p-3 sm:p-4 rounded-lg border">
            <div className="text-xl sm:text-2xl font-bold text-red-600">
              {cancelledSubscriptions.length}
            </div>
            <div className="text-xs sm:text-sm text-red-800">Cancelled</div>
          </div>
          <div className="bg-blue-50 p-3 sm:p-4 rounded-lg border">
            <div className="text-xl sm:text-2xl font-bold text-blue-600">
              {subscriptions.length}
            </div>
            <div className="text-xs sm:text-sm text-blue-800">Total</div>
          </div>
        </div>
      </section>

      {/* Edit Form Modal */}
      {showForm && (
        <SubscriptionForm
          mode="edit"
          subscription={editingSubscription || undefined}
          onCancel={handleFormCancel}
          onSuccess={handleEditSuccess}
        />
      )}

      {/* Add Subscription Options Modal */}
      <AddSubscriptionOptions
        isOpen={showAddOptions}
        onClose={() => setShowAddOptions(false)}
        onSelectImageUpload={handleSelectImageUpload}
        onSelectManualForm={handleSelectManualForm}
      />

      {/* Image Upload Modal */}
      <ImageUploadSubscription
        isOpen={showImageUpload}
        onClose={() => setShowImageUpload(false)}
        onSuccess={handleCreateSuccess}
      />

      {/* Manual Form Modal */}
      {showManualForm && (
        <SubscriptionForm
          mode="create"
          onCancel={() => setShowManualForm(false)}
          onSuccess={handleCreateSuccess}
        />
      )}
    </div>
  );
};

export default Dashboard;
