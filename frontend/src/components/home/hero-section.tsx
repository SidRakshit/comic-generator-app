// src/components/home/hero-section.tsx
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HeroSection() {
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
						<Button
							size="lg"
							asChild
							className="bg-white text-blue-700 hover:bg-gray-100"
						>
							<Link href="/comics/create">Create Your First Comic</Link>
						</Button>
						<Button
							size="lg"
							variant="outline"
							asChild
							className="border-white text-white hover:bg-blue-700"
						>
							<Link href="/comics">Browse Comics</Link>
						</Button>
					</div>
				</div>
			</div>
		</section>
	);
}
