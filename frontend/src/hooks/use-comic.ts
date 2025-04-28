// src/hooks/use-comic.ts
'use client';

import { useState, useEffect, useCallback } from 'react';
import { generateId } from '@/lib/utils';
import { apiRequest } from '@/lib/api'; // Import the API utility

// --- Interfaces (Keep existing interfaces) ---
export type PanelStatus = 'empty' | 'loading' | 'complete' | 'error';
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
export interface ComicCharacter { id: string; name: string; description: string; }
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
interface TemplateDefinition { id: string; name: string; panelCount: number; layout: string; }

// --- Templates Definition ---
export const templates: Record<string, TemplateDefinition> = { /* ... as before ... */ 'template-1': { id: 'template-1', name: '2x2 Grid', panelCount: 4, layout: 'grid-2x2' }, 'template-2': { id: 'template-2', name: '3x2 Grid', panelCount: 6, layout: 'grid-3x2' }, 'template-3': { id: 'template-3', name: 'Single Panel', panelCount: 1, layout: 'single' }, 'template-4': { id: 'template-4', name: '3x3 Grid', panelCount: 9, layout: 'grid-3x3' }, 'template-5': { id: 'template-5', name: 'Manga Style', panelCount: 5, layout: 'manga' } };

// --- Hook ---
export function useComic(initialComicId?: string, initialTemplateId?: string | null) {

    // --- State (Keep existing state) ---
    const [comic, setComic] = useState<Comic>({ title: 'Untitled Comic', description: '', genre: '', characters: [{ id: generateId('char'), name: '', description: '' }, { id: generateId('char'), name: '', description: '' }], template: null, panels: [], published: false });
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // --- Mock fetch / loadComic / setTemplate / useEffect (Keep existing) ---
    const mockFetchComic = async (comicId: string): Promise<Comic> => { /* ... */ console.warn("Using MOCK fetch for comic:", comicId); await new Promise(resolve => setTimeout(resolve, 1000)); return { id: comicId, title: `Comic #${comicId}`, description: 'A sample comic description', template: 'template-1', panels: Array(4).fill(null).map((_, i) => ({ id: `panel-${i}`, status: 'empty' as PanelStatus })), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), published: false }; };
    const loadComic = useCallback(async (comicId: string) => { setIsLoading(true); setError(null); try { const response = await mockFetchComic(comicId); setComic(response); } catch (err) { console.error('Failed to load comic:', err); setError('Failed to load comic.'); } finally { setIsLoading(false); } }, []);
    const setTemplate = useCallback((templateId: string | null) => { if (!templateId) { setComic(prev => ({ ...prev, template: null, panels: [] })); return; } const template = templates[templateId]; if (!template) { console.error(`Template ${templateId} not found`); return; } const newPanels: Panel[] = Array(template.panelCount).fill(null).map((_, index) => ({ id: `panel-${index}-${Date.now()}`, status: 'empty', panelNumber: index + 1 /* Add panelNumber here */ })); setComic(prev => ({ ...prev, template: templateId, panels: newPanels })); console.log(`Template set to: ${templateId}, Panels created: ${newPanels.length}`); }, []);
    useEffect(() => { if (initialTemplateId && templates[initialTemplateId]) { setTemplate(initialTemplateId); } else if (initialComicId) { loadComic(initialComicId); } }, [initialComicId, initialTemplateId, loadComic, setTemplate]);


    // --- updatePanelContent (Modify to store generatedImageUrl) ---
    const updatePanelContent = (panelIndex: number, updates: Partial<Panel>) => {
        setComic(prev => {
            const updatedPanels = [...prev.panels];
            // Store the temporary URL when generation is complete
            if (updates.status === 'complete' && updates.imageUrl) {
                updatedPanels[panelIndex] = {
                    ...updatedPanels[panelIndex],
                    ...updates,
                    generatedImageUrl: updates.imageUrl // Store temp URL for saving
                };
            } else {
                updatedPanels[panelIndex] = { ...updatedPanels[panelIndex], ...updates };
            }
            return { ...prev, panels: updatedPanels };
        });
    };

    // --- updateComicMetadata / Character Functions (Keep existing) ---
    const updateComicMetadata = (updates: Partial<Omit<Comic, 'panels' | 'characters'>>) => { setComic(prev => ({ ...prev, ...updates })); };
    const addCharacter = () => { setComic(prev => ({ ...prev, characters: [...(prev.characters || []), { id: generateId('char'), name: '', description: '' }] })); };
    const removeCharacter = (idToRemove: string) => { setComic(prev => ({ ...prev, characters: (prev.characters || []).filter(char => char.id !== idToRemove) })); };
    const updateCharacter = (idToUpdate: string, field: keyof Omit<ComicCharacter, 'id'>, value: string) => { setComic(prev => ({ ...prev, characters: (prev.characters || []).map(char => char.id === idToUpdate ? { ...char, [field]: value } : char) })); };


    // --- saveComic - IMPLEMENTED ---
    const saveComic = useCallback(async (): Promise<Comic | undefined> => {
        setIsSaving(true);
        setError(null);

        // Prepare data for the backend, matching ComicDataFromRequest structure
        // Map frontend Panel state to PanelDataFromRequest expected by backend
        const pagesData = [{ // Assuming single page for now, adjust if multi-page needed
            pageNumber: 1,
            panels: comic.panels.map((panel, index) => ({
                panelNumber: panel.panelNumber ?? index + 1, // Use stored or calculate
                prompt: panel.prompt || '',
                dialogue: '', // Add dialogue if you store it in panel state
                layoutPosition: panel.layoutPosition || {}, // Add layout if stored
                // CRITICAL: Send the temporary URL for backend to process
                generatedImageUrl: panel.generatedImageUrl || panel.imageUrl || '', // Prioritize temp URL
            }))
        }];

        const comicPayload = {
            title: comic.title,
            description: comic.description,
            characters: comic.characters,
            setting: { description: '', style: comic.genre || '' }, // Adapt if setting is more complex
            pages: pagesData,
        };

        try {
            let savedData: { id: string }; // Expect backend to return at least the ID

            if (comic.id) {
                // --- UPDATE existing comic ---
                console.log(`Saving (UPDATE) comic ID: ${comic.id}`);
                savedData = await apiRequest<{ id: string }>(
                    `/comics/${comic.id}`,
                    'PUT',
                    comicPayload
                );
            } else {
                // --- CREATE new comic ---
                console.log("Saving (CREATE) new comic");
                savedData = await apiRequest<{ id: string }>(
                    '/comics',
                    'POST',
                    comicPayload
                );
            }

            console.log("Backend save response:", savedData);

            if (!savedData || !savedData.id) {
                throw new Error("Save operation did not return a valid comic ID.");
            }

            // Update local comic state with the ID received from backend
            // Optionally re-fetch the full comic data from backend after save
            const updatedComicData = { ...comic, id: savedData.id };
            setComic(updatedComicData);

            setIsSaving(false);
            return updatedComicData; // Return the updated comic state

        } catch (err) {
            console.error("Failed to save comic:", err);
            const errorMsg = err instanceof Error ? err.message : 'An unknown error occurred during save.';
            setError(errorMsg);
            setIsSaving(false);
            throw err; // Re-throw error for the component to handle
        }
    }, [comic]);


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
        saveComic
    };
}
