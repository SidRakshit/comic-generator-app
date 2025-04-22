'use client';

import { useState, useEffect } from 'react';

// Panel status types
export type PanelStatus = 'empty' | 'loading' | 'complete' | 'error';

// Panel interface
export interface Panel {
    id: string;
    status: PanelStatus;
    prompt?: string;
    imageUrl?: string;
    error?: string;
}

// Comic interface
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

// Template definitions
interface TemplateDefinition {
    id: string;
    name: string;
    panelCount: number;
    layout: string;
}

// Define available templates
const templates: Record<string, TemplateDefinition> = {
    'template-1': {
        id: 'template-1',
        name: '2x2 Grid',
        panelCount: 4,
        layout: 'grid-2x2'
    },
    'template-2': {
        id: 'template-2',
        name: '3x2 Grid',
        panelCount: 6,
        layout: 'grid-3x2'
    },
    'template-3': {
        id: 'template-3',
        name: 'Single Panel',
        panelCount: 1,
        layout: 'single'
    },
    'template-4': {
        id: 'template-4',
        name: '3x3 Grid',
        panelCount: 9,
        layout: 'grid-3x3'
    },
    'template-5': {
        id: 'template-5',
        name: 'Manga Style',
        panelCount: 5,
        layout: 'manga'
    }
};

// Hook for managing comic state
export function useComic(initialComicId?: string) {
    // State
    const [comic, setComic] = useState<Comic>({
        title: 'Untitled Comic',
        template: null,
        panels: [],
        published: false
    });
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Load existing comic if ID is provided
    useEffect(() => {
        if (initialComicId) {
            loadComic(initialComicId);
        }
    }, [initialComicId]);

    // Load comic data
    const loadComic = async (comicId: string) => {
        setIsLoading(true);
        setError(null);

        try {
            // Placeholder for API call
            // In a real implementation, this would fetch the comic from your backend
            const response = await mockFetchComic(comicId);
            setComic(response);
        } catch (err) {
            console.error('Failed to load comic:', err);
            setError('Failed to load comic. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    // Placeholder function for API call
    const mockFetchComic = async (comicId: string) => {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Return mock data
        return {
            id: comicId,
            title: `Comic #${comicId}`,
            description: 'A sample comic description',
            template: 'template-1',
            panels: Array(4).fill(null).map((_, i) => ({
                id: `panel-${i}`,
                status: 'empty' as PanelStatus
            })),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            published: false
        };
    };

    // Set template and initialize panels
    const setTemplate = (templateId: string | null) => {
        if (!templateId) {
            setComic(prev => ({
                ...prev,
                template: null,
                panels: []
            }));
            return;
        }

        const template = templates[templateId];
        if (!template) {
            console.error(`Template ${templateId} not found`);
            return;
        }

        // Create empty panels based on template
        const newPanels: Panel[] = Array(template.panelCount)
            .fill(null)
            .map((_, index) => ({
                id: `panel-${index}`,
                status: 'empty'
            }));

        setComic(prev => ({
            ...prev,
            template: templateId,
            panels: newPanels
        }));
    };

    // Update panel content
    const updatePanelContent = (panelIndex: number, updates: Partial<Panel>) => {
        setComic(prev => {
            const updatedPanels = [...prev.panels];
            updatedPanels[panelIndex] = {
                ...updatedPanels[panelIndex],
                ...updates
            };

            return {
                ...prev,
                panels: updatedPanels
            };
        });
    };

    // Save comic
    const saveComic = async () => {
        setIsSaving(true);
        setError(null);

        try {
            // Validate comic
            if (!comic.template || comic.panels.length === 0) {
                throw new Error('Comic template not selected');
            }

            if (comic.panels.some(panel => panel.status !== 'complete')) {
                throw new Error('All panels must be completed before publishing');
            }

            // Placeholder for API call
            // In a real implementation, this would save the comic to your backend
            const response = await mockSaveComic(comic);

            // Update comic with data from response
            setComic(prev => ({
                ...prev,
                id: response.id,
                published: response.published,
                updatedAt: response.updatedAt
            }));

            return response;
        } catch (err) {
            console.error('Failed to save comic:', err);
            setError('Failed to save comic. Please try again.');
            throw err;
        } finally {
            setIsSaving(false);
        }
    };

    // Placeholder function for API call
    const mockSaveComic = async (comicData: Comic) => {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Return mock data
        return {
            ...comicData,
            id: comicData.id || `comic-${Date.now()}`,
            published: true,
            createdAt: comicData.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
    };

    // Update comic metadata
    const updateComicMetadata = (updates: Partial<Comic>) => {
        setComic(prev => ({
            ...prev,
            ...updates
        }));
    };

    return {
        comic,
        isLoading,
        isSaving,
        error,
        setTemplate,
        updatePanelContent,
        updateComicMetadata,
        saveComic
    };
}