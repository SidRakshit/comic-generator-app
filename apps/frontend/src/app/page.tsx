// src/app/page.tsx
// Remove unused imports like useState, useEffect, useCallback, Image, specific icons etc.
// Keep Link if needed elsewhere, or remove if not.

import HeroSection from "@/components/home/hero-section";
import HowItWorksSection from "@/components/home/how-it-works-section";
import FeaturedComicsSection from "@/components/home/featured-comics-section"; // Import even if placeholder
import CallToActionSection from "@/components/home/call-to-action-section";

export default function HomePage() {
	return (
		// The outer div might not be strictly necessary if RootLayout handles min-height
		// but keeping it is fine too.
		<div className="min-h-screen">
			<HeroSection />
			<HowItWorksSection />
			<FeaturedComicsSection /> {/* Render the placeholder/future section */}
			<CallToActionSection />
		</div>
	);
}
