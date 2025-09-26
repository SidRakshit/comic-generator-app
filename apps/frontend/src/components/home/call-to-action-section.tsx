// src/components/home/call-to-action-section.tsx
"use client"; // Required for using hooks

import Link from "next/link";
import { Button } from "@repo/ui/button";
import { useAuth } from "@/hooks/use-auth"; // Import the auth hook
import { Loader2 } from "lucide-react"; // Import loading icon
import { SEMANTIC_COLORS, SPACING, INTERACTIVE_STYLES } from "@repo/common-types";

export default function CallToActionSection() {
	// Get authentication state
	const { user, isLoading } = useAuth();

	return (
		<section className={`${SPACING.LAYOUT.SECTION_PADDING} bg-blue-900 text-white`}>
			<div className="container mx-auto px-4 text-center">
				<h2 className="text-3xl font-bold mb-4">Ready to Create Your Comic?</h2>
				<p className="text-xl mb-8 max-w-2xl mx-auto">
					Join thousands of creators who are bringing their stories to life. No
					artistic skills needed!
				</p>

				{/* Conditional Rendering for the Button */}
				{isLoading ? (
					// Loading State
					<Button
						size="lg"
						disabled
						className={`${SEMANTIC_COLORS.BACKGROUND.PRIMARY} text-blue-900 opacity-75 cursor-wait`} // Style as disabled/loading
					>
						<Loader2 className="mr-2 h-5 w-5 animate-spin" />
						Loading...
					</Button>
				) : user ? (
					// Logged In State: Link to /comics/create
					<Button
						size="lg"
						asChild // Use asChild to make the button a link wrapper
						className={`${SEMANTIC_COLORS.BACKGROUND.PRIMARY} text-blue-900 ${INTERACTIVE_STYLES.BUTTON.GHOST}`}
					>
						<Link href="/comics/create">Get Started Now</Link>
					</Button>
				) : (
					// Logged Out State: Link to /signup
					<Button
						size="lg"
						asChild // Use asChild to make the button a link wrapper
						className={`${SEMANTIC_COLORS.BACKGROUND.PRIMARY} text-blue-900 ${INTERACTIVE_STYLES.BUTTON.GHOST}`} // Keep original active style
						title="Sign up to get started" // Optional tooltip
					>
						<Link href="/signup">Get Started Now</Link>
					</Button>
				)}
			</div>
		</section>
	);
}
