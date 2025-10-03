"use client";

import { useEffect } from "react";
import { useAppDispatch } from "../hooks/redux";
import { setTheme } from "../store/slices/themeSlice";
import type { Theme } from "../store/slices/themeSlice";

export const ThemeInitializer = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
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

    const initialTheme = getInitialTheme();
    dispatch(setTheme(initialTheme));
  }, [dispatch]);
  return null;
};
