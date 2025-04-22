'use client';

// Import useCallback
import { useState, useEffect, useCallback } from 'react';

// ... (PanelStatus, Panel, Comic, TemplateDefinition interfaces remain the same) ...
export type PanelStatus = 'empty' | 'loading' | 'complete' | 'error';
export interface Panel {
    id: string;
    status: PanelStatus;
    prompt?: string;
    imageUrl?: string;
    error?: string;
}
export interface Comic {
    id?: string;
    title: string;
    description?: string;
    template: string | null;
    panels: Panel[];
    createdAt?: string;
    updatedAt?: string;
    published: boolean;
}
interface TemplateDefinition {
    id: string;
    name: string;
    panelCount: number;
    layout: string;
}


// ... (templates object remains the same) ...
export const templates: Record<string, TemplateDefinition> = { 'template-1': { id: 'template-1', name: '2x2 Grid', panelCount: 4, layout: 'grid-2x2' }, 'template-2': { id: 'template-2', name: '3x2 Grid', panelCount: 6, layout: 'grid-3x2' }, 'template-3': { id: 'template-3', name: 'Single Panel', panelCount: 1, layout: 'single' }, 'template-4': { id: 'template-4', name: '3x3 Grid', panelCount: 9, layout: 'grid-3x3' }, 'template-5': { id: 'template-5', name: 'Manga Style', panelCount: 5, layout: 'manga' } };


// Hook for managing comic state
export function useComic(initialComicId?: string) {
    // ... (useState declarations remain the same) ...
    const [comic, setComic] = useState<Comic>({ title: 'Untitled Comic', template: null, panels: [], published: false });
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);


    // Placeholder function for API call (stable within hook scope)
    const mockFetchComic = async (comicId: string) => {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        // Return mock data
        return {
            id: comicId,
            title: `Comic #${comicId}`,
            description: 'A sample comic description',
            template: 'template-1',
            panels: Array(4).fill(null).map((_, i) => ({ id: `panel-${i}`, status: 'empty' as PanelStatus })),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            published: false
        };
    };

    // Wrap loadComic in useCallback
    const loadComic = useCallback(async (comicId: string) => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await mockFetchComic(comicId);
            setComic(response);
        } catch (err) {
            console.error('Failed to load comic:', err);
            setError('Failed to load comic. Please try again.');
        } finally {
            setIsLoading(false);
        }
        // State setters are stable, mockFetchComic is defined in scope and stable
    }, []);

    // Load existing comic if ID is provided
    useEffect(() => {
        if (initialComicId) {
            loadComic(initialComicId);
        }
        // Add loadComic to the dependency array
    }, [initialComicId, loadComic]);


    // ... (setTemplate, updatePanelContent, saveComic, mockSaveComic, updateComicMetadata remain the same) ...
    const setTemplate = (templateId: string | null) => { if (!templateId) { setComic(prev => ({ ...prev, template: null, panels: [] })); return; } const template = templates[templateId]; if (!template) { console.error(`Template ${templateId} not found`); return; } const newPanels: Panel[] = Array(template.panelCount).fill(null).map((_, index) => ({ id: `panel-${index}`, status: 'empty' })); setComic(prev => ({ ...prev, template: templateId, panels: newPanels })); };
    const updatePanelContent = (panelIndex: number, updates: Partial<Panel>) => { setComic(prev => { const updatedPanels = [...prev.panels]; updatedPanels[panelIndex] = { ...updatedPanels[panelIndex], ...updates }; return { ...prev, panels: updatedPanels }; }); };
    const saveComic = async () => { setIsSaving(true); setError(null); try { if (!comic.template || comic.panels.length === 0) { throw new Error('Comic template not selected'); } if (comic.panels.some(panel => panel.status !== 'complete')) { throw new Error('All panels must be completed before publishing'); } const response = await mockSaveComic(comic); setComic(prev => ({ ...prev, id: response.id, published: response.published, updatedAt: response.updatedAt })); return response; } catch (err) { console.error('Failed to save comic:', err); setError('Failed to save comic. Please try again.'); throw err; } finally { setIsSaving(false); } };
    const mockSaveComic = async (comicData: Comic) => { await new Promise(resolve => setTimeout(resolve, 1500)); return { ...comicData, id: comicData.id || `comic-${Date.now()}`, published: true, createdAt: comicData.createdAt || new Date().toISOString(), updatedAt: new Date().toISOString() }; };
    const updateComicMetadata = (updates: Partial<Comic>) => { setComic(prev => ({ ...prev, ...updates })); };


    return {
        comic,
        isLoading,
        isSaving,
        error,
        setTemplate,
        updatePanelContent,
        updateComicMetadata,
        saveComic
        // Removed loadComic from returned object as it's mainly internal now
    };
}