import { render as rtlRender } from "@testing-library/react";

// Mock store creator that doesn't use real Redux
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const createTestStore = (preloadedState: any = {}) => {
  const state = {
    theme: { current: "light" },
    user: { user: null, token: null, isLoading: false },
    subscription: { subscriptions: [], loading: false, error: null },
    setting: {
      setting: {
        emailNotifications: true,
        pushNotifications: false,
        reminderDays: [1, 7, 30],
      },
      loading: false,
      error: null,
    },
    ...preloadedState,
  };

  return {
    getState: () => state,
    dispatch: jest.fn(),
    subscribe: jest.fn(),
    replaceReducer: jest.fn(),
  };
};

// Simple render function
export const render = rtlRender;

// Re-export everything from testing library
export * from "@testing-library/react";
