// store/slices/themeSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type Theme = "light" | "dark";

interface ThemeState {
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
          state.current === "dark"
        );
      }
    },
    setTheme: (state, action: PayloadAction<Theme>) => {
      state.current = action.payload;

      if (typeof window !== "undefined") {
        sessionStorage.setItem("theme", action.payload);
        document.documentElement.classList.toggle(
          "dark",
          action.payload === "dark"
        );
      }
    },
  },
});

export const { toggleTheme, setTheme } = themeSlice.actions;
export default themeSlice.reducer;
