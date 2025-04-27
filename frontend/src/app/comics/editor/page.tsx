// src/app/comics/editor/page.tsx
'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import ComicCanvas from '@/components/comic/comic-canvas';
import PanelPromptModal from '@/components/comic/panel-prompt-modal';
import ImageZoomModal from '@/components/comic/image-zoom-modal';
import { useComicContext } from '@/context/comic-context';
import { templates } from '@/hooks/use-comic';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { apiRequest } from '@/lib/api'; // Import the new API utility

// --- API Call Function (generateImageAPI) - UPDATED ---
async function generateImageAPI(prompt: string): Promise<{ imageUrl: string }> {
    console.log(`Calling generateImageAPI with prompt: "${prompt}"`);
    const requestBody = { panelDescription: prompt };

    try {
        // Use the new apiRequest utility
        // Endpoint requires authentication now
        const data = await apiRequest<{ imageUrl: string }>(
            '/generate-panel-image', // Endpoint relative to API base URL
            'POST',
            requestBody
        );

        // Assuming backend returns { imageUrl: '...' } directly or within a data field handled by apiRequest
        if (!data || !data.imageUrl) {
            console.error("API response missing 'imageUrl':", data);
            throw new Error("API response did not contain the expected 'imageUrl' field.");
        }
        console.log("generateImageAPI call successful, received data:", data);
        return data; // Return the whole object { imageUrl: '...' }
    } catch (error) {
        console.error('Error calling generateImageAPI:', error);
        // The error might already be formatted by apiRequest
        throw error; // Re-throw the error
    }
}


// --- Main Editor Page Component ---
function NewComicEditorContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const templateId = searchParams.get('templateId');

    // Local state
    const [activePanel, setActivePanel] = useState<number | null>(null);
    const [isPromptModalOpen, setIsPromptModalOpen] = useState(false);
    const [isZoomModalOpen, setIsZoomModalOpen] = useState(false);
    const [zoomedImageUrl, setZoomedImageUrl] = useState<string | null>(null);

    // Context state and functions
    const {
        comic,
        updatePanelContent,
        updateComicMetadata,
        saveComic, // This will be updated in the hook
        isLoading,
        isSaving,
        error: comicHookError,
    } = useComicContext();

    // --- Effects ---
    // (Keep existing useEffects for error handling and template loading)
     useEffect(() => { if (comicHookError) { console.error("Comic Hook Error:", comicHookError); } }, [comicHookError]);
     useEffect(() => { if (!isLoading && !comic.template && templateId) { console.error(`Failed to initialize template ID: ${templateId}.`); } else if (!isLoading && !comic.template && !templateId) { console.error("Editor loaded without template ID."); router.push('/comics/create'); } }, [isLoading, comic.template, templateId, router]);


    // --- Editor Handlers ---
    // (handlePanelClick, handleEditPanelClick remain the same)
    const handlePanelClick = (panelIndex: number) => { /* ... */ if (isSaving || isLoading || !comic || !comic.panels || !comic.panels[panelIndex]) return; const panel = comic.panels[panelIndex]; if (panel.status === 'complete' && panel.imageUrl) { setZoomedImageUrl(panel.imageUrl); setIsZoomModalOpen(true); } else if (panel.status !== 'loading') { setActivePanel(panelIndex); setIsPromptModalOpen(true); } };
    const handleEditPanelClick = (panelIndex: number) => { /* ... */ if (isSaving || isLoading || !comic || !comic.panels || comic.panels[panelIndex]?.status !== 'complete') return; setActivePanel(panelIndex); setIsPromptModalOpen(true); };

    // (handlePromptSubmit uses the updated generateImageAPI)
    const handlePromptSubmit = async (prompt: string) => {
        if (activePanel === null || !comic || !comic.panels) return;
        const panelIndex = activePanel;
        // (Construct fullPrompt logic remains the same)
        let metadataPrefix = ''; if (comic.title) metadataPrefix += `Comic Title: ${comic.title}. `; if (comic.genre) metadataPrefix += `Genre: ${comic.genre}. `; if (comic.characters && comic.characters.length > 0) { metadataPrefix += 'Characters: '; comic.characters.forEach(char => { if (char.name && char.description) metadataPrefix += `(${char.name}: ${char.description}) `; else if (char.name) metadataPrefix += `(${char.name}) `; }); } metadataPrefix = metadataPrefix.trim(); const fullPrompt = metadataPrefix ? `${metadataPrefix}\\n\\nPanel Prompt: ${prompt}` : prompt;

        setIsPromptModalOpen(false);
        setActivePanel(null);
        updatePanelContent(panelIndex, { status: 'loading', prompt: prompt, error: undefined });

        try {
            console.log("Sending prompt to API via generateImageAPI:", fullPrompt);
            const response = await generateImageAPI(fullPrompt); // Uses updated function

            updatePanelContent(panelIndex, {
                status: 'complete',
                imageUrl: response.imageUrl,
                prompt: prompt,
                error: undefined
            });
            console.log(`Panel ${panelIndex + 1} generation success.`);
        } catch (error) {
            console.error(`Panel ${panelIndex + 1} generation failed:`, error);
            updatePanelContent(panelIndex, {
                status: 'error',
                error: error instanceof Error ? error.message : 'Image generation failed.',
                prompt: prompt,
                imageUrl: undefined
            });
        }
    };

    // --- Save Comic Handler (Uses saveComic from context, which needs implementation) ---
    const handleSaveComic = async () => {
        if (!canPublish || isSaving || isLoading) return;
        console.log("Attempting to save new comic...");
        try {
            // Call save function from context - this needs to be implemented in useComic hook
            const savedComicData = await saveComic();

            if (savedComicData && savedComicData.id) {
                console.log("Save successful, comic ID:", savedComicData.id);
                alert("Comic saved successfully!"); // Replace with better UX (e.g., toast)
                // Redirect to the view/edit page for the *saved* comic
                router.push(`/comics/${savedComicData.id}`); // Redirect to the comic's page
            } else {
                // If saveComic resolved without an ID, something went wrong
                console.error("Save failed or returned no ID.");
                 alert(`Failed to save comic. ${comicHookError || 'Please try again.'}`);
            }
        } catch (error) {
             // Catch errors thrown by saveComic (e.g., API errors)
             console.error("Error during handleSaveComic:", error);
             alert(`Failed to save comic: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    };

    // --- Render Logic ---
    // (Keep existing loading/error/render logic)
    if (isLoading) { /* ... Loading UI ... */ return <div className="flex justify-center items-center min-h-screen"><Loader2 className="h-16 w-16 animate-spin" /></div>; }
    if (comicHookError || (!isLoading && !comic.template)) { /* ... Error UI ... */ const errorMsg = comicHookError || "Failed to load editor."; return <div className="text-red-600">{errorMsg}</div>; }
    const canPublish = comic.panels?.every(p => p.status === 'complete');
    const templateName = templates[comic.template || '']?.name || 'Unknown Template';

    return (
        <div className="container mx-auto py-8 px-4">
            {/* (Rest of the JSX remains largely the same, using updated handlers) */}
             <div className="mb-6"> <Link href="/comics/create" className="inline-flex items-center text-blue-600 hover:text-blue-800"><ArrowLeft className="h-4 w-4 mr-1" /> Back </Link> </div>
             <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4"> <h1 className="text-3xl font-bold break-words">{comic.title || `New ${templateName} Comic`}</h1> <div className="flex gap-3 flex-shrink-0"> <Button onClick={handleSaveComic} disabled={isSaving || !canPublish || isLoading} title={!canPublish ? "All panels must have images." : ""}> {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null} {isSaving ? 'Saving...' : 'Save Comic'} </Button> </div> </div>
             <div className="bg-white rounded-lg shadow-md p-4 md:p-6"> <h2 className="text-xl font-semibold mb-2">Edit Panels ({comic.panels?.length || 0} total - {templateName})</h2> <p className="text-gray-600 mb-6 text-sm">Click empty panels to generate, click images to zoom, use ✏️ to regenerate.</p> {comic.template && comic.panels ? <ComicCanvas panels={comic.panels} onPanelClick={handlePanelClick} onEditPanelClick={handleEditPanelClick} layout={comic.template} /> : <div>No panels loaded.</div>} </div>
             <PanelPromptModal isOpen={isPromptModalOpen} onClose={() => setIsPromptModalOpen(false)} onSubmit={handlePromptSubmit} panelNumber={activePanel !== null ? activePanel + 1 : 0} initialPrompt={activePanel !== null && comic.panels?.[activePanel]?.prompt || ''} isRegenerating={activePanel !== null && comic.panels?.[activePanel]?.status === 'complete'} />
             <ImageZoomModal isOpen={isZoomModalOpen} onClose={() => setIsZoomModalOpen(false)} imageUrl={zoomedImageUrl} />
        </div>
    );
}

// --- Suspense Wrapper ---
export default function NewComicEditorPage() {
    return ( <Suspense fallback={ <div className="flex justify-center items-center min-h-screen"><Loader2 className="h-16 w-16 animate-spin" /></div> }> <NewComicEditorContent /> </Suspense> );
}
