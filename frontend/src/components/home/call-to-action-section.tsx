// src/components/home/call-to-action-section.tsx
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function CallToActionSection() {
	return (
		<section className="py-16 bg-blue-900 text-white">
			<div className="container mx-auto px-4 text-center">
				<h2 className="text-3xl font-bold mb-4">Ready to Create Your Comic?</h2>
				<p className="text-xl mb-8 max-w-2xl mx-auto">
					Join thousands of creators who are bringing their stories to life. No
					artistic skills needed!
				</p>
				<Button
					size="lg"
					asChild
					className="bg-white text-blue-900 hover:bg-gray-100"
				>
					<Link href="/comics/create">Get Started Now</Link>
				</Button>
			</div>
		</section>
	);
}
