// src/components/home/hero-section.tsx
"use client"; // Add this if not already present

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth"; // Import the useAuth hook
import { Loader2 } from "lucide-react"; // Import Loader icon

export default function HeroSection() {
	// Get auth state using the hook
	const { user, isLoading } = useAuth(); // Assuming useAuth provides user and isLoading

	return (
		<section className="bg-gradient-to-b from-blue-600 to-blue-800 text-white py-16">
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
						{/* --- Conditional Rendering for the Create Button --- */}
						{isLoading ? (
							// 1. Loading State: Show a disabled button with spinner
							<Button
								size="lg"
								disabled
								className="bg-white text-blue-700 opacity-75 cursor-wait" // Style as disabled/loading
							>
								<Loader2 className="mr-2 h-5 w-5 animate-spin" />
								Loading...
							</Button>
						) : user ? (
							// 2. Logged In State: Show the original button linking to create page
							<Button
								size="lg"
								asChild // Use asChild to make the button a link wrapper
								className="bg-white text-blue-700 hover:bg-gray-100"
							>
								<Link href="/comics/create">Create Your First Comic</Link>
							</Button>
						) : (
							// 3. Logged Out State: Show a disabled button with tooltip
							<Button
								size="lg"
								disabled // Semantically disable the button
								className="bg-white text-blue-700 opacity-50 cursor-not-allowed" // Visually indicate disabled state
								title="Please login or sign up to create comics" // Add tooltip for explanation
							>
								Create Your First Comic
							</Button>
						)}
						{/* --- End of Conditional Rendering --- */}

						{/* Browse Comics Button (remains unchanged) */}
						<Button
							size="lg"
							variant="outline"
							asChild
							className="border-white text-white hover:bg-blue-700"
						>
							<Link href="/comics"> Browse Comics </Link>
						</Button>
					</div>
				</div>
			</div>
		</section>
	);
}
