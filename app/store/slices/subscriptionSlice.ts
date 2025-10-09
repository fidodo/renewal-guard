// store/slices/subscriptionsSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

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
    | "deleted"
    | "inactive"
    | "pending";
  paymentMethod: string;
  autoRenew: boolean;
  sendReminders: boolean;
  notes?: string;
  phone?: string;
  tags?: string[];
  importance?: "low" | "medium" | "high" | "critical";
}

interface SubscriptionsState {
  subscriptions: Subscription[];
  loading: boolean;
  error: string | null;
  currentSubscription: Subscription | null; // For editing/viewing a single subscription
}

const initialState: SubscriptionsState = {
  subscriptions: [],
  loading: false,
  error: null,
  currentSubscription: null,
};

const subscriptionsSlice = createSlice({
  name: "subscriptions",
  initialState,
  reducers: {
    // Set loading state
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },

    // Set error message
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },

    // Set all subscriptions (for initial load)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setSubscriptions: (state, action: PayloadAction<any[]>) => {
      state.subscriptions = action.payload.map((item) => {
        // Each item should be a subscription object with _id
        return {
          ...item,
          id: item._id || item.id, // Convert _id to id for frontend
        };
      });
      state.loading = false;
      state.error = null;
    },

    // Add new subscription
    createSubscription: (state, action: PayloadAction<Subscription>) => {
      state.subscriptions.push(action.payload);
      state.loading = false;
      state.error = null;
    },

    // Update existing subscription
    updateSubscription: (state, action: PayloadAction<Subscription>) => {
      const index = state.subscriptions.findIndex(
        (sub) => sub.id === action.payload.id
      );
      if (index !== -1) {
        state.subscriptions[index] = action.payload;
      }
      state.loading = false;
      state.error = null;
    },

    // Update subscription by ID with partial data
    updateSubscriptionById: (
      state,
      action: PayloadAction<{ id: string; updates: Partial<Subscription> }>
    ) => {
      const index = state.subscriptions.findIndex(
        (sub) => sub.id === action.payload.id
      );
      if (index !== -1) {
        state.subscriptions[index] = {
          ...state.subscriptions[index],
          ...action.payload.updates,
        };
      }
    },

    // Delete subscription
    deleteSubscription: (state, action: PayloadAction<string>) => {
      state.subscriptions = state.subscriptions.filter(
        (sub) => sub.id !== action.payload
      );
      state.loading = false;
      state.error = null;
    },

    // Set current subscription for editing/viewing
    setCurrentSubscription: (
      state,
      action: PayloadAction<Subscription | null>
    ) => {
      state.currentSubscription = action.payload;
    },

    // Update current subscription field
    updateCurrentSubscription: (
      state,
      action: PayloadAction<Partial<Subscription>>
    ) => {
      if (state.currentSubscription) {
        state.currentSubscription = {
          ...state.currentSubscription,
          ...action.payload,
        };
      }
    },

    // Change subscription status
    updateSubscriptionStatus: (
      state,
      action: PayloadAction<{
        id: string;
        status:
          | "active"
          | "expired"
          | "cancelled"
          | "inactive"
          | "pending"
          | "deleted";
      }>
    ) => {
      const index = state.subscriptions.findIndex(
        (sub) => sub.id === action.payload.id
      );
      if (index !== -1) {
        state.subscriptions[index].status = action.payload.status;
      }
    },

    // Toggle auto-renew for a subscription
    toggleAutoRenew: (state, action: PayloadAction<string>) => {
      const index = state.subscriptions.findIndex(
        (sub) => sub.id === action.payload
      );
      if (index !== -1) {
        state.subscriptions[index].autoRenew =
          !state.subscriptions[index].autoRenew;
      }
    },

    // Toggle reminders for a subscription
    toggleReminders: (state, action: PayloadAction<string>) => {
      const index = state.subscriptions.findIndex(
        (sub) => sub.id === action.payload
      );
      if (index !== -1) {
        state.subscriptions[index].sendReminders =
          !state.subscriptions[index].sendReminders;
      }
    },

    // Clear all subscriptions
    clearSubscriptions: (state) => {
      state.subscriptions = [];
      state.currentSubscription = null;
      state.loading = false;
      state.error = null;
    },
  },
});

export const {
  setLoading,
  setError,
  setSubscriptions,
  createSubscription,
  updateSubscription,
  updateSubscriptionById,
  deleteSubscription,
  setCurrentSubscription,
  updateCurrentSubscription,
  updateSubscriptionStatus,
  toggleAutoRenew,
  toggleReminders,
  clearSubscriptions,
} = subscriptionsSlice.actions;

export default subscriptionsSlice.reducer;
