// app/help/page.tsx
import Help from "../components/dashboard/help/Help";
import { LandingNavbar } from "../components/LandingNavbar";
import Sidebar from "../components/layout/Sidebar";

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <LandingNavbar />

      <div className="flex flex-1">
        <Sidebar />
        <Help />
      </div>
    </div>
  );
}
