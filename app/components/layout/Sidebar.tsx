// components/layout/Sidebar.tsx
"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";
import { SidebarThemeToggle } from "./SideBarThemeToggle";
import { useAuth } from "../../hooks/useAuth";
import { useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { clearUser } from "../../store/slices/userSlice";
import { useRouter } from "next/navigation";

import {
  LogOut,
  BarChart3,
  Settings,
  HelpCircle,
  CreditCard,
  User,
} from "lucide-react";

const menuItems = [
  { label: "Subscriptions", href: "/dashboard", icon: CreditCard },
  { label: "Analytics", href: "/analytics", icon: BarChart3 },
  { label: "Settings", href: "/settings", icon: Settings },
  { label: "Help", href: "/help", icon: HelpCircle },
];

const publicMenuItems = [
  { label: "Home", href: "/", icon: User },
  { label: "Help", href: "/help", icon: HelpCircle },
];

const Sidebar = () => {
  const pathname = usePathname();
  const { isAuthenticated, isLoading } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const dispatch = useDispatch();
  const router = useRouter();

  const handleLogout = useCallback(async () => {
    if (isLoggingOut) return;

    setIsLoggingOut(true);
    try {
      const token = localStorage.getItem("token");
      const refreshToken = localStorage.getItem("refreshToken");

      // Call logout API if tokens exist
      if (token) {
        await fetch("http://localhost:5000/api/v1/auth/sign-out", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ refreshToken }),
        }).catch((error) => {
          console.error("Logout API error:", error);
        });
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Always clear local storage and state
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      dispatch(clearUser());

      // Redirect to home page
      router.push("/");
    }
  }, [dispatch, router, isLoggingOut]);

  // Auto-logout after 7 hours
  useEffect(() => {
    if (isAuthenticated) {
      const logoutTimer = setTimeout(() => {
        console.log("Session expired (7 hours), logging out...");
        handleLogout();
      }, 7 * 60 * 60 * 1000); // 7 hours

      return () => clearTimeout(logoutTimer);
    }
  }, [isAuthenticated, handleLogout]);

  // Filter menu items based on authentication
  const filteredMenuItems = isAuthenticated ? menuItems : publicMenuItems;

  if (isLoading) {
    return (
      <div className="w-64 bg-background border-r h-screen p-6 flex flex-col fixed left-0 top-0 overflow-y-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Renewal Guard</h1>
        </div>
        <div className="space-y-1 flex-1">
          {[1, 2, 3].map((item) => (
            <div key={item} className="flex items-center py-2 px-3 rounded-lg">
              <div className="w-4 h-4 bg-gray-300 rounded mr-3 animate-pulse"></div>
              <div className="h-4 bg-gray-300 rounded w-20 animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-64 bg-background border-r h-screen p-6 flex flex-col  fixed left-0 top-0 overflow-y-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Renewal Guard</h1>
      </div>

      {/* Navigation */}
      <nav className="space-y-1 flex-1">
        {filteredMenuItems.map((item) => {
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

      {/* Bottom buttons - compact design */}
      <div className="space-y-3 mt-auto">
        {/* Theme Toggle Button */}

        <SidebarThemeToggle />

        {/* Logout Button */}
        {/* Authentication Buttons */}
        {isAuthenticated ? (
          // Logout Button for authenticated users
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
