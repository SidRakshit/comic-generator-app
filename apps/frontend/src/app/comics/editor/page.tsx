"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import ComicCanvas from "@/components/comic/comic-canvas";
import PanelPromptModal from "@/components/comic/panel-prompt";
import ImageZoomModal from "@/components/comic/image-zoom-modal";
import { CreditBalanceBanner } from "@/components/billing/credit-balance-banner";
import { useComicContext } from "@/context/comic-context";
import { COMIC_TEMPLATES as templates } from "@repo/common-types";
import { Button } from "@repo/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import { apiRequest, GeneratedImageDataResponse } from "@/lib/api";
import { ComicCharacter, Panel, SEMANTIC_COLORS, INTERACTIVE_STYLES, UI_CONSTANTS, API_ENDPOINTS } from "@repo/common-types";

async function generateImageAPI(
	prompt: string,
	characterContext?: string,
	dialogue?: string
): Promise<GeneratedImageDataResponse> {
	console.log(`Calling generateImageAPI with prompt: "${prompt}"`);
	const requestBody = { 
		panelDescription: prompt,
		...(characterContext && { characterContext }),
		...(dialogue && { dialogue })
	};

	try {
		const data = await apiRequest<GeneratedImageDataResponse>(
			API_ENDPOINTS.GENERATE_PANEL_IMAGE,
			"POST",
			requestBody
		);

		if (!data || typeof data.imageData !== "string") {
			console.error("API response missing 'imageData':", data);
			throw new Error(
				"API response did not contain the expected 'imageData' field."
			);
		}
		console.log("generateImageAPI call successful, received data:", data);
		return data;
	} catch (error) {
		console.error("Error calling generateImageAPI:", error);
		throw error;
	}
}

// --- Main Editor Page Component ---
function NewComicEditorContent() {
	const searchParams = useSearchParams();
	const router = useRouter();
	const templateId = searchParams.get("templateId");

	// Local state
	const [activePanel, setActivePanel] = useState<number | null>(null);
	const [isPromptModalOpen, setIsPromptModalOpen] = useState(false);
	const [isZoomModalOpen, setIsZoomModalOpen] = useState(false);
	const [zoomedImageUrl, setZoomedImageUrl] = useState<string | null>(null);

	const {
		comic,
		updatePanelContent,
		saveComic,
		isLoading,
		isSaving,
		error: comicHookError,
	} = useComicContext();

	// --- Effects ---
	useEffect(() => {
		if (comicHookError) {
			console.error("Comic Hook Error:", comicHookError);
		}
	}, [comicHookError]);
	useEffect(() => {
		if (!isLoading && !comic.template && templateId) {
			console.error(`Failed to initialize template ID: ${templateId}.`);
		} else if (!isLoading && !comic.template && !templateId) {
			console.error("Editor loaded without template ID.");
			router.push("/comics/create");
		}
	}, [isLoading, comic.template, templateId, router]);

	// --- Editor Handlers ---
	const handlePanelClick = (panelIndex: number) => {
		if (
			isSaving ||
			isLoading ||
			!comic ||
			!comic.panels ||
			!comic.panels[panelIndex]
		)
			return;
		const panel = comic.panels[panelIndex];
		if (panel.status === "complete" && panel.imageUrl) {
			setZoomedImageUrl(panel.imageUrl);
			setIsZoomModalOpen(true);
		} else if (panel.status !== "loading") {
			setActivePanel(panelIndex);
			setIsPromptModalOpen(true);
		}
	};
	const handleEditPanelClick = (panelIndex: number) => {
		if (
			isSaving ||
			isLoading ||
			!comic ||
			!comic.panels ||
			comic.panels[panelIndex]?.status !== "complete"
		)
			return;
		setActivePanel(panelIndex);
		setIsPromptModalOpen(true);
	};

	const handlePromptSubmit = async (prompt: string, dialogue?: string) => {
		if (activePanel === null || !comic || !comic.panels) return;
		const panelIndex = activePanel;

		// Build character context for visual consistency
		let characterContext = "";
		if (comic.characters && comic.characters.length > 0) {
			characterContext = "CHARACTER CONSISTENCY REQUIREMENTS:\n";
			comic.characters.forEach((char: ComicCharacter) => {
				if (char.name && char.description) {
					characterContext += `- ${char.name}: ${char.description}\n`;
				}
			});
			characterContext += "\nMaintain consistent character appearance, clothing, facial features, and visual style across all panels. Each character should look identical in every panel they appear.";
		}

		// Build metadata prefix for the prompt
		let metadataPrefix = "";
		if (comic.title) metadataPrefix += `Comic Title: ${comic.title}. `;
		if (comic.genre) metadataPrefix += `Genre: ${comic.genre}. `;
		metadataPrefix = metadataPrefix.trim();
		const fullPrompt = metadataPrefix
			? `${metadataPrefix}\n\nPanel Prompt: ${prompt}`
			: prompt;

		setIsPromptModalOpen(false);
		setActivePanel(null);
		updatePanelContent(panelIndex, {
			status: "loading",
			prompt: prompt,
			dialogue: dialogue,
			error: undefined,
			imageUrl: undefined,
			imageBase64: undefined,
		});

		try {
			console.log("Generating image with character context for visual consistency...");
			const imageResponse = await generateImageAPI(fullPrompt, characterContext, dialogue);

			updatePanelContent(panelIndex, {
				status: "complete",
				imageData: imageResponse.imageData,
				prompt: prompt,
				dialogue: dialogue,
				error: undefined,
			});
			console.log(`Panel ${panelIndex + 1} generation success.`);
		} catch (error) {
			console.error(`Panel ${panelIndex + 1} generation failed:`, error);
			updatePanelContent(panelIndex, {
				status: "error",
				error:
					error instanceof Error ? error.message : "Image generation failed.",
				prompt: prompt,
				dialogue: dialogue,
				imageUrl: undefined,
				imageBase64: undefined,
			});
		}
	};

	const handleSaveComic = async () => {
		if (isSaving || isLoading) return;

		console.log("Attempting to save comic...");
		try {
			const savedComicData = await saveComic();

			if (savedComicData && savedComicData.id) {
				console.log("Save successful, comic ID:", savedComicData.id);
				alert("Comic saved successfully!");
				router.push(`/comics/${savedComicData.id}`);
			} else {
				console.error("Save failed. Check hook error state.");
				alert(`Failed to save comic. ${comicHookError || "Please try again."}`);
			}
		} catch (error) {
			console.error("Unexpected error during handleSaveComic:", error);
			alert(
				`Failed to save comic: ${ 
					error instanceof Error ? error.message : "Unknown error"
				}`
			);
		}
	};

	const handleSaveClick = () => {
		if (!canSave) {
			alert("Comic saved as draft - complete all panels to publish");
			return;
		}
		handleSaveComic();
	};

	// --- Render Logic ---
	if (isLoading) {
		return (
			<div className="flex justify-center items-center min-h-screen">
				<Loader2 className="h-16 w-16 animate-spin" />
			</div>
		);
	}
	if (comicHookError || (!isLoading && !comic.template)) {
		const errorMsg = comicHookError || "Failed to load editor.";
		return <div className="text-red-600 p-4">{errorMsg}</div>;
	}

	const templateName =
		templates[comic.template || ""]?.name || "Unknown Template";
		const canSave = comic.panels?.every((p: Panel) => p.status === "complete");
		
		// Debug logging for button state
		console.log("Button state debug:", {
			isSaving,
			isLoading,
			canSave,
			panelsCount: comic.panels?.length,
			panelsStatus: comic.panels?.map(p => p.status)
		});

	return (
		<div className="container mx-auto py-8 px-4">
			<CreditBalanceBanner />
			<div className="mb-6"> 
				<Link
					href="/comics/create"
					className={`inline-flex items-center ${SEMANTIC_COLORS.TEXT.ACCENT} ${INTERACTIVE_STYLES.TEXT.HOVER_ACCENT}`}
				>
					<ArrowLeft className="h-4 w-4 mr-1" /> Back 
				</Link> 
			</div>
			<div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
				<h1 className={`text-3xl font-bold break-words ${SEMANTIC_COLORS.TEXT.PRIMARY}`}>
				Comic Title: {comic.title || `New ${templateName} Comic`}
				</h1>
				<div className="flex gap-3 flex-shrink-0 relative z-20">
					<Button
						variant="outline"
						size="sm"
						onClick={handleSaveClick}
						disabled={isSaving || isLoading}
					>
						{isSaving ? (
							<Loader2 className="mr-2 h-4 w-4 animate-spin" />
						) : null}
						{isSaving ? "Saving..." : "Save Comic"}
					</Button>
				</div>
			</div>
			<div className={`${SEMANTIC_COLORS.BACKGROUND.PRIMARY} ${UI_CONSTANTS.BORDER_RADIUS.LARGE} shadow-md p-4 md:p-6`}>
				<h2 className={`text-xl font-semibold mb-2 ${SEMANTIC_COLORS.TEXT.PRIMARY}`}>
					Edit Panels ({comic.panels?.length || 0} total)
				</h2>
				<p className={`${SEMANTIC_COLORS.TEXT.SECONDARY} mb-6 text-sm`}>
					Click empty panels to generate, click images to zoom, use ✏️ to
					regenerate.
				</p>
				{comic.template && comic.panels ? (
					<ComicCanvas
						panels={comic.panels}
						onPanelClick={handlePanelClick}
						onEditPanelClick={handleEditPanelClick}
						layout={comic.template}
					/>
				) : (
					<div>No panels loaded.</div>
				)}
			</div>
			<PanelPromptModal
				isOpen={isPromptModalOpen}
			onClose={() => setIsPromptModalOpen(false)}
			onSubmit={handlePromptSubmit}
			panelNumber={activePanel !== null ? activePanel + 1 : 0}
			initialPrompt={
				(activePanel !== null && comic.panels?.[activePanel]?.prompt) || ""
			}
			initialDialogue={
				(activePanel !== null && comic.panels?.[activePanel]?.dialogue) || ""
			}
			isRegenerating={
				activePanel !== null &&
				comic.panels?.[activePanel]?.status === "complete"
			}
			characters={comic.characters || []}
			/>
			<ImageZoomModal
				isOpen={isZoomModalOpen}
			onClose={() => setIsZoomModalOpen(false)}
			imageUrl={zoomedImageUrl}
			/>
		</div>
	);
}

// --- Suspense Wrapper ---
export default function NewComicEditorPage() {
	return (
		<Suspense
			fallback={
				<div className="flex justify-center items-center min-h-screen">
					<Loader2 className="h-16 w-16 animate-spin" />
				</div>
			}
		>
			<NewComicEditorContent />
		</Suspense>
	);
}
