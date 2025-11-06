// app/dashboard/page.tsx
"use client";
import { LandingNavbar } from "../components/LandingNavbar";
import Dashboard from "../components/dashboard/Dashboard";
import Sidebar from "../components/layout/Sidebar";
import { MobileBottomNav } from "../components/layout/MobileBottomNav";

export default function DashboardPage() {
  return (
    <main className="flex-1 ml-0 md:ml-32 lg:ml-64">
      <div className="min-h-screen bg-background flex flex-col">
        <LandingNavbar />

        <div className="flex flex-1">
          {/* Sidebar - Only on desktop */}
          <div className="hidden lg:block">
            <Sidebar />
          </div>

          {/* Main Content Area - Add padding bottom for mobile nav */}
          <div className="flex-1 w-full lg:ml-0 pb-16 lg:pb-0">
            <Dashboard />
          </div>
        </div>

        {/* Mobile Bottom Navigation */}
        <MobileBottomNav />
      </div>
    </main>
  );
}
