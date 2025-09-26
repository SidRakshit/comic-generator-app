// src/components/home/how-it-works-card.tsx
import React from "react";
import { SEMANTIC_COLORS, UI_CONSTANTS } from "@repo/common-types";

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
		<div className={`${SEMANTIC_COLORS.BACKGROUND.PRIMARY} p-6 ${UI_CONSTANTS.BORDER_RADIUS.LARGE} shadow text-center`}>
			<div className={`w-12 h-12 ${SEMANTIC_COLORS.BACKGROUND.ACCENT_LIGHT} ${UI_CONSTANTS.BORDER_RADIUS.FULL} flex items-center justify-center ${SEMANTIC_COLORS.TEXT.ACCENT} mx-auto mb-4`}>
				{icon}
			</div>
			<h3 className={`text-xl font-semibold mb-2 ${SEMANTIC_COLORS.TEXT.PRIMARY}`}>{title}</h3>
			<p className={SEMANTIC_COLORS.TEXT.SECONDARY}>{description}</p>
		</div>
	);
}
