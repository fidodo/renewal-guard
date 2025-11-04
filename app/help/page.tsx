// app/help/page.tsx
import Help from "../components/dashboard/help/Help";
import { LandingNavbar } from "../components/LandingNavbar";
import Sidebar from "../components/layout/Sidebar";
import { MobileBottomNav } from "../components/layout/MobileBottomNav";

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <LandingNavbar />

      <div className="flex flex-1">
        {/* Sidebar - Only on desktop */}
        <div className="hidden lg:block">
          <Sidebar />
        </div>

        {/* Main Content Area - Add padding bottom for mobile nav */}
        <div className="flex-1 w-full lg:ml-0 pb-16 lg:pb-0">
          <Help />
        </div>
      </div>
      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />
    </div>
  );
}
