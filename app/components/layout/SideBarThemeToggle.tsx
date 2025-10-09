// components/SidebarThemeToggle.tsx
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "../../hooks/useTheme";

export const SidebarThemeToggle = () => {
  const [isMounted, setIsMounted] = useState(false);
  const { toggleTheme, isDark } = useTheme();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <Button
      variant="ghost"
      onClick={toggleTheme}
      className="w-full justify-start px-3 py-2 h-auto"
      size="sm"
      suppressHydrationWarning
    >
      <div className="flex items-center">
        {!isMounted ? (
          <div className="w-4 h-4" />
        ) : isDark ? (
          <Sun className="w-4 h-4" />
        ) : (
          <Moon className="w-4 h-4" />
        )}
        <span className="ml-2 text-sm" suppressHydrationWarning>
          {!isMounted ? "Toggle Theme" : isDark ? "Light Mode" : "Dark Mode"}
        </span>
      </div>
    </Button>
  );
};
