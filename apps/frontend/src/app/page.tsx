import HeroSection from "@/components/home/hero-section";
import HowItWorksSection from "@/components/home/how-it-works-section";
import FeaturedComicsSection from "@/components/home/featured-comics-section";
import CallToActionSection from "@/components/home/call-to-action-section";

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <HowItWorksSection />
      <FeaturedComicsSection />
      <CallToActionSection />
    </div>
  );
}