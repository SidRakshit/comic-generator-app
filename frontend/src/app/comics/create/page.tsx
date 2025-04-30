// src/app/comics/create/page.tsx
"use client";

import { useRouter } from "next/navigation";
import { useState, ChangeEvent } from "react"; // Keep useState, ChangeEvent
// Remove Button, Loader2, Plus, Trash2, Input, Label, Textarea if not used directly
// Keep useComicContext
import { useComicContext } from "@/context/comic-context";
// Remove TemplateSelector import

// Import the new components
import ComicMetadataForm from "@/components/comic/comic-metadata-form";
import ComicTemplateStep from "@/components/comic/comic-template-step";

export default function CreateComicPage() {
	const router = useRouter();
	const [step, setStep] = useState<"metadata" | "template">("metadata");
	const {
		comic,
		setTemplate,
		updateComicMetadata,
		addCharacter,
		removeCharacter,
		updateCharacter,
	} = useComicContext();

	const [isNavigating, setIsNavigating] = useState(false);

	// --- Handlers (Keep these here as they interact with context/routing) ---
	const handleMetadataChange = (
		e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement> // Removed Select unless needed
	) => {
		updateComicMetadata({ [e.target.name]: e.target.value });
	};

	const handleCharacterChange = (
		id: string,
		field: "name" | "description",
		value: string
	) => {
		updateCharacter(id, field, value);
	};

	const goToNextStep = () => {
		if (!comic.title) {
			// Consider using a more user-friendly notification than alert
			alert("Please enter a title for the comic.");
			return;
		}
		setStep("template");
	};

	const goToPreviousStep = () => {
		setStep("metadata");
	};

	const handleTemplateSelect = (templateId: string) => {
		if (isNavigating) return;
		console.log(`Template selected: ${templateId}`);

		setTemplate(templateId); // Update context

		setIsNavigating(true);
		try {
			const editorUrl = `/comics/editor`; // Navigate to the editor page
			console.log(`Navigating to editor: ${editorUrl}`);
			router.push(editorUrl);
			// Navigation will unmount this component or trigger layout change
			// No need to setIsNavigating(false) here unless navigation fails quickly
		} catch (err) {
			console.error("Failed to navigate:", err);
			setIsNavigating(false); // Reset if navigation throws error immediately
			// Add user feedback for navigation failure
		}
	};

	return (
		<div className="container mx-auto py-8">
			{/* Keep the main page title */}
			<div className="flex justify-between items-center mb-6">
				<h1 className="text-3xl font-bold text-gray-900">Create New Comic</h1>
			</div>

			{/* Render steps conditionally within the card */}
			<div className="bg-white rounded-lg shadow p-6">
				{step === "metadata" && (
					<ComicMetadataForm
						comic={comic}
						onMetadataChange={handleMetadataChange}
						onCharacterChange={handleCharacterChange}
						onAddCharacter={addCharacter}
						onRemoveCharacter={removeCharacter}
						onNextStep={goToNextStep}
					/>
				)}

				{step === "template" && (
					<ComicTemplateStep
						onSelectTemplate={handleTemplateSelect}
						onGoBack={goToPreviousStep}
						isNavigating={isNavigating}
					/>
				)}
			</div>
		</div>
	);
}
