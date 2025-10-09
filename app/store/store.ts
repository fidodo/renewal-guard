// store/store.ts
import { configureStore } from "@reduxjs/toolkit";
import themeReducer from "./slices/themeSlice";
import userReducer from "./slices/userSlice";
import subscriptionReducer from "./slices/subscriptionSlice";
import settingReducer from "./slices/settingSlice";
// ... import your other reducers

export const store = configureStore({
  reducer: {
    theme: themeReducer,
    user: userReducer,
    subscription: subscriptionReducer,
    setting: settingReducer,

    // ... your other reducers
  },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
