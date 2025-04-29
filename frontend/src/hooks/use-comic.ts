// src/hooks/use-comic.ts
"use client";

import { useState, useEffect, useCallback } from "react";
import { generateId } from "@/lib/utils";
import { apiRequest } from "@/lib/api"; // Import the API utility

// --- Interfaces (Keep existing interfaces) ---
export type PanelStatus = "empty" | "loading" | "complete" | "error";
export interface Panel {
	id: string;
	status: PanelStatus;
	prompt?: string;
	imageUrl?: string;
	error?: string;
	panelNumber?: number;
	layoutPosition?: object;
	generatedImageUrl?: string;
}
export interface ComicCharacter {
	id: string;
	name: string;
	description: string;
}
export interface Comic {
	id?: string;
	title: string;
	description?: string;
	genre?: string;
	characters?: ComicCharacter[];
	template: string | null;
	panels: Panel[];
	createdAt?: string;
	updatedAt?: string;
	published?: boolean;
}
interface TemplateDefinition {
	id: string;
	name: string;
	panelCount: number;
	layout: string;
}

// --- Templates Definition ---
export const templates: Record<string, TemplateDefinition> = {
	"template-1": {
		id: "template-1",
		name: "2x2 Grid",
		panelCount: 4,
		layout: "grid-2x2",
	},
	"template-2": {
		id: "template-2",
		name: "3x2 Grid",
		panelCount: 6,
		layout: "grid-3x2",
	},
	"template-3": {
		id: "template-3",
		name: "Single Panel",
		panelCount: 1,
		layout: "single",
	},
	"template-4": {
		id: "template-4",
		name: "3x3 Grid",
		panelCount: 9,
		layout: "grid-3x3",
	},
	"template-5": {
		id: "template-5",
		name: "Manga Style",
		panelCount: 5,
		layout: "manga",
	},
};

interface FullComicDataFromBackend {
	comic_id: string;
	title: string;
	description?: string;
	genre?: string; // Added genre
	characters?: any; // Assuming JSON string or object array from backend
	setting?: any; // Assuming object or JSON string
	template?: string; // Ideally, backend stores and returns the template key
	pages: {
		// Assuming backend returns pages structure
		page_id: string;
		pageNumber: number;
		panels: {
			panel_id: string;
			panelNumber: number;
			prompt?: string;
			dialogue?: string; // Map dialogue if needed
			layoutPosition?: object;
			image_url?: string; // The final S3 URL from backend
		}[];
	}[];
	created_at: string;
	updated_at: string;
}
interface SaveComicResponseFromBackend {
	id: string; // The comic_id
	message?: string;
}

// --- Hook ---
export function useComic(
	initialComicId?: string,
	initialTemplateId?: string | null
) {
	// --- State (Keep existing state) ---
	const [comic, setComic] = useState<Comic>({
		title: "Untitled Comic",
		description: "",
		genre: "",
		characters: [
			{ id: generateId("char"), name: "", description: "" },
			{ id: generateId("char"), name: "", description: "" },
		],
		template: null,
		panels: [],
		published: false,
	});
	const [isSaving, setIsSaving] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	// --- Load Existing Comic ---
	const loadComic = useCallback(async (comicId: string) => {
		console.log(`Hook: Loading comic ID: ${comicId}`);
		setIsLoading(true);
		setError(null);
		try {
			// Fetch data using apiRequest
			const data = await apiRequest<FullComicDataFromBackend>(
				`/comics/${comicId}`,
				"GET"
			);

			// Map the backend data structure to the frontend Comic state
			// ** CRITICAL: Adjust mapping based on your actual backend response **
			let loadedCharacters: ComicCharacter[] = [
				{ id: generateId("char"), name: "", description: "" },
			]; // Default if none loaded
			try {
				if (data.characters) {
					loadedCharacters =
						typeof data.characters === "string"
							? JSON.parse(data.characters)
							: data.characters;
					// Ensure IDs exist, add if necessary (backend should ideally return IDs)
					loadedCharacters = loadedCharacters.map((c) => ({
						...c,
						id: c.id || generateId("char"),
					}));
				}
			} catch (e) {
				console.error("Failed to parse characters", e); /* Keep default */
			}

			// Assuming single page for now, take panels from the first page
			const loadedPanels: Panel[] =
				data.pages?.[0]?.panels?.map((p) => ({
					id: p.panel_id, // Use the persistent ID from backend
					status: p.image_url ? "complete" : "empty", // Set status based on image presence
					prompt: p.prompt || "",
					imageUrl: p.image_url || undefined, // Use the final S3 URL
					generatedImageUrl: p.image_url || undefined, // Initialize with S3 URL
					error: undefined,
					panelNumber: p.panelNumber,
					layoutPosition: p.layoutPosition || {},
				})) || [];

			// Determine template - ideally load from data.template if available
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
				genre: data.genre || "", // Load genre
				characters: loadedCharacters,
				template: loadedTemplateKey, // Use loaded or guessed template
				panels: loadedPanels,
				createdAt: data.created_at,
				updatedAt: data.updated_at,
				published: false, // Determine published status if backend provides it
			});
			console.log(`Hook: Comic ${comicId} loaded successfully.`);
		} catch (err: any) {
			console.error("Hook: Failed to load comic:", err);
			setError(err.message || "Failed to load comic data.");
		} finally {
			setIsLoading(false);
		}
	}, []); // Empty dependency array, loadComic is called by useEffect

	// --- Initialize New Comic ---
	const setTemplate = useCallback((templateId: string | null) => {
		if (!templateId) {
			// Resetting? Clear template and panels
			setComic((prev) => ({ ...prev, template: null, panels: [] }));
			return;
		}
		const template = templates[templateId];
		if (!template) {
			console.error(`Hook: Template ${templateId} not found`);
			return;
		}
		// Create panels based on template count
		const newPanels: Panel[] = Array.from(
			{ length: template.panelCount },
			(_, index) => ({
				id: generateId("panel"), // Temporary frontend ID
				status: "empty",
				panelNumber: index + 1, // Assign panel number
			})
		);
		// Reset comic state for the new template, keeping metadata if desired
		setComic((prev) => ({
			...prev, // Keep existing title, desc, chars etc.
			id: undefined, // Ensure no previous ID persists for a new comic
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
			// Only set template if NOT loading existing comic
			// Prevents overwriting loaded data if both IDs present somehow
			if (!initialComicId) {
				setTemplate(initialTemplateId);
				setIsLoading(false); // Ensure loading is false if just setting template
			}
		} else {
			// Neither ID provided, maybe set a default state or leave as is?
			setIsLoading(false); // Ensure loading is false
		}
	}, [initialComicId, initialTemplateId, loadComic, setTemplate]);

	// --- Update Panel Content ---
	const updatePanelContent = useCallback(
		(panelIndex: number, updates: Partial<Panel>) => {
			setComic((prev) => {
				if (!prev || !prev.panels[panelIndex]) return prev; // Safety check

				const updatedPanels = [...prev.panels];
				const currentPanel = updatedPanels[panelIndex];
				const newPanelData = { ...currentPanel, ...updates };

				// Explicitly store the temporary URL from generation result
				if (updates.status === "complete" && updates.imageUrl) {
					newPanelData.generatedImageUrl = updates.imageUrl;
					// Optionally clear error when successfully completed
					newPanelData.error = undefined;
				}
				// Optionally clear generatedImageUrl if status changes from complete
				else if (
					currentPanel.status === "complete" &&
					updates.status !== "complete"
				) {
					newPanelData.generatedImageUrl = undefined;
				}

				updatedPanels[panelIndex] = newPanelData;
				return { ...prev, panels: updatedPanels };
			});
		},
		[]
	);

	// --- Metadata and Character Updates (keep as provided) ---
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
			// Prevent removing the last character if desired
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

		setIsSaving(true);
		setError(null);

		// Prepare payload matching backend's ComicDataFromRequest expectation
		// Assuming single page based on current hook state (flat panels list)
		const pagesData = [
			{
				pageNumber: 1, // Hardcoded page 1
				panels: comic.panels
					.filter(
						(panel) =>
							panel.status === "complete" &&
							(panel.generatedImageUrl || panel.imageUrl)
					) // Only save complete panels with a URL
					.map((panel, index) => ({
						panelNumber: panel.panelNumber ?? index + 1,
						prompt: panel.prompt || "",
						// dialogue: panel.dialogue || '', // Add if storing dialogue
						layoutPosition: panel.layoutPosition || {},
						// CRITICAL: Send the most recent URL (temp preferred, fallback to existing)
						generatedImageUrl: panel.generatedImageUrl || panel.imageUrl || "",
						// Note: Backend should ideally handle panel_id persistence if needed
					})),
			},
		];

		// Ensure we have panels to save
		if (pagesData[0].panels.length === 0) {
			setError("Cannot save: No completed panels with images found.");
			setIsSaving(false);
			return undefined;
		}

		const comicPayload = {
			title: comic.title,
			description: comic.description,
			genre: comic.genre, // Include genre
			characters: comic.characters, // Send characters array
			setting: {}, // Add setting data if available
			template: comic.template, // Send template key
			pages: pagesData,
		};

		try {
			let responseData: SaveComicResponseFromBackend;
			let finalComicData: Comic;

			if (comic.id) {
				// --- UPDATE existing comic ---
				console.log(`Hook: Saving (UPDATE) comic ID: ${comic.id}`);
				responseData = await apiRequest<SaveComicResponseFromBackend>(
					`/comics/${comic.id}`,
					"PUT",
					comicPayload
				);
				console.log("Hook: Update response:", responseData);
				// Assume successful PUT means data is saved, keep local state
				// Optionally: Refetch comic data after save for consistency using loadComic(comic.id)
				finalComicData = { ...comic }; // Keep local state for now
			} else {
				// --- CREATE new comic ---
				console.log("Hook: Saving (CREATE) new comic");
				responseData = await apiRequest<SaveComicResponseFromBackend>(
					"/comics",
					"POST",
					comicPayload
				);
				console.log("Hook: Create response:", responseData);
				if (!responseData || !responseData.id) {
					throw new Error(
						"Save operation (create) did not return a valid comic ID."
					);
				}
				// Update local state with the new ID from backend
				finalComicData = { ...comic, id: responseData.id };
				setComic(finalComicData); // Update state immediately with ID
			}

			setIsSaving(false);
			// Clear temporary generatedImageUrls after successful save? Optional.
			// setComic(prev => ({...prev!, panels: prev!.panels.map(p => ({...p, generatedImageUrl: undefined}))}))
			return finalComicData; // Return the final state
		} catch (err: any) {
			console.error("Hook: Failed to save comic:", err);
			setError(err.message || "An unknown error occurred during save.");
			setIsSaving(false);
			// Don't re-throw here, let components check the error state
			return undefined; // Indicate save failed
		}
	}, [comic]); // Dependency: entire comic object

	// Return hook state and actions
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
