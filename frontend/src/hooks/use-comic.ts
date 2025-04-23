// src/hooks/use-comic.ts

'use client';

import { useState, useEffect, useCallback } from 'react';

// ... (Interfaces: PanelStatus, Panel, Comic, TemplateDefinition remain the same) ...
export type PanelStatus = 'empty' | 'loading' | 'complete' | 'error';
export interface Panel { /* ... */ id: string; status: PanelStatus; prompt?: string; imageUrl?: string; error?: string; }
export interface Comic { /* ... */ id?: string; title: string; description?: string; template: string | null; panels: Panel[]; createdAt?: string; updatedAt?: string; published: boolean; }
interface TemplateDefinition { /* ... */ id: string; name: string; panelCount: number; layout: string; }

// ... (templates object remains the same) ...
// Make sure your file has this full definition:
export const templates: Record<string, TemplateDefinition> = {
    'template-1': { id: 'template-1', name: '2x2 Grid', panelCount: 4, layout: 'grid-2x2' },
    'template-2': { id: 'template-2', name: '3x2 Grid', panelCount: 6, layout: 'grid-3x2' },
    'template-3': { id: 'template-3', name: 'Single Panel', panelCount: 1, layout: 'single' },
    'template-4': { id: 'template-4', name: '3x3 Grid', panelCount: 9, layout: 'grid-3x3' },
    'template-5': { id: 'template-5', name: 'Manga Style', panelCount: 5, layout: 'manga' }
};

// --- MODIFIED: Add initialTemplateId parameter ---
export function useComic(initialComicId?: string, initialTemplateId?: string | null) {
    const [comic, setComic] = useState<Comic>({ title: 'Untitled Comic', template: null, panels: [], published: false });
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(false); // Still useful for loading initial state
    const [error, setError] = useState<string | null>(null);

    // Mock fetch - only used if initialComicId is provided AND initialTemplateId is NOT
    const mockFetchComic = async (comicId: string): Promise<Comic> => {
        console.warn("Using MOCK fetch for comic:", comicId); // Warn that mock is used
        await new Promise(resolve => setTimeout(resolve, 1000));
        // Return mock data - STILL DEFAULTS TO template-1 IF THIS IS CALLED
        return {
            id: comicId,
            title: `Comic #${comicId}`,
            description: 'A sample comic description',
            template: 'template-1', // Mock still returns template-1
            panels: Array(4).fill(null).map((_, i) => ({ id: `panel-${i}`, status: 'empty' as PanelStatus })),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            published: false
        };
    };

    // setTemplate function remains the same
    const setTemplate = useCallback((templateId: string | null) => {
        if (!templateId) {
            setComic(prev => ({ ...prev, template: null, panels: [] }));
            return;
        }
        const template = templates[templateId];
        if (!template) {
            console.error(`Template ${templateId} not found`);
            return;
        }
        const newPanels: Panel[] = Array(template.panelCount).fill(null).map((_, index) => ({
            id: `panel-${index}-${Date.now()}`, // Use unique IDs for new panels
            status: 'empty'
        }));
        // Set the template ID and the generated panels
        setComic(prev => ({ ...prev, template: templateId, panels: newPanels }));
        console.log(`Template set to: ${templateId}, Panels created: ${newPanels.length}`);
    }, []); // Include setComic in dependencies if ESLint warns, though state setters are stable

    const loadComic = useCallback(async (comicId: string) => {
        setIsLoading(true);
        setError(null);
        try {
            // FOR NOW, we still use the mock fetch here when loading by ID
            // In the future, replace mockFetchComic with real API call
            const response = await mockFetchComic(comicId);
            setComic(response);
        } catch (err) {
            console.error('Failed to load comic:', err);
            setError('Failed to load comic. Please try again.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    // --- MODIFIED: useEffect to handle initialTemplateId first ---
    useEffect(() => {
        // Prioritize setting template if initialTemplateId is provided
        if (initialTemplateId && templates[initialTemplateId]) {
            console.log("Initializing comic with template ID:", initialTemplateId);
            setIsLoading(true); // Indicate loading state
            setTemplate(initialTemplateId);
            setIsLoading(false); // Finish loading state
        }
        // Only load by comic ID if initialTemplateId wasn't used and initialComicId exists
        else if (initialComicId) {
            console.log("Loading comic by ID:", initialComicId);
            loadComic(initialComicId);
        } else {
            // Handle case where neither ID nor template is provided (optional)
            console.log("useComic initialized without ID or template.");
        }
        // Dependencies ensure this runs when IDs change
    }, [initialComicId, initialTemplateId, loadComic, setTemplate]);


    // ... (updatePanelContent, saveComic, mockSaveComic, updateComicMetadata remain the same) ...
    const updatePanelContent = (panelIndex: number, updates: Partial<Panel>) => { setComic(prev => { const updatedPanels = [...prev.panels]; updatedPanels[panelIndex] = { ...updatedPanels[panelIndex], ...updates }; return { ...prev, panels: updatedPanels }; }); };
    const saveComic = async () => { /* ... */ throw new Error("Save comic not implemented without backend"); }; // Mock or disable save for now
    const mockSaveComic = async (comicData: Comic) => { /* ... */ return { ...comicData, id: comicData.id || `comic-${Date.now()}`, published: true, createdAt: comicData.createdAt || new Date().toISOString(), updatedAt: new Date().toISOString() }; };
    const updateComicMetadata = (updates: Partial<Comic>) => { setComic(prev => ({ ...prev, ...updates })); };


    return {
        comic,
        isLoading,
        isSaving,
        error,
        setTemplate, // Still expose setTemplate if needed elsewhere
        updatePanelContent,
        updateComicMetadata,
        saveComic
    };
}