// src/hooks/use-comic.ts
// UPDATED: Added genre, characters, and character management functions

'use client';

import { useState, useEffect, useCallback } from 'react';
import { generateId } from '@/lib/utils'; // Assuming you have a utility for IDs

// --- Interfaces ---
export type PanelStatus = 'empty' | 'loading' | 'complete' | 'error';
export interface Panel {
    id: string;
    status: PanelStatus;
    prompt?: string;
    imageUrl?: string;
    error?: string;
}
// ADDED: Interface for Character
export interface ComicCharacter {
    id: string; // Unique ID for React keys
    name: string;
    description: string;
}
export interface Comic {
    id?: string; // Will be assigned on actual save
    title: string;
    description?: string; // Keep description if needed, or remove
    genre?: string; // ADDED: Genre
    characters?: ComicCharacter[]; // ADDED: Characters array
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

// --- Templates Definition (ensure this is complete in your actual file) ---
export const templates: Record<string, TemplateDefinition> = {
    'template-1': { id: 'template-1', name: '2x2 Grid', panelCount: 4, layout: 'grid-2x2' },
    'template-2': { id: 'template-2', name: '3x2 Grid', panelCount: 6, layout: 'grid-3x2' },
    'template-3': { id: 'template-3', name: 'Single Panel', panelCount: 1, layout: 'single' },
    'template-4': { id: 'template-4', name: '3x3 Grid', panelCount: 9, layout: 'grid-3x3' },
    'template-5': { id: 'template-5', name: 'Manga Style', panelCount: 5, layout: 'manga' }
};

// --- Hook ---
export function useComic(initialComicId?: string, initialTemplateId?: string | null) {

    // --- MODIFIED: Initial State with default characters ---
    const [comic, setComic] = useState<Comic>({
        title: 'Untitled Comic',
        description: '',
        genre: '', // Default genre
        characters: [ // Default with 2 characters
            { id: generateId('char'), name: '', description: '' },
            { id: generateId('char'), name: '', description: '' },
        ],
        template: null,
        panels: [],
        published: false
    });
    // --- END MODIFIED ---

    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // --- Mock fetch / loadComic / useEffect remain the same as previous version ---
    const mockFetchComic = async (comicId: string): Promise<Comic> => { /* ... as before ... */  console.warn("Using MOCK fetch for comic:", comicId); await new Promise(resolve => setTimeout(resolve, 1000)); return { id: comicId, title: `Comic #${comicId}`, description: 'A sample comic description', template: 'template-1', panels: Array(4).fill(null).map((_, i) => ({ id: `panel-${i}`, status: 'empty' as PanelStatus })), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), published: false }; };
    const loadComic = useCallback(async (comicId: string) => { setIsLoading(true); setError(null); try { const response = await mockFetchComic(comicId); setComic(response); } catch (err) { console.error('Failed to load comic:', err); setError('Failed to load comic. Please try again.'); } finally { setIsLoading(false); } }, []);


    // --- setTemplate remains the same ---
    const setTemplate = useCallback((templateId: string | null) => {
        if (!templateId) { setComic(prev => ({ ...prev, template: null, panels: [] })); return; }
        const template = templates[templateId];
        if (!template) { console.error(`Template ${templateId} not found`); return; }
        const newPanels: Panel[] = Array(template.panelCount).fill(null).map((_, index) => ({
            id: `panel-${index}-${Date.now()}`, status: 'empty'
        }));
        setComic(prev => ({ ...prev, template: templateId, panels: newPanels }));
        console.log(`Template set to: ${templateId}, Panels created: ${newPanels.length}`);
    }, []); // No change needed here

    // --- useEffect for initialization remains the same ---
    useEffect(() => {
        if (initialTemplateId && templates[initialTemplateId]) { console.log("Initializing comic with template ID:", initialTemplateId); setIsLoading(true); setTemplate(initialTemplateId); setIsLoading(false); }
        else if (initialComicId) { console.log("Loading comic by ID:", initialComicId); loadComic(initialComicId); }
        else { console.log("useComic initialized without ID or template."); }
    }, [initialComicId, initialTemplateId, loadComic, setTemplate]);


    // --- updatePanelContent remains the same ---
    const updatePanelContent = (panelIndex: number, updates: Partial<Panel>) => { setComic(prev => { const updatedPanels = [...prev.panels]; updatedPanels[panelIndex] = { ...updatedPanels[panelIndex], ...updates }; return { ...prev, panels: updatedPanels }; }); };

    // --- updateComicMetadata remains the same (used for title, description, genre) ---
    const updateComicMetadata = (updates: Partial<Omit<Comic, 'panels' | 'characters'>>) => { // Ensure it doesn't overwrite panels/characters directly
        setComic(prev => ({ ...prev, ...updates }));
    };

    // --- ADDED: Character Management Functions ---
    const addCharacter = () => {
        setComic(prev => ({
            ...prev,
            characters: [
                ...(prev.characters || []),
                { id: generateId('char'), name: '', description: '' } // Add new empty character
            ]
        }));
    };

    const removeCharacter = (idToRemove: string) => {
        setComic(prev => ({
            ...prev,
            characters: (prev.characters || []).filter(char => char.id !== idToRemove)
        }));
    };

    const updateCharacter = (idToUpdate: string, field: keyof Omit<ComicCharacter, 'id'>, value: string) => {
        setComic(prev => ({
            ...prev,
            characters: (prev.characters || []).map(char =>
                char.id === idToUpdate ? { ...char, [field]: value } : char
            )
        }));
    };
    // --- END ADDED ---


    // --- saveComic / mockSaveComic remain the same (still needs implementation) ---
    const saveComic = async () => { /* ... */ throw new Error("Save comic not implemented without backend"); };
    const mockSaveComic = async (comicData: Comic) => { /* ... */ return { ...comicData, id: comicData.id || `comic-${Date.now()}`, published: true, createdAt: comicData.createdAt || new Date().toISOString(), updatedAt: new Date().toISOString() }; };


    return {
        comic,
        isLoading,
        isSaving,
        error,
        setTemplate,
        updatePanelContent,
        updateComicMetadata,
        addCharacter, // EXPORT
        removeCharacter, // EXPORT
        updateCharacter, // EXPORT
        saveComic
    };
}