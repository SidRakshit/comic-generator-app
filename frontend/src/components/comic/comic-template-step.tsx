// src/components/comic/comic-template-step.tsx
import React from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import TemplateSelector from "@/components/comic/template-selector";

interface ComicTemplateStepProps {
	onSelectTemplate: (templateId: string) => void;
	onGoBack: () => void;
	isNavigating: boolean;
}

export default function ComicTemplateStep({
	onSelectTemplate,
	onGoBack,
	isNavigating,
}: ComicTemplateStepProps) {
	return (
		<div>
			{/* Make Step title black */}
			<h2 className="text-xl font-semibold mb-4 text-gray-900">
				2. Choose a Template
			</h2>
			{/* Make descriptive text darker */}
			<p className="text-gray-800 mb-6">Select a layout to begin.</p>

			{/* TemplateSelector component */}
			<TemplateSelector onSelect={onSelectTemplate} disabled={isNavigating} />

			{/* Loading indicator */}
			{isNavigating && (
				// Make loading text darker
				<div className="mt-4 flex justify-center items-center text-gray-700">
					<Loader2 className="mr-2 h-4 w-4 animate-spin" />
					Loading editor...
				</div>
			)}

			{/* Navigation Buttons */}
			<div className="mt-6 flex justify-between">
				<Button variant="outline" onClick={onGoBack} disabled={isNavigating}>
					Back to Details
				</Button>
			</div>
		</div>
	);
}
