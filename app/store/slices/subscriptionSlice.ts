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

export interface SubscriptionsState {
  subscriptions: Subscription[];
  loading: boolean;
  error: string | null;
  currentSubscription: Subscription | null;
}

export const initialState: SubscriptionsState = {
  subscriptions: [],
  loading: false,
  error: null,
  currentSubscription: null,
};

// ✅ Type-safe normalize function
const normalizeSubscription = (
  item: Partial<Subscription> & { _id?: string; id?: string },
): Subscription => {
  return {
    name: item.name || "",
    serviceName: item.serviceName || "",
    description: item.description,
    category: item.category || "",
    price: item.price || {
      amount: 0,
      currency: "USD",
      billingCycle: "monthly",
    },
    billingDate: item.billingDate || {
      startDate: new Date().toISOString(),
      nextBillingDate: new Date().toISOString(),
    },
    status: item.status || "active",
    paymentMethod: item.paymentMethod || "",
    autoRenew: item.autoRenew ?? true,
    sendReminders: item.sendReminders ?? true,
    notes: item.notes,
    phone: item.phone,
    tags: item.tags,
    importance: item.importance || "medium",
    id: item._id || item.id || "",
    _id: item._id,
  };
};

// ✅ Type-safe find index function
const findSubscriptionIndex = (
  subscriptions: Subscription[],
  id: string,
): number => {
  return subscriptions.findIndex((sub) => sub.id === id || sub._id === id);
};

const subscriptionsSlice = createSlice({
  name: "subscriptions",
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },

    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },

    // Set all subscriptions (for initial load)
    setSubscriptions: (state, action: PayloadAction<Subscription[]>) => {
      state.subscriptions = action.payload.map(normalizeSubscription);
      state.loading = false;
      state.error = null;
    },

    // Add new subscription
    createSubscription: (state, action: PayloadAction<Subscription>) => {
      const normalizedSub = normalizeSubscription(action.payload);
      const exists = state.subscriptions.some(
        (sub) => sub.id === normalizedSub.id || sub._id === normalizedSub._id,
      );
      if (!exists) {
        state.subscriptions.push(normalizedSub);
      }
      state.loading = false;
      state.error = null;
    },

    // Update existing subscription
    updateSubscription: (state, action: PayloadAction<Subscription>) => {
      const normalizedSub = normalizeSubscription(action.payload);
      const index = findSubscriptionIndex(
        state.subscriptions,
        normalizedSub.id,
      );
      if (index !== -1) {
        state.subscriptions[index] = normalizedSub;
      }
      state.loading = false;
      state.error = null;
    },

    // Update subscription by ID with partial data
    updateSubscriptionById: (
      state,
      action: PayloadAction<{ id: string; updates: Partial<Subscription> }>,
    ) => {
      const index = findSubscriptionIndex(
        state.subscriptions,
        action.payload.id,
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
        (sub) => sub.id !== action.payload && sub._id !== action.payload,
      );
      state.loading = false;
      state.error = null;
    },

    setCurrentSubscription: (
      state,
      action: PayloadAction<Subscription | null>,
    ) => {
      state.currentSubscription = action.payload
        ? normalizeSubscription(action.payload)
        : null;
    },

    updateCurrentSubscription: (
      state,
      action: PayloadAction<Partial<Subscription>>,
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
      }>,
    ) => {
      const index = findSubscriptionIndex(
        state.subscriptions,
        action.payload.id,
      );
      if (index !== -1) {
        state.subscriptions[index].status = action.payload.status;
      }
      state.loading = false;
      state.error = null;
    },

    // Toggle auto-renew for a subscription
    toggleAutoRenew: (state, action: PayloadAction<string>) => {
      const index = findSubscriptionIndex(state.subscriptions, action.payload);
      if (index !== -1) {
        state.subscriptions[index].autoRenew =
          !state.subscriptions[index].autoRenew;
      }
    },

    // Toggle reminders for a subscription
    toggleReminders: (state, action: PayloadAction<string>) => {
      const index = findSubscriptionIndex(state.subscriptions, action.payload);
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
