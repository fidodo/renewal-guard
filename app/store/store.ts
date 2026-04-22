// store/store.ts
import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage"; // uses localStorage
import themeReducer from "./slices/themeSlice";
import userReducer from "./slices/userSlice";
import subscriptionReducer from "./slices/subscriptionSlice";
import settingReducer from "./slices/settingSlice";

// Configure persistence for subscription data
const subscriptionPersistConfig = {
  key: "subscription",
  storage,
  whitelist: ["subscriptions"], // Persist only the subscriptions array
};

// Configure persistence for user data (optional)
const userPersistConfig = {
  key: "user",
  storage,
  whitelist: ["user", "isAuthenticated"], // Persist user data
};

// Configure persistence for theme
const themePersistConfig = {
  key: "theme",
  storage,
  whitelist: ["current"], // Persist theme preference
};

const rootReducer = combineReducers({
  theme: persistReducer(themePersistConfig, themeReducer),
  user: persistReducer(userPersistConfig, userReducer),
  subscription: persistReducer(subscriptionPersistConfig, subscriptionReducer),
  setting: settingReducer, // Don't persist settings if not needed
});

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore redux-persist actions
        ignoredActions: [
          "persist/PERSIST",
          "persist/REHYDRATE",
          "persist/REGISTER",
        ],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
