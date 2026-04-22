"use client";

import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "./store/store";
import { ThemeInitializer } from "./components/ThemeInitializer";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <PersistGate
        loading={<div>Loading saved data...</div>}
        persistor={persistor}
      >
        <ThemeInitializer />
        {children}
      </PersistGate>
    </Provider>
  );
}
