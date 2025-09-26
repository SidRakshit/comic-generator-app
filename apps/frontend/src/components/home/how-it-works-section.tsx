// src/components/home/how-it-works-section.tsx
import { Book, Wand2, Users, Brush } from "lucide-react";
import { SEMANTIC_COLORS } from "@repo/common-types";
import HowItWorksCard from "./how-it-works-card";

const steps = [
	{
		icon: <Book className="h-6 w-6" />,
		title: "Choose a Template",
		description:
			"Select from various comic layouts with different panel arrangements.",
	},
	{
		icon: <Wand2 className="h-6 w-6" />,
		title: "Describe Each Panel",
		description:
			"Enter a text prompt for each panel and our AI will generate the perfect image.",
	},
	{
		icon: <Brush className="h-6 w-6" />,
		title: "Customize",
		description:
			"Add speech bubbles, captions, and customize your comic to tell your story.",
	},
	{
		icon: <Users className="h-6 w-6" />,
		title: "Share",
		description:
			"Publish your comic for others to see or download it for personal use.",
	},
];

export default function HowItWorksSection() {
	return (
		<section className="py-16">
			<div className="container mx-auto px-4">
				<h2 className={`text-3xl font-bold text-center mb-12 ${SEMANTIC_COLORS.TEXT.PRIMARY}`}>How It Works</h2>
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
					{steps.map((step, index) => (
						<HowItWorksCard
							key={index}
							icon={step.icon}
							title={step.title}
							description={step.description}
						/>
					))}
				</div>
			</div>
		</section>
	);
}
