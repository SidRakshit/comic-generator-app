import HeroSection from "@/components/home/hero-section";
import HowItWorksSection from "@/components/home/how-it-works-section";
import FeaturedComicsSection from "@/components/home/featured-comics-section";
import CallToActionSection from "@/components/home/call-to-action-section";
import { Button } from "@repo/ui/button";

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <HowItWorksSection />
      <FeaturedComicsSection />
      <CallToActionSection />

      {/* --- Test Section for Shared Component --- */}
      <div className="text-center p-16 bg-slate-800">
        <h2 className="text-2xl font-bold mb-4 text-white">
          Test of Shared UI Component
        </h2>
        <Button>Click Me</Button>
      </div>
    </div>
  );
}