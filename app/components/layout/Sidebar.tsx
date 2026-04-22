// components/layout/Sidebar.tsx
"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";
import { SidebarThemeToggle } from "./SideBarThemeToggle";
import { useState } from "react";

import { useAuth } from "@/app/hooks/useAuth";
import { useLogout } from "@/app/hooks/useLogout";
import { useAuthSync } from "@/app/hooks/useAuthSync";

import {
  LogOut,
  BarChart3,
  Settings,
  HelpCircle,
  CreditCard,
} from "lucide-react";

const menuItems = [
  { label: "Subscriptions", href: "/dashboard", icon: CreditCard },
  { label: "Analytics", href: "/analytics", icon: BarChart3 },
  { label: "Sub-Settings", href: "/settings", icon: Settings },
  { label: "Help", href: "/help", icon: HelpCircle },
];

const Sidebar = () => {
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { logout } = useLogout();

  useAuthSync();

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    await logout();
    setIsLoggingOut(false);
  };

  return (
    <div className="w-64 bg-background border-r h-screen p-6 flex flex-col  fixed left-0 top-0 overflow-y-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Renewal Guard</h1>
      </div>

      {/* Navigation */}
      <nav className="space-y-1 flex-1">
        {menuItems.map((item) => {
          const IconComponent = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center py-2 px-3 rounded-lg transition-colors text-sm ${
                isActive
                  ? "bg-accent text-accent-foreground"
                  : "hover:bg-accent hover:text-accent-foreground"
              }`}
            >
              {IconComponent && <IconComponent className="w-4 h-4 mr-3" />}
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="space-y-3 mt-auto">
        <SidebarThemeToggle />

        {isAuthenticated ? (
          <Button
            variant="ghost"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="w-full justify-start px-3 py-2 h-auto"
            size="sm"
          >
            <div className="flex items-center">
              <LogOut className="w-4 h-4" />
              <span className="ml-2 text-sm">
                {isLoggingOut ? "Logging out..." : "Logout"}
              </span>
            </div>
          </Button>
        ) : (
          // Login/Signup buttons for unauthenticated users
          <div className="space-y-2">
            <Link href="/loginPage" className="w-full">
              <Button
                variant="default"
                className="w-full justify-center px-3 py-2 h-auto"
                size="sm"
              >
                Login
              </Button>
            </Link>
            <Link href="/register" className="w-full">
              <Button
                variant="outline"
                className="w-full justify-center px-3 py-2 h-auto"
                size="sm"
              >
                Sign Up
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
