// components/layout/Sidebar.tsx
"use client";
import Link from "next/link";
import { useTheme } from "../../hooks/useTheme";
import { Button } from "@/components/ui/button";
import {
  Moon,
  Sun,
  LogOut,
  BarChart3,
  Settings,
  HelpCircle,
} from "lucide-react";

const Sidebar = () => {
  const { toggleTheme, isDark } = useTheme();

  const menuItems = [
    { label: "Subscriptions", href: "#", icon: null },
    { label: "Analytics", href: "#", icon: BarChart3 },
    { label: "Settings", href: "#", icon: Settings },
    { label: "Help", href: "#", icon: HelpCircle },
  ];

  const handleLogout = () => {
    // Handle logout logic
    console.log("Logout clicked");
  };

  return (
    <div className="w-64 bg-background border-r h-screen p-6 flex flex-col">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Renewal Guard</h1>
      </div>

      {/* Navigation */}
      <nav className="space-y-1 flex-1">
        {menuItems.map((item) => {
          const IconComponent = item.icon;
          return (
            <Link
              key={item.label}
              href={item.href}
              className="flex items-center py-2 px-3 rounded-lg hover:bg-accent transition-colors text-sm"
            >
              {IconComponent && <IconComponent className="w-4 h-4 mr-3" />}
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom buttons - compact design */}
      <div className="space-y-3">
        {/* Theme Toggle Button */}
        <Button
          variant="ghost"
          onClick={toggleTheme}
          className="w-full justify-start px-3 py-2 h-auto"
          size="sm"
        >
          <div className="flex items-center">
            {isDark ? (
              <Sun className="w-4 h-4" />
            ) : (
              <Moon className="w-4 h-4" />
            )}
            <span className="ml-2 text-sm">
              {isDark ? "Light Mode" : "Dark Mode"}
            </span>
          </div>
        </Button>

        {/* Logout Button */}
        <Button
          variant="ghost"
          onClick={handleLogout}
          className="w-full justify-start px-3 py-2 h-auto"
          size="sm"
        >
          <div className="flex items-center">
            <LogOut className="w-4 h-4" />
            <span className="ml-2 text-sm">Logout</span>
          </div>
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;
