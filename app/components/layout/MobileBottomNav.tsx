// components/layout/MobileBottomNav.tsx
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CreditCard, BarChart3, Settings, HelpCircle } from "lucide-react";

const mobileMenuItems = [
  { label: "Subscriptions", href: "/dashboard", icon: CreditCard },
  { label: "Analytics", href: "/analytics", icon: BarChart3 },
  { label: "Settings", href: "/settings", icon: Settings },
  { label: "Help", href: "/help", icon: HelpCircle },
];

export const MobileBottomNav = () => {
  const pathname = usePathname();

  console.log("📱 MobileBottomNav rendering, current path:", pathname);

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t lg:hidden z-40 w-screen">
      <div className="flex justify-between items-center w-full px-2">
        {mobileMenuItems.map((item) => {
          const IconComponent = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex flex-col items-center py-2 px-1 flex-1 min-w-0 max-w-[80px] ${
                isActive ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <IconComponent className="w-5 h-5" />
              <span className="text-xs mt-1 text-center truncate w-full">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};
