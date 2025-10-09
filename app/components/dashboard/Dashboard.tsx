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

const Dashboard = () => {
  const [showForm, setShowForm] = useState(false);
  const [cancellingIds, setCancellingIds] = useState<Set<string>>(new Set());
  const dispatch = useAppDispatch();

  // Get subscriptions from Redux store
  const subscriptions = useAppSelector(
    (state) => state.subscription.subscriptions
  );
  const loading = useAppSelector((state) => state.subscription.loading);

  // Fetch subscriptions from backend on component mount
  useEffect(() => {
    const fetchSubscriptions = async () => {
      try {
        const token =
          localStorage.getItem("authToken") || localStorage.getItem("token");
        if (!token) {
          console.log("No token found, skipping subscription fetch");
          return;
        }

        const response = await fetch(
          "http://localhost:5000/api/v1/subscriptions/user",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        // Simple and clean version
        if (response.ok) {
          const result = await response.json();
          console.log("🔍 Raw API response:", result);

          if (result.success && result.data) {
            const subscriptionsData = Array.isArray(result.data)
              ? result.data
              : [result.data];

            console.log("🔍 Processed subscriptions data:", subscriptionsData);
            dispatch(setSubscriptions(subscriptionsData));
          }
        } else {
          console.error("Failed to fetch subscriptions:", response.status);
        }
      } catch (error) {
        console.error("Error fetching subscriptions:", error);
      }
    };

    fetchSubscriptions();
  }, [dispatch]);

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
      const token =
        localStorage.getItem("authToken") || localStorage.getItem("token");
      if (!token) {
        alert("Please log in to cancel subscriptions");
        return;
      }

      const isConfirmed = window.confirm(
        "Are you sure you want to cancel this subscription?"
      );
      if (!isConfirmed) return;

      // Add to cancelling set to show loading state
      setCancellingIds((prev) => new Set(prev).add(id));
      console.log("Cancelling subscription with ID:", id);
      const response = await fetch(
        `http://localhost:5000/api/v1/subscriptions/${id}/cancel`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
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
      console.log(error);
    } finally {
      // Remove from cancelling set
      setCancellingIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };

  const handleDeleteSubscription = async (id: string) => {
    try {
      const token =
        localStorage.getItem("authToken") || localStorage.getItem("token");
      if (!token) {
        alert("Please log in to delete subscriptions");
        return;
      }

      const isConfirmed = window.confirm(
        "Are you sure you want to delete this subscription?"
      );
      if (!isConfirmed) return;

      const response = await fetch(
        `http://localhost:5000/api/v1/subscriptions/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const result = await response.json();
        console.log("✅ Subscription deleted:", result);

        dispatch(updateSubscriptionStatus({ id, status: "deleted" }));
        alert("Subscription deleted successfully!");
      } else {
        const errorData = await response.json();
        throw new Error(
          errorData.message ||
            `Failed to delete subscription: ${response.status}`
        );
      }
    } catch (error) {
      console.error("❌ Error deleting subscription:", error);
      console.log(error);
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
            <h3 className="text-lg font-semibold mb-4">
              Expired Subscriptions ({expiredSubscriptions.length})
            </h3>
            <div className="space-y-4">
              {expiredSubscriptions.map((subscription) => (
                <SubscriptionCard
                  key={subscription.id}
                  subscription={subscription}
                  onCancel={() => {}}
                  onDelete={handleDeleteSubscription}
                />
              ))}
            </div>
          </section>
        )}

        {/* Cancelled Subscriptions */}
        {cancelledSubscriptions.length > 0 && (
          <section>
            <h3 className="text-lg font-semibold mb-4">
              Cancelled Subscriptions ({cancelledSubscriptions.length})
            </h3>
            <div className="space-y-4">
              {cancelledSubscriptions.map((subscription) => (
                <SubscriptionCard
                  key={subscription.id}
                  subscription={subscription}
                  onCancel={handleCancelSubscription}
                  onDelete={handleDeleteSubscription}
                  isCancelling={cancellingIds.has(subscription.id)}
                />
              ))}
            </div>
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
      {showForm && <SubscriptionForm onCancel={() => setShowForm(false)} />}
    </div>
  );
};

export default Dashboard;
