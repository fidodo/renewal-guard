"use client";
import { LandingNavbar } from "../components/LandingNavbar";
import Dashboard from "../components/dashboard/Dashboard";
import Sidebar from "../components/layout/Sidebar";

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <LandingNavbar />
      <div className="flex flex-1">
        <Sidebar />
        <Dashboard />
      </div>
    </div>
  );
}
