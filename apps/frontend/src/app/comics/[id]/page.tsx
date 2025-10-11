// src/app/comics/[id]/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import ComicCanvas from "@/components/comic/comic-canvas";
import PanelPromptModal from "@/components/comic/panel-prompt";
import ImageZoomModal from "@/components/comic/image-zoom-modal";
import { useComicContext } from "@/context/comic-context"; // Use context hook
import { Button } from "@repo/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import { apiRequest } from "@/lib/api";
import { ComicCharacter, Panel, SEMANTIC_COLORS, UI_CONSTANTS, API_ENDPOINTS } from "@repo/common-types";

export default function ComicEditorPage() {
	const params = useParams();
	const router = useRouter();
	const comicId = params.id as string;

	// Local UI state
	const [activePanelIndex, setActivePanelIndex] = useState<number | null>(null); // Store only index
	const [isPromptModalOpen, setIsPromptModalOpen] = useState(false);
	const [isZoomModalOpen, setIsZoomModalOpen] = useState(false);
	const [zoomedImageUrl, setZoomedImageUrl] = useState<string | null>(null);

	// Get state and actions from ComicContext (which uses useComic hook)
	const {
		comic,
		updatePanelContent, // This function in the hook takes panelIndex
		saveComic,
		isLoading,
		isSaving,
		error: comicHookError,
	} = useComicContext();

	useEffect(() => {
		if (comicHookError) {
			console.error("Comic Context Hook Error (load/save):", comicHookError);
		}
	}, [comicHookError]);

	// --- Panel interaction handlers ---
	// Updated to accept only panelIndex
	const handlePanelClick = (panelIndex: number) => {
		// Access panels directly from comic.panels
		if (isSaving || !comic || !comic.panels[panelIndex]) return;
		const panel = comic.panels[panelIndex];

		if (panel.status === "complete" && panel.imageUrl) {
			setZoomedImageUrl(panel.imageUrl);
			setIsZoomModalOpen(true);
		} else if (panel.status !== "loading") {
			setActivePanelIndex(panelIndex); // Set active index
			setIsPromptModalOpen(true);
		}
	};

	// Updated to accept only panelIndex
	const handleEditPanelClick = (panelIndex: number) => {
		// Access panels directly from comic.panels
		if (isSaving || !comic || !comic.panels[panelIndex]) return;
		const panel = comic.panels[panelIndex];
		if (panel.status !== "loading") {
			setActivePanelIndex(panelIndex); // Set active index
			setIsPromptModalOpen(true);
		}
	};

	// Submit prompt to generate/regenerate image via API
	const handlePromptSubmit = async (prompt: string, imageFile?: File, imageBase64?: string, imageMimeType?: string, imageUrl?: string, dialogue?: string) => {
		if (activePanelIndex === null || !comic) return; // Use activePanelIndex
		const panelIndex = activePanelIndex; // Get index

		setIsPromptModalOpen(false);
		setActivePanelIndex(null); // Clear active index after submit

		// Call context action (which takes panelIndex)
		updatePanelContent(panelIndex, {
			status: "loading",
			prompt: prompt,
			dialogue: dialogue,
			error: undefined,
		});

		// Build character context for visual consistency
		let characterContext = "";
		if (comic.characters && comic.characters.length > 0) {
			characterContext = "CHARACTERS:\n";
			comic.characters.forEach((char: ComicCharacter) => {
				if (char.name && char.description) {
					characterContext += `- ${char.name}: ${char.description}\n`;
				}
			});
		}

		// Construct full prompt (using comic metadata from context)
		let metadataPrefix = "";
		if (comic.title) metadataPrefix += `Comic Title: ${comic.title}. `;
		if (comic.genre) metadataPrefix += `Genre: ${comic.genre}. `;
		metadataPrefix = metadataPrefix.trim();
		const fullPrompt = metadataPrefix
			? `${metadataPrefix}\n\nPanel Prompt: ${prompt}`
			: prompt;

		try {
			console.log("Generating image with character context for visual consistency...");
			const response = await apiRequest<{ imageUrl: string }>(
				API_ENDPOINTS.GENERATE_PANEL_IMAGE,
				"POST",
				{ 
					panelDescription: fullPrompt,
					characterContext: characterContext,
					...(imageBase64 && { imageFile: imageBase64 }),
					...(imageMimeType && { imageMimeType }),
					...(imageUrl && { imageUrl })
				}
			);

			if (!response || !response.imageUrl) {
				throw new Error("API response missing 'imageUrl'");
			}

			// Call context action (which takes panelIndex)
			updatePanelContent(panelIndex, {
				status: "complete",
				imageUrl: response.imageUrl,
				prompt: prompt,
				dialogue: dialogue,
				error: undefined,
			});
			console.log(`Editor: Panel ${panelIndex} generation success.`);
		} catch (error: unknown) {
			console.error(`Editor: Panel ${panelIndex} generation failed:`, error);
			// Call context action (which takes panelIndex)
			updatePanelContent(panelIndex, {
				status: "error",
				error:
					error instanceof Error ? error.message : "Image generation failed.",
				prompt: prompt,
				dialogue: dialogue,
				imageUrl: undefined,
			});
		}
	};

	// Save changes using the context's saveComic function
	const handleSaveComic = async () => {
		// canPublish logic needs to check comic.panels now
		const canPublish = comic?.panels?.every(
			(p: Panel) => p.status === "complete" && p.imageUrl
		);
		if (isSaving || !comic || !canPublish) return;

		console.log(`Editor: Attempting to save/update comic ID: ${comic.id}...`);
		try {
			const savedComicResult = await saveComic();
			if (savedComicResult) {
				console.log("Editor: Save successful!", savedComicResult);
				alert("Comic saved successfully!");
				router.push("/profile");
			} else {
				console.error("Editor: Save failed (check context error).");
				alert(
					`Failed to save comic. ${
						comicHookError || "Please check details and try again."
					}`
				);
			}
		} catch (error: unknown) {
			console.error("Editor: Error during handleSaveComic:", error);
			alert(
				`Failed to save comic: ${
					error instanceof Error ? error.message : "Unknown error"
				}`
			);
		}
	};

	// --- Render Logic (Loading, Error, Not Found states) ---
	if (isLoading) {
		return (
			<div className="container mx-auto py-8 px-4 md:px-6 lg:px-8">
				<div className="flex flex-col items-center justify-center min-h-[400px]">
					<Loader2 className="h-8 w-8 animate-spin text-gray-500 mb-4" />
					<p className="text-gray-600">Loading comic...</p>
				</div>
			</div>
		);
	}
	
	if (comicHookError && !comic && !isLoading) {
		return (
			<div className="container mx-auto py-8 px-4 md:px-6 lg:px-8">
				<div className="flex flex-col items-center justify-center min-h-[400px]">
					<div className="text-center">
						<h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading Comic</h2>
						<p className="text-gray-600 mb-6">{comicHookError}</p>
						<Button onClick={() => window.location.reload()}>
							Try Again
						</Button>
					</div>
				</div>
			</div>
		);
	}
	
	if (!comic && !isLoading) {
		return (
			<div className="container mx-auto py-8 px-4 md:px-6 lg:px-8">
				<div className="flex flex-col items-center justify-center min-h-[400px]">
					<div className="text-center">
						<h2 className="text-2xl font-bold text-gray-800 mb-4">Comic Not Found</h2>
						<p className="text-gray-600 mb-6">The comic you're looking for doesn't exist or you don't have permission to view it.</p>
						<Link href="/profile">
							<Button>Back to Profile</Button>
						</Link>
					</div>
				</div>
			</div>
		);
	}

	// Determine if comic can be published (all panels complete)
	const canPublish = comic?.panels?.every(
		(p: Panel) => p.status === "complete" && p.imageUrl
	);

	// --- Main Editor JSX ---
	return (
		<div className="container mx-auto py-8 px-4 md:px-6 lg:px-8">
			{/* Back Navigation */}
			<div className="mb-6">
				<Link href="/profile">
					<Button variant="outline" className="flex items-center gap-2">
						<ArrowLeft size={16} />
						Back to Profile
					</Button>
				</Link>
			</div>

			{/* Header Section */}
			{/* ... (Header with title and save button) ... */}
			<div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
				<h1 className="text-3xl font-bold break-words">
					{comic.title || "Edit Comic"}
				</h1>
				<div className="flex gap-3 flex-shrink-0">
					<Button
						onClick={handleSaveComic}
						disabled={isSaving || !canPublish}
						title={
							!canPublish
								? "All panels must have generated images."
								: "Save Changes"
						}
					>
						{isSaving ? (
							<Loader2 className="mr-2 h-4 w-4 animate-spin" />
						) : null}
						{isSaving ? "Saving..." : "Save Comic"}
					</Button>
				</div>
			</div>

			{/* Error display bar */}
			{/* ... (Error display logic) ... */}

			{/* Editor Area */}
			<div className={`${SEMANTIC_COLORS.BACKGROUND.PRIMARY} ${UI_CONSTANTS.BORDER_RADIUS.LARGE} shadow-md p-4 md:p-6`}>
				<h2 className={`text-xl font-semibold mb-2 ${SEMANTIC_COLORS.TEXT.PRIMARY}`}>
					Edit Panels ({comic.panels?.length || 0} total)
				</h2>
				<p className={`${SEMANTIC_COLORS.TEXT.SECONDARY} mb-6 text-sm`}>
					Click empty panels to generate content. Click generated images to
					zoom. Use the ✏️ icon to regenerate.
				</p>

				{/* Comic Canvas component */}
				{/* Pass comic.panels directly, and handlers now only pass panelIndex */}
				{comic && comic.panels && comic.template ? (
					<ComicCanvas
						panels={comic.panels} // Pass the flat list
						onPanelClick={handlePanelClick} // Pass handler that takes only panelIndex
						onEditPanelClick={handleEditPanelClick} // Pass handler that takes only panelIndex
						layout={comic.template} // Pass template key
					/>
				) : (
					<div>No panels loaded or template missing.</div>
				)}
			</div>

			{/* Prompt Modal */}
			{/* Update access to initial prompt and panel number */}
			<PanelPromptModal
				isOpen={isPromptModalOpen}
				onClose={() => setIsPromptModalOpen(false)}
				onSubmit={handlePromptSubmit}
				panelNumber={
					activePanelIndex !== null
						? comic?.panels[activePanelIndex]?.panelNumber ?? 0 // Add fallback for undefined panelNumber
						: 0 // Fallback when no panel is active
				}
				initialPrompt={
					activePanelIndex !== null
						? comic?.panels[activePanelIndex]?.prompt || ""
						: ""
				}
			
				isRegenerating={
					activePanelIndex !== null &&
					comic?.panels[activePanelIndex]?.status === "complete"
				}
			/>

			{/* Image Zoom Modal */}
			<ImageZoomModal
				isOpen={isZoomModalOpen}
				onClose={() => setIsZoomModalOpen(false)}
				imageUrl={zoomedImageUrl}
			/>
		</div>
	);
}
