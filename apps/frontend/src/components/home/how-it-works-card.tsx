// src/components/home/how-it-works-card.tsx
import React from "react";

interface HowItWorksCardProps {
	icon: React.ReactNode;
	title: string;
	description: string;
}

export default function HowItWorksCard({
	icon,
	title,
	description,
}: HowItWorksCardProps) {
	return (
		<div className="bg-white p-6 rounded-lg shadow text-center">
			<div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mx-auto mb-4">
				{icon}
			</div>
			<h3 className="text-xl font-semibold mb-2 text-gray-900">{title}</h3>
			<p className="text-gray-600">{description}</p>
		</div>
	);
}
