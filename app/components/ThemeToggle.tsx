// app/components/ThemeToggle.tsx
"use client";
import { useEffect, useState } from "react";
import { SunIcon, MoonIcon } from "lucide-react";
import { useTheme } from "../hooks/useTheme";

const ThemeToggle = () => {
  const [isClient, setIsClient] = useState(false);
  const { theme, toggleTheme, isDark } = useTheme();

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null; // Render nothing on server
  }

  return (
    <button
      onClick={toggleTheme}
      className="relative inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-background p-2 text-sm font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      type="button"
    >
      {isDark ? (
        <SunIcon className="h-4 w-4" />
      ) : (
        <MoonIcon className="h-4 w-4" />
      )}
      <span className="sr-only">Toggle theme: {theme}</span>
    </button>
  );
};

export default ThemeToggle;
