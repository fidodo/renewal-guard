import { HeroSection } from "./components/HeroSection";
import { LandingNavbar } from "./components/LandingNavbar";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <LandingNavbar />
      <main className="ml-0 ">
        {" "}
        {/* Override the margin here */}
        <HeroSection />
      </main>
    </div>
  );
}
