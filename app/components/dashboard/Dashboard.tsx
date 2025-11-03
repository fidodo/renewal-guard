"use client";
import { useState, useMemo, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import { Button } from "@/components/ui/button";
import SubscriptionCard from "./SubscriptionCard";
import SubscriptionForm from "./SubscriptionForm";
import {
  setSubscriptions,
  updateSubscriptionStatus,
} from "../../store/slices/subscriptionSlice";

import { ConditionalPaginatedSubscriptions } from "./ConditionalPaginatedSubscriptions";
import { Subscription } from "./SubscriptionForm";
import { ArrowUpDown, ArrowUp, ArrowDown, Plus } from "lucide-react";
import { refreshAuthToken } from "@/app/hooks/refresh-token";

const Dashboard = () => {
  const [showForm, setShowForm] = useState(false);
  const [cancellingIds, setCancellingIds] = useState<Set<string>>(new Set());
  const dispatch = useAppDispatch();

  const [error, setError] = useState<string | null>(null);
  const [editingSubscription, setEditingSubscription] =
    useState<Subscription | null>(null);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [sortBy, setSortBy] = useState<
    "autoRenew" | "nextBillingDate" | "name"
  >("nextBillingDate");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  interface ApiResponse<T> {
    success: boolean;
    message?: string;
    error?: string;
    data?: T;
  }

  // const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Get subscriptions from Redux store
  const subscriptions = useAppSelector(
    (state) => state.subscription.subscriptions
  );
  const loading = useAppSelector((state) => state.subscription.loading);

  // Filter subscriptions by status
  const activeSubscriptions = subscriptions?.filter(
    (sub) => sub.status === "active"
  );
  const expiredSubscriptions = subscriptions?.filter(
    (sub) => sub.status === "expired"
  );
  const cancelledSubscriptions = subscriptions?.filter(
    (sub) => sub.status === "cancelled"
  );

  const sortedActiveSubscriptions = useMemo(() => {
    return [...(activeSubscriptions ?? [])].sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case "autoRenew":
          // Sort by autoRenew (true first, then false)
          aValue = a.autoRenew ? 1 : 0;
          bValue = b.autoRenew ? 1 : 0;
          break;

        case "nextBillingDate":
          // Sort by next billing date
          aValue = new Date(a.billingDate.nextBillingDate).getTime();
          bValue = new Date(b.billingDate.nextBillingDate).getTime();
          break;

        case "name":
          // Sort by subscription name
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;

        default:
          return 0;
      }

      // Apply sort order
      if (sortOrder === "asc") {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });
  }, [activeSubscriptions, sortBy, sortOrder]);

  // Handle sort button click
  const handleSortClick = (
    newSortBy: "autoRenew" | "nextBillingDate" | "name"
  ) => {
    if (sortBy === newSortBy) {
      // Toggle sort order if clicking the same sort type
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      // Set new sort type and default to ascending
      setSortBy(newSortBy);
      setSortOrder("asc");
    }
  };

  // Get sort icon based on current sort state
  const getSortIcon = (column: "autoRenew" | "nextBillingDate" | "name") => {
    if (sortBy !== column) {
      return <ArrowUpDown className="w-4 h-4" />;
    }
    return sortOrder === "asc" ? (
      <ArrowUp className="w-4 h-4" />
    ) : (
      <ArrowDown className="w-4 h-4" />
    );
  };

  // Get sort button label
  const getSortButtonLabel = (
    column: "autoRenew" | "nextBillingDate" | "name"
  ) => {
    const labels = {
      autoRenew: "Auto Renew",
      nextBillingDate: "Next Billing",
      name: "Name",
    };

    if (sortBy === column) {
      return `${labels[column]} ${sortOrder === "asc" ? "↑" : "↓"}`;
    }

    return labels[column];
  };

  // Handle Edit button click from SubscriptionCard
  const handleEditClick = (subscription: Subscription) => {
    setEditingSubscription(subscription);
    setFormMode("edit");
    setShowForm(true);
  };

  // Handle Add New Subscription button click
  const handleAddNewClick = () => {
    setEditingSubscription(null);
    setFormMode("create");
    setShowForm(true);
  };

  // Handle form success
  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingSubscription(null);
    // Refresh your subscriptions data here
    fetchSubscriptions();
  };

  // Handle form cancel
  const handleFormCancel = () => {
    setShowForm(false);
    setEditingSubscription(null);
  };

  // Fetch subscriptions from backend on component mount
  const fetchSubscriptions = async () => {
    try {
      console.log("🔄 Fetching subscriptions...");

      // Get token from localStorage
      const token = localStorage.getItem("token");

      if (!token) {
        console.error("No authentication token found");
        setError("Please log in to view subscriptions");
        dispatch(setSubscriptions([]));
        return;
      }

      const response = await fetch(
        "http://localhost:5000/api/v1/subscriptions/user",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("📊 Response status:", response.status);

      // Handle 401 - Token expired or invalid
      if (response.status === 401) {
        console.log("Token expired, attempting refresh...");
        const refreshSuccess = await refreshAuthToken();

        if (refreshSuccess) {
          // Retry the request with new token
          const newToken = localStorage.getItem("token");
          if (newToken) {
            const retryResponse = await fetch(
              "http://localhost:5000/api/v1/subscriptions/user",
              {
                method: "GET",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${newToken}`,
                },
              }
            );

            if (retryResponse.ok) {
              const result = await retryResponse.json();
              await handleSuccessfulResponse(result);
              return;
            }
          }
        }

        // If refresh failed or retry failed
        setError("Session expired. Please log in again.");
        dispatch(setSubscriptions([]));
        return;
      }

      if (!response.ok) {
        const errorMessage = `Failed to fetch subscriptions: ${response.status}`;
        console.error("Failed to fetch subscriptions:", response.status);
        setError(errorMessage);
        dispatch(setSubscriptions([]));
        return;
      }

      const result = await response.json();
      await handleSuccessfulResponse(result);
    } catch (error) {
      console.error("❌ Error fetching subscriptions:", error);
      if (error instanceof Error) {
        setError(`Network error: ${error.message}`);
      } else {
        setError("An unexpected error occurred");
      }
      dispatch(setSubscriptions([]));
    }
  };

  // Helper function to handle successful responses
  const handleSuccessfulResponse = async (
    result: ApiResponse<Subscription[]>
  ) => {
    console.log("🔍 Raw API response:", result);

    if (!result.success) {
      console.error("API returned error:", result.message || result.error);
      setError(result.message || "Failed to fetch subscriptions");
      dispatch(setSubscriptions([]));
      return;
    }

    if (result.success && result.data) {
      const subscriptionsData = Array.isArray(result.data)
        ? result.data
        : [result.data];

      console.log("✅ Setting subscriptions:", subscriptionsData);
      dispatch(setSubscriptions(subscriptionsData));
    } else {
      console.warn("No subscriptions data found in response");
      dispatch(setSubscriptions([]));
    }
  };
  useEffect(() => {
    fetchSubscriptions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCancelSubscription = async (id: string) => {
    try {
      const isConfirmed = window.confirm(
        "Are you sure you want to cancel this subscription?"
      );
      if (!isConfirmed) return;

      setCancellingIds((prev) => new Set(prev).add(id));

      const token = localStorage.getItem("token");
      if (!token) {
        alert("Please log in to perform this action");
        return;
      }

      const response = await fetch(
        `http://localhost:5000/api/v1/subscriptions/${id}/cancel`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Handle 401 - Token expired
      if (response.status === 401) {
        const refreshSuccess = await refreshAuthToken();
        if (refreshSuccess) {
          // Retry with new token
          const newToken = localStorage.getItem("token");
          if (newToken) {
            const retryResponse = await fetch(
              `http://localhost:5000/api/v1/subscriptions/${id}/cancel`,
              {
                method: "PATCH",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${newToken}`,
                },
              }
            );

            if (retryResponse.ok) {
              const result = await retryResponse.json();
              console.log("✅ Subscription cancelled:", result);
              dispatch(updateSubscriptionStatus({ id, status: "cancelled" }));
              alert("Subscription cancelled successfully!");
              return;
            }
          }
        }

        alert("Session expired. Please log in again.");
        return;
      }

      if (response.ok) {
        const result = await response.json();
        console.log("✅ Subscription cancelled:", result);
        dispatch(updateSubscriptionStatus({ id, status: "cancelled" }));
        alert("Subscription cancelled successfully!");
      } else {
        const errorData = await response.json();
        throw new Error(
          errorData.message ||
            `Failed to cancel subscription: ${response.status}`
        );
      }
    } catch (error) {
      console.error("❌ Error cancelling subscription:", error);
      if (error instanceof Error) {
        alert(error.message || "Failed to cancel subscription");
      } else {
        alert("Failed to cancel subscription");
      }
    } finally {
      setCancellingIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };
  const handleDeleteSubscription = async (id: string) => {
    try {
      const isConfirmed = window.confirm(
        "Are you sure you want to delete this subscription? This action cannot be undone."
      );
      if (!isConfirmed) return;

      const token = localStorage.getItem("token");
      if (!token) {
        alert("Please log in to perform this action");
        return;
      }

      const response = await fetch(
        `http://localhost:5000/api/v1/subscriptions/${id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Handle 401 - Token expired
      if (response.status === 401) {
        const refreshSuccess = await refreshAuthToken();
        if (refreshSuccess) {
          // Retry with new token
          const newToken = localStorage.getItem("token");
          if (newToken) {
            const retryResponse = await fetch(
              `http://localhost:5000/api/v1/subscriptions/${id}`,
              {
                method: "DELETE",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${newToken}`,
                },
              }
            );

            if (retryResponse.ok) {
              const result = await retryResponse.json();
              console.log("✅ Subscription deleted:", result);
              dispatch(updateSubscriptionStatus({ id, status: "deleted" }));
              alert("Subscription deleted successfully!");
              fetchSubscriptions();
              return;
            }
          }
        }

        alert("Session expired. Please log in again.");
        return;
      }

      if (response.ok) {
        const result = await response.json();
        console.log("✅ Subscription deleted:", result);
        dispatch(updateSubscriptionStatus({ id, status: "deleted" }));
        alert("Subscription deleted successfully!");
        fetchSubscriptions();
      } else {
        const errorData = await response.json();
        throw new Error(
          errorData.message ||
            `Failed to delete subscription: ${response.status}`
        );
      }
    } catch (error) {
      console.error("❌ Error deleting subscription:", error);
      if (error instanceof Error) {
        alert(error.message || "Failed to delete subscription");
      } else {
        alert("Failed to delete subscription");
      }
    }
  };

  if (loading) {
    return (
      <div className="flex-1 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading subscriptions...</p>
        </div>
      </div>
    );
  }

  // Function to clear error
  const clearError = () => {
    setError(null);
  };

  return (
    <div className="flex-1 p-6">
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex justify-between items-center">
          <div className="flex items-center">
            <svg
              className="w-5 h-5 text-red-500 mr-2"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-red-800">{error}</span>
          </div>
          <button
            onClick={clearError}
            className="text-red-500 hover:text-red-700 focus:outline-none"
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
      {/* Header with Add Subscription Button */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">
          UPCOMING RENEWALS ({sortedActiveSubscriptions.length})
        </h2>
        <div className="flex justify-between items-center mb-6">
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
        </div>
        <Button onClick={handleAddNewClick} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add New Subscription
        </Button>
      </div>

      {/* Active Subscriptions Section */}
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
                isCancelling={cancellingIds.has(subscription.id || "")}
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

      {/* Other Subscription Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Expired Subscriptions */}
        {expiredSubscriptions?.length > 0 && (
          <section>
            <ConditionalPaginatedSubscriptions
              title="Expired Subscriptions"
              subscriptions={expiredSubscriptions}
              onDelete={handleDeleteSubscription}
            />
          </section>
        )}

        {/* Cancelled Subscriptions */}
        {cancelledSubscriptions?.length > 0 && (
          <section>
            <ConditionalPaginatedSubscriptions
              title="Cancelled Subscriptions"
              subscriptions={cancelledSubscriptions}
              onDelete={handleDeleteSubscription}
            />
          </section>
        )}
      </div>

      {/* All Subscriptions Summary */}
      <section className="mt-8 pt-6 border-t">
        <h3 className="text-lg font-semibold mb-4">
          All Subscriptions Summary
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
          <div className="bg-green-50 p-4 rounded-lg border">
            <div className="text-2xl font-bold text-green-600">
              {activeSubscriptions?.length}
            </div>
            <div className="text-sm text-green-800">Active</div>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg border">
            <div className="text-2xl font-bold text-yellow-600">
              {expiredSubscriptions?.length}
            </div>
            <div className="text-sm text-yellow-800">Expired</div>
          </div>
          <div className="bg-red-50 p-4 rounded-lg border">
            <div className="text-2xl font-bold text-red-600">
              {cancelledSubscriptions?.length}
            </div>
            <div className="text-sm text-red-800">Cancelled</div>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg border">
            <div className="text-2xl font-bold text-blue-600">
              {subscriptions?.length}
            </div>
            <div className="text-sm text-blue-800">Total</div>
          </div>
        </div>
      </section>

      {/* Subscription Form Modal */}
      {showForm && (
        <SubscriptionForm
          mode={formMode}
          subscription={editingSubscription || undefined}
          onCancel={handleFormCancel}
          onSuccess={handleFormSuccess}
        />
      )}
    </div>
  );
};

export default Dashboard;
