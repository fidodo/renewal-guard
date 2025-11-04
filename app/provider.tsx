"use client";

import { Provider } from "react-redux";
import { store } from "./store/store";
import { ThemeInitializer } from "./components/ThemeInitializer";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <ThemeInitializer />
      <main className="flex-1 ml-0 md:ml-32 lg:ml-64">
        {" "}
        {/* Match sidebar width */}
        {children}
      </main>
    </Provider>
  );
}
