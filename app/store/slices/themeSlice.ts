// store/slices/themeSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type Theme = "light" | "dark";

export interface ThemeState {
  current: Theme;
}

// Get initial theme from sessionStorage or system preference
const getInitialTheme = (): Theme => {
  if (typeof window !== "undefined") {
    const savedTheme = sessionStorage.getItem("theme") as Theme;
    if (savedTheme && (savedTheme === "light" || savedTheme === "dark")) {
      return savedTheme;
    }

    // Fallback to system preference
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }
  return "light";
};

const initialState: ThemeState = {
  current: getInitialTheme(),
};

const themeSlice = createSlice({
  name: "theme",
  initialState,
  reducers: {
    toggleTheme: (state) => {
      state.current = state.current === "light" ? "dark" : "light";

      // Persist to sessionStorage
      if (typeof window !== "undefined") {
        sessionStorage.setItem("theme", state.current);
        document.documentElement.classList.toggle(
          "dark",
          state.current === "dark",
        );
      }
    },
    setTheme: (state, action: PayloadAction<Theme>) => {
      state.current = action.payload;

      if (typeof window !== "undefined") {
        sessionStorage.setItem("theme", action.payload);
        document.documentElement.classList.toggle(
          "dark",
          action.payload === "dark",
        );
      }
    },
  },
});

export const { toggleTheme, setTheme } = themeSlice.actions;
export default themeSlice.reducer;

export const getStatusColors = (theme: Theme) => {
  const isLight = theme === "light";

  if (!isLight) {
    // Dark theme - return default/neutral colors (no colored backgrounds)
    return {
      active: {
        border: "border-gray-700",
        bg: "", // No background color
        badge: "bg-gray-800 text-gray-300",
        header: "text-gray-300",
        icon: "text-gray-400",
        button: "border-gray-700 text-gray-300 hover:bg-gray-800",
        dot: "bg-gray-500",
      },
      expired: {
        border: "border-gray-700",
        bg: "",
        badge: "bg-gray-800 text-gray-300",
        header: "text-gray-300",
        icon: "text-gray-400",
        button: "border-gray-700 text-gray-300 hover:bg-gray-800",
        dot: "bg-gray-500",
      },
      cancelled: {
        border: "border-gray-700",
        bg: "",
        badge: "bg-gray-800 text-gray-300",
        header: "text-gray-300",
        icon: "text-gray-400",
        button: "border-gray-700 text-gray-300 hover:bg-gray-800",
        dot: "bg-gray-500",
      },
      default: {
        border: "border-gray-700",
        bg: "",
        badge: "bg-gray-800 text-gray-300",
        header: "text-gray-300",
        icon: "text-gray-400",
        button: "border-gray-700 text-gray-300 hover:bg-gray-800",
        dot: "bg-gray-500",
      },
    };
  }

  // Light theme - return colored backgrounds
  return {
    active: {
      border: "border-green-300",
      bg: "bg-green-50",
      badge: "bg-green-100 text-green-800",
      header: "text-green-700",
      icon: "text-green-500",
      button: "border-green-300 text-green-700 hover:bg-green-100",
      dot: "bg-green-500",
    },
    expired: {
      border: "border-yellow-300",
      bg: "bg-yellow-50",
      badge: "bg-yellow-100 text-yellow-800",
      header: "text-yellow-700",
      icon: "text-yellow-500",
      button: "border-yellow-300 text-yellow-700 hover:bg-yellow-100",
      dot: "bg-yellow-500",
    },
    cancelled: {
      border: "border-red-300",
      bg: "bg-red-50",
      badge: "bg-red-100 text-red-800",
      header: "text-red-700",
      icon: "text-red-500",
      button: "border-red-300 text-red-700 hover:bg-red-100",
      dot: "bg-red-500",
    },
    default: {
      border: "border-gray-300",
      bg: "bg-gray-50",
      badge: "bg-gray-100 text-gray-800",
      header: "text-gray-700",
      icon: "text-gray-500",
      button: "border-gray-300 text-gray-700 hover:bg-gray-100",
      dot: "bg-gray-500",
    },
  };
};
