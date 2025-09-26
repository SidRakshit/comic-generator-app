// src/components/home/hero-section.tsx
"use client";

import Link from "next/link";
import { Button } from "@repo/ui/button";
import { SEMANTIC_COLORS, INTERACTIVE_STYLES, TYPOGRAPHY, SPACING } from "@repo/common-types";
import { useAuth } from "@/hooks/use-auth"; // Use the custom hook from the correct file
import { Loader2 } from "lucide-react";

export default function HeroSection() {
	const { user, isLoading } = useAuth();

	return (
		<section className={`${SEMANTIC_COLORS.BRAND.GRADIENT} ${SEMANTIC_COLORS.TEXT.INVERTED} ${SPACING.LAYOUT.SECTION_PADDING}`}>
			<div className="container mx-auto px-4">
				<div className="max-w-3xl mx-auto text-center">
					<h1 className="text-4xl sm:text-5xl font-bold mb-6">
						Create Amazing Comics with AI
					</h1>
					<p className="text-xl mb-8">
						Turn your ideas into visual stories with our easy-to-use comic
						creation platform. No artistic skills required!
					</p>
					<div className="flex flex-wrap justify-center gap-4">
						{/* --- Modified Conditional Rendering --- */}
						{isLoading ? (
							// Loading State: Show disabled button
							<Button
								size="lg"
								disabled
								className={`${SEMANTIC_COLORS.BACKGROUND.PRIMARY} ${SEMANTIC_COLORS.BRAND.PRIMARY} opacity-75 cursor-wait`}
							>
								<Loader2 className="mr-2 h-5 w-5 animate-spin" />
								Loading...
							</Button>
						) : user ? (
							// Logged In State: Link to create page
							<Button
								size="lg"
								asChild
								className={`${SEMANTIC_COLORS.BACKGROUND.PRIMARY} ${SEMANTIC_COLORS.BRAND.PRIMARY} ${INTERACTIVE_STYLES.BUTTON.GHOST}`}
							>
								<Link href="/comics/create">Create Your First Comic</Link>
							</Button>
						) : (
							// Logged Out State: Link to login page
							<Button
								size="lg"
								asChild // Use asChild to make the button a link wrapper
								className={`${SEMANTIC_COLORS.BACKGROUND.PRIMARY} ${SEMANTIC_COLORS.BRAND.PRIMARY} ${INTERACTIVE_STYLES.BUTTON.GHOST}`} // Use normal active styles
								title="Login required to create comics" // Optional tooltip
							>
								<Link href="/signup">Create Your First Comic</Link>
							</Button>
						)}
						{/* --- End Modified Conditional Rendering --- */}

						{/* Browse Comics Button (remains unchanged) */}
						{/* <Button
							size="lg"
							variant="outline"
							asChild
							className={`${SEMANTIC_COLORS.BORDER.INVERTED} ${SEMANTIC_COLORS.TEXT.INVERTED} ${SEMANTIC_COLORS.BRAND.PRIMARY_HOVER}`}
						>
							<Link href="/comics"> Browse Comics </Link>
						</Button> */}
					</div>
				</div>
			</div>
		</section>
	);
}
