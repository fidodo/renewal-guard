"use client";
import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import SubscriptionCard from "./SubscriptionCard";
import SubscriptionForm from "./SubscriptionForm";
import {
  setSubscriptions,
  updateSubscriptionStatus,
} from "../../store/slices/subscriptionSlice";
import { useAuth } from "../../hooks/useAuth";
import { ConditionalPaginatedSubscriptions } from "./ConditionalPaginatedSubscriptions";

// Enhanced fetch with auto-retry (local version)
export const fetchWithAuth = async (
  url: string,
  options: RequestInit = {}
): Promise<Response> => {
  const token = localStorage.getItem("token"); // Changed to const

  const requestOptions: RequestInit = {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  };

  if (token) {
    requestOptions.headers = {
      ...requestOptions.headers,
      Authorization: `Bearer ${token}`,
    };
  }

  let response = await fetch(url, requestOptions);

  // If token expired, try to refresh and retry
  if (response.status === 401) {
    console.log("🔄 Token expired, attempting refresh...");

    // Refresh token logic
    const refreshToken = localStorage.getItem("refreshToken");
    if (refreshToken) {
      try {
        const refreshResponse = await fetch(
          "http://localhost:5000/api/v1/auth/refresh-token",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ refreshToken }),
          }
        );

        if (refreshResponse.ok) {
          const refreshData = await refreshResponse.json();
          if (refreshData.success && refreshData.data?.token) {
            localStorage.setItem("token", refreshData.data.token);
            // Get the new token for retry
            const newToken = refreshData.data.token;
            // Retry with new token
            requestOptions.headers = {
              ...requestOptions.headers,
              Authorization: `Bearer ${newToken}`,
            };
            response = await fetch(url, requestOptions);
          }
        }
      } catch (error) {
        console.error("Token refresh failed:", error);
      }
    }
  }

  return response;
};

const Dashboard = () => {
  const [showForm, setShowForm] = useState(false);
  const [cancellingIds, setCancellingIds] = useState<Set<string>>(new Set());
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAuth();

  // Get subscriptions from Redux store
  const subscriptions = useAppSelector(
    (state) => state.subscription.subscriptions
  );
  const loading = useAppSelector((state) => state.subscription.loading);

  // Fetch subscriptions from backend on component mount
  const fetchSubscriptions = async () => {
    try {
      console.log("🔄 Fetching subscriptions...");

      const response = await fetchWithAuth(
        "http://localhost:5000/api/v1/subscriptions/user"
      );

      if (response.ok) {
        const result = await response.json();
        console.log("🔍 Raw API response:", result);

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
      } else {
        console.error("Failed to fetch subscriptions:", response.status);
        dispatch(setSubscriptions([]));
      }
    } catch (error) {
      console.error("❌ Error fetching subscriptions:", error);
      // Proper error handling for unknown type
      if (error instanceof Error) {
        console.error("Error details:", error.message);
      }
      dispatch(setSubscriptions([]));
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchSubscriptions();
    } else {
      dispatch(setSubscriptions([]));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, dispatch]);

  // Filter subscriptions by status
  const activeSubscriptions = subscriptions.filter(
    (sub) => sub.status === "active"
  );
  const expiredSubscriptions = subscriptions.filter(
    (sub) => sub.status === "expired"
  );
  const cancelledSubscriptions = subscriptions.filter(
    (sub) => sub.status === "cancelled"
  );

  const handleCancelSubscription = async (id: string) => {
    try {
      const isConfirmed = window.confirm(
        "Are you sure you want to cancel this subscription?"
      );
      if (!isConfirmed) return;

      setCancellingIds((prev) => new Set(prev).add(id));
      console.log("Cancelling subscription with ID:", id);

      const response = await fetchWithAuth(
        `http://localhost:5000/api/v1/subscriptions/${id}/cancel`,
        {
          method: "PATCH",
        }
      );

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
      // Proper error handling for unknown type
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

      const response = await fetchWithAuth(
        `http://localhost:5000/api/v1/subscriptions/${id}`,
        {
          method: "DELETE",
        }
      );

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
      // Proper error handling for unknown type
      if (error instanceof Error) {
        alert(error.message || "Failed to delete subscription");
      } else {
        alert("Failed to delete subscription");
      }
    }
  };

  const handleSubscriptionAdded = () => {
    setShowForm(false);
    fetchSubscriptions();
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

  return (
    <div className="flex-1 p-6">
      {/* Header with Add Subscription Button */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">
          UPCOMING RENEWALS ({activeSubscriptions.length})
        </h2>
        <Button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add New Subscription
        </Button>
      </div>

      {/* Active Subscriptions Section */}
      <section className="mb-8">
        <h3 className="text-lg font-semibold mb-4">Active Subscriptions</h3>
        <div className="grid gap-4">
          {activeSubscriptions.length > 0 ? (
            activeSubscriptions.map((subscription) => (
              <SubscriptionCard
                key={subscription.id}
                subscription={subscription}
                onCancel={handleCancelSubscription}
                onDelete={handleDeleteSubscription}
                isCancelling={cancellingIds.has(subscription.id)}
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
        {expiredSubscriptions.length > 0 && (
          <section>
            <ConditionalPaginatedSubscriptions
              title="Expired Subscriptions"
              subscriptions={expiredSubscriptions}
              onDelete={handleDeleteSubscription}
            />
          </section>
        )}

        {/* Cancelled Subscriptions */}
        {cancelledSubscriptions.length > 0 && (
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
              {activeSubscriptions.length}
            </div>
            <div className="text-sm text-green-800">Active</div>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg border">
            <div className="text-2xl font-bold text-yellow-600">
              {expiredSubscriptions.length}
            </div>
            <div className="text-sm text-yellow-800">Expired</div>
          </div>
          <div className="bg-red-50 p-4 rounded-lg border">
            <div className="text-2xl font-bold text-red-600">
              {cancelledSubscriptions.length}
            </div>
            <div className="text-sm text-red-800">Cancelled</div>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg border">
            <div className="text-2xl font-bold text-blue-600">
              {subscriptions.length}
            </div>
            <div className="text-sm text-blue-800">Total</div>
          </div>
        </div>
      </section>

      {/* Subscription Form Modal */}
      {showForm && (
        <SubscriptionForm
          onCancel={() => setShowForm(false)}
          onSuccess={handleSubscriptionAdded}
        />
      )}
    </div>
  );
};

export default Dashboard;
