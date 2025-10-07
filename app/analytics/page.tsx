// app/analytics/page.tsx
"use client";
import Analytics from "../components/dashboard/analytics/Analytics";
import { LandingNavbar } from "../components/LandingNavbar";
import Sidebar from "../components/layout/Sidebar";

export default function AnalyticsPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <LandingNavbar />
      <div>
        <Sidebar />
        <Analytics />
      </div>
    </div>
  );
}
