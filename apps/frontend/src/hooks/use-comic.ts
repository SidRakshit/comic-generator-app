"use client";

import { useState, useEffect, useCallback } from "react";
import { generateId } from "@repo/utils";
import { apiRequest, GeneratedImageDataResponse } from "@/lib/api";
import { PanelStatus, Panel, ComicCharacter, Comic, TemplateDefinition, CreateComicRequest, ComicResponse, ComicPanelResponse, ComicPageResponse, COMIC_TEMPLATES, API_ENDPOINTS } from "@repo/common-types";

// Use shared response type for SSoT compliance
type SaveComicResponseFromBackend = ComicResponse;

// --- Templates Definition (SSoT) ---
// Use shared templates from common-types for consistency
export const templates = COMIC_TEMPLATES;

// --- Hook ---
export function useComic(
	initialComicId?: string,
	initialTemplateId?: string | null
) {
	// --- State ---
	const [comic, setComic] = useState<Comic>({
		title: "",
		description: "",
		genre: "",
		characters: [{ id: generateId("char"), name: "", description: "" }],
		template: null,
		panels: [],
		published: false,
	});
	const [isSaving, setIsSaving] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	// Helper function for parsing characters safely
	const parseCharacters = (charData: unknown): ComicCharacter[] => {
		const defaultChar = [{ id: generateId("char"), name: "", description: "" }];
		try {
			let parsedChars: unknown = null;
			if (typeof charData === "string") {
				parsedChars = JSON.parse(charData);
			} else if (charData !== undefined && charData !== null) {
				parsedChars = charData;
			}

			if (Array.isArray(parsedChars)) {
				const characters = parsedChars.map((c: unknown): ComicCharacter => {
					// Added type assertion within map after type checks
					if (typeof c === "object" && c !== null) {
						const char = c as Partial<ComicCharacter>; // Assert as partial after checks
						return {
							id: typeof char.id === "string" ? char.id : generateId("char"),
							name: typeof char.name === "string" ? char.name : "",
							description:
								typeof char.description === "string" ? char.description : "",
						};
					}
					// Return default if structure is wrong
					return { id: generateId("char"), name: "", description: "" };
				});
				// Ensure at least one character entry exists if parsing resulted in empty array
				return characters.length > 0 ? characters : defaultChar;
			}
		} catch (e) {
			console.error("Failed to parse characters", e);
		}
		// Return default if any error or if not an array
		return defaultChar;
	};

	// --- Load Existing Comic ---
	const loadComic = useCallback(async (comicId: string) => {
		console.log(`Hook: Loading comic ID: ${comicId}`);
		setIsLoading(true);
		setError(null);
		try {
			const data = await apiRequest<ComicResponse>(
				API_ENDPOINTS.COMIC_BY_ID(comicId),
				"GET"
			);
			console.log("Raw backend data received:", JSON.stringify(data, null, 2));

			// Use helper function for parsing
			const loadedCharacters = parseCharacters(data.characters);

			// CORRECTED: Add ?? [] before .map and type 'p' - using consolidated types
			const loadedPanels: Panel[] =
				(data.pages?.[0]?.panels ?? []).map((p: ComicPanelResponse) => ({
					id: p.panel_id,
					status: p.image_url ? "complete" : "empty",
					prompt: p.prompt || "",
					imageUrl: p.image_url || undefined,
					imageBase64: undefined, // Ensure base64 is not stored for loaded comics
					error: undefined,
					panelNumber: p.panel_number,
					layoutPosition: (p.layout_position as Record<string, unknown>) || {},
				})) || []; // Fallback to empty array if map fails (less likely now)

			const loadedTemplateKey =
				data.template ||
				Object.keys(templates).find(
					(key) => templates[key]?.panelCount === loadedPanels.length
				) ||
				null;

			setComic({
				id: data.comic_id,
				title: data.title,
				description: data.description || "",
				genre: data.genre || "",
				characters: loadedCharacters, // Use parsed characters
				template: loadedTemplateKey,
				panels: loadedPanels,
				createdAt: data.created_at,
				updatedAt: data.updated_at,
				published: false,
			});
			console.log(`Hook: Comic ${comicId} loaded successfully.`);
		} catch (err: unknown) {
			console.error("Hook: Failed to load comic:", err);
			setError(
				err instanceof Error ? err.message : "Failed to load comic data."
			);
		} finally {
			setIsLoading(false);
		}
	}, []); // Keep useCallback dependencies empty if loadComic itself doesn't change

	// --- Initialize New Comic ---
	const setTemplate = useCallback((templateId: string | null) => {
		if (!templateId) {
			setComic((prev) => ({ ...prev, template: null, panels: [] }));
			return;
		}
		const template = templates[templateId];
		if (!template) {
			console.error(`Hook: Template ${templateId} not found`);
			return;
		}
		const newPanels: Panel[] = Array.from(
			{ length: template.panelCount },
			(_, index) => ({
				id: generateId("panel"),
				status: "empty",
				panelNumber: index + 1,
			})
		);
		setComic((prev) => ({
			...prev,
			id: undefined,
			template: templateId,
			panels: newPanels,
			createdAt: undefined,
			updatedAt: undefined,
		}));
		console.log(
			`Hook: Template set to: ${templateId}, Panels created: ${newPanels.length}`
		);
	}, []);

	// --- Effect for Initial Load or Template Set ---
	useEffect(() => {
		if (initialComicId) {
			loadComic(initialComicId);
		} else if (initialTemplateId && templates[initialTemplateId]) {
			if (!initialComicId) {
				setTemplate(initialTemplateId);
				setIsLoading(false);
			}
		} else {
			setIsLoading(false);
		}
	}, [initialComicId, initialTemplateId, loadComic, setTemplate]);

	// --- Update Panel Content ---
	const updatePanelContent = useCallback(
		(panelIndex: number, updates: Partial<Panel> & { imageData?: string }) => {
			setComic((prev) => {
				if (!prev || !prev.panels[panelIndex]) return prev;
				const updatedPanels = [...prev.panels];
				const currentPanel = updatedPanels[panelIndex];
				const newPanelData = { ...currentPanel, ...updates };

				if (updates.status === "complete" && updates.imageData) {
					newPanelData.imageBase64 = updates.imageData;
					newPanelData.imageUrl = `data:image/png;base64,${updates.imageData}`;
					newPanelData.error = undefined;
				} else if (
					currentPanel.status === "complete" &&
					updates.status !== "complete"
				) {
					newPanelData.imageUrl = undefined;
					newPanelData.imageBase64 = undefined;
				}
				if (updates.status !== "complete") {
					newPanelData.imageBase64 = undefined;
				}

				updatedPanels[panelIndex] = newPanelData;
				return { ...prev, panels: updatedPanels };
			});
		},
		[]
	);

	// --- Metadata and Character Updates ---
	const updateComicMetadata = useCallback(
		(updates: Partial<Omit<Comic, "panels" | "characters">>) => {
			setComic((prev) => ({ ...prev, ...updates }));
		},
		[]
	);
	const addCharacter = useCallback(() => {
		setComic((prev) => ({
			...prev,
			characters: [
				...(prev.characters || []),
				{ id: generateId("char"), name: "", description: "" },
			],
		}));
	}, []);
	const removeCharacter = useCallback((idToRemove: string) => {
		setComic((prev) => ({
			...prev,
			characters:
				(prev.characters || []).length <= 1
					? prev.characters
					: (prev.characters || []).filter((char) => char.id !== idToRemove),
		}));
	}, []);
	const updateCharacter = useCallback(
		(
			idToUpdate: string,
			field: keyof Omit<ComicCharacter, "id">,
			value: string
		) => {
			setComic((prev) => ({
				...prev,
				characters: (prev.characters || []).map((char) =>
					char.id === idToUpdate ? { ...char, [field]: value } : char
				),
			}));
		},
		[]
	);

	// --- Save Comic (Create or Update) ---
	const saveComic = useCallback(async (): Promise<Comic | undefined> => {
		if (!comic || !comic.template) {
			setError("Cannot save: Comic data or template is missing.");
			return undefined;
		}
		if (!comic.title) {
			setError("Cannot save: Comic title is required.");
			return undefined;
		}
		if (!comic.panels.every((p) => p.status === "complete")) {
			setError("Cannot save: All panels must have generated images first.");
			return undefined;
		}

		setIsSaving(true);
		setError(null);

		// Create payload using shared API types for SSoT compliance
		const finalPanelsPayload = comic.panels.map((panel, index) => ({
			panel_number: panel.panelNumber ?? index + 1,
			prompt: panel.prompt || "",
			layout_position: panel.layoutPosition || {},
			image_base64: panel.imageBase64 || "",
		}));
		const finalPagesData = [{ page_number: 1, panels: finalPanelsPayload }];
		const comicPayload: CreateComicRequest = {
			title: comic.title,
			description: comic.description,
			genre: comic.genre,
			characters: comic.characters,
			setting: {},
			template: comic.template,
			pages: finalPagesData,
		};

		try {
			let responseData: SaveComicResponseFromBackend;

			if (comic.id) {
				console.log(`Hook: Saving (UPDATE) comic ID: ${comic.id}`);
				responseData = await apiRequest<SaveComicResponseFromBackend>(
					`/comics/${comic.id}`,
					"PUT",
					comicPayload
				);
				console.log("Hook: Update response:", responseData);
			} else {
				console.log("Hook: Saving (CREATE) new comic");
				responseData = await apiRequest<SaveComicResponseFromBackend>(
					API_ENDPOINTS.COMICS,
					"POST",
					comicPayload
				);
				console.log("Hook: Create response:", responseData);
				if (!responseData || !responseData.comic_id) {
					throw new Error(
						"Save operation (create) did not return a valid comic ID."
					);
				}
			}

			// Use helper function for parsing
			const savedCharacters = parseCharacters(responseData.characters);

			// Refactored logic for panels using consolidated types
			const firstPage: ComicPageResponse | undefined = responseData.pages?.[0];
			const panelsArray: ComicPanelResponse[] | undefined = firstPage?.panels;
			const panelsToMap: ComicPanelResponse[] = panelsArray ?? [];

			const savedPanels: Panel[] =
				panelsToMap.map((p: ComicPanelResponse) => ({
					id: p.panel_id,
					status: p.image_url ? "complete" : "empty",
					prompt: p.prompt || "",
					imageUrl: p.image_url || undefined,
					imageBase64: undefined,
					error: undefined,
					panelNumber: p.panel_number,
					layoutPosition: (p.layout_position as Record<string, unknown>) || {},
				})) || comic.panels; // Keep fallback

			const finalComicState: Comic = {
				id: responseData.comic_id,
				title: responseData.title,
				description: responseData.description || "",
				genre: responseData.genre || "",
				characters: savedCharacters, // Use parsed characters
				template: responseData.template || comic.template,
				panels: savedPanels,
				createdAt: responseData.created_at,
				updatedAt: responseData.updated_at,
				published: false,
			};

			setComic(finalComicState);
			setIsSaving(false);
			return finalComicState;
		} catch (err: unknown) {
			console.error("Hook: Failed to save comic:", err);
			const errorMsg =
				err instanceof Error
					? err.message
					: "An unknown error occurred during save.";
			setError(errorMsg);
			setIsSaving(false);
			return undefined;
		}
	}, [comic]); // Removed parseCharacters from dependencies as it's stable

	return {
		comic,
		isLoading,
		isSaving,
		error,
		setTemplate,
		updatePanelContent,
		updateComicMetadata,
		addCharacter,
		removeCharacter,
		updateCharacter,
		saveComic,
	};
}
