// src/app/comics/editor/page.tsx
// PURPOSE: Editor interface for NEW comics, initialized via templateId query param.

'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import ComicCanvas from '@/components/comic/comic-canvas';
import PanelPromptModal from '@/components/comic/panel-prompt-modal'; // Ensure this component accepts 'isRegenerating' prop
import ImageZoomModal from '@/components/comic/image-zoom-modal';
import { useComicContext } from '@/context/comic-context';
import { templates } from '@/hooks/use-comic'; // Import templates
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';

// --- API Call Function (generateImageAPI) ---
async function generateImageAPI(prompt: string): Promise<{ imageUrl: string }> {    
    const apiUrl = 'https://comiccreator.info/api/comics/generate';
    console.log(`Calling API: ${apiUrl} with prompt: "${prompt}"`);
    const requestBody = { prompt: prompt };

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json'},
            body: JSON.stringify(requestBody),
        });
        if (!response.ok) {
            let errorDetails = `HTTP error! Status: ${response.status}`;
            try {                
                const errorData = await response.json();
                errorDetails += ` - ${errorData.message || JSON.stringify(errorData)}`;
            } catch (jsonError) {                
                errorDetails += ` - ${response.statusText}`;
            }
            throw new Error(errorDetails);
        }
        const data = await response.json();
        if (!data.imageUrl) {
            console.error("API response missing 'imageUrl' or expected field:", data);            
            throw new Error("API response did not contain the expected 'imageUrl' field.");
        }
        console.log("API call successful, received data:", data);        
        return { imageUrl: data.imageUrl };
    } catch (error) {
        console.error('Error calling generateImageAPI:', error);
        throw error; // Re-throw the error to be caught by the caller
    }
}

// --- Main Editor Page Component ---
function NewComicEditorContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const templateId = searchParams.get('templateId'); // Get templateId from URL

    // Local state for UI interactions
    const [activePanel, setActivePanel] = useState<number | null>(null);
    const [isPromptModalOpen, setIsPromptModalOpen] = useState(false);
    const [isZoomModalOpen, setIsZoomModalOpen] = useState(false);
    const [zoomedImageUrl, setZoomedImageUrl] = useState<string | null>(null);

    // Get comic state and functions from context
    const {
        comic,
        updatePanelContent,
        updateComicMetadata, // For title changes etc.
        saveComic, // Function to save the comic
        isLoading, // Loading state from the hook
        isSaving, // Saving state from the hook
        error: comicHookError, // Error state from the hook
        // Add character functions if you implement UI for them here
        // addCharacter, removeCharacter, updateCharacter
    } = useComicContext();

    // --- Effects ---
    useEffect(() => {
        if (comicHookError) {
            console.error("Comic Hook Error:", comicHookError);
            // Consider showing an error message to the user (e.g., using a toast library)
            // alert(`Error: ${comicHookError}`); // Simple alert example
        }
    }, [comicHookError]);

    // Effect to handle missing/invalid template ID after initial load attempt
    useEffect(() => {
        if (!isLoading && !comic.template && templateId) {
            // If loading finished, we expected a template from templateId, but it's not set
             console.error(`Editor loaded but failed to initialize template for ID: ${templateId}. It might be invalid.`);
             // Optionally redirect or show a persistent error
             // router.push('/comics/create?error=invalid_template');
        } else if (!isLoading && !comic.template && !templateId) {
            // If loading finished and there was no templateId, it's an invalid state for this page
            console.error("Editor loaded without a template ID. Redirecting.");
            router.push('/comics/create'); // Redirect to template selection
        }
    }, [isLoading, comic.template, templateId, router]);


    // --- Editor Handlers ---
    const handlePanelClick = (panelIndex: number) => {
        if (isSaving || isLoading || !comic || !comic.panels || !comic.panels[panelIndex]) return;
        const panel = comic.panels[panelIndex];
        if (panel.status === 'complete' && panel.imageUrl) {
            setZoomedImageUrl(panel.imageUrl);
            setIsZoomModalOpen(true);
        } else if (panel.status !== 'loading') {
            // Open prompt modal for empty or errored panels
            setActivePanel(panelIndex);
            setIsPromptModalOpen(true);
        }
    };

    const handleEditPanelClick = (panelIndex: number) => {
         if (isSaving || isLoading || !comic || !comic.panels || comic.panels[panelIndex]?.status !== 'complete') return;
         // Open prompt modal for regeneration
         setActivePanel(panelIndex);
         setIsPromptModalOpen(true);
    };

    const handlePromptSubmit = async (prompt: string) => {
        if (activePanel === null || !comic || !comic.panels) return;

        const panelIndex = activePanel;
        const currentPanel = comic.panels[panelIndex];

        // Close modal and reset active state immediately
        setIsPromptModalOpen(false);
        setActivePanel(null);

        // Update panel state to loading optimistically
        updatePanelContent(panelIndex, { status: 'loading', prompt: prompt, error: undefined }); // Clear previous error

        try {
            // Call the API
            const response = await generateImageAPI(prompt);
            // Update panel state on success
            updatePanelContent(panelIndex, {
                status: 'complete',
                imageUrl: response.imageUrl,
                prompt: prompt, // Keep the successful prompt
                error: undefined // Ensure error is cleared
            });
            console.log(`Panel ${panelIndex + 1} generation success.`);
        } catch (error) {
            console.error(`Panel ${panelIndex + 1} generation failed:`, error);
            // Update panel state on error
            updatePanelContent(panelIndex, {
                status: 'error',
                error: error instanceof Error ? error.message : 'Image generation failed.',
                prompt: prompt, // Keep the prompt that failed
                imageUrl: undefined // Clear image URL on error
            });
             // Optionally re-open the prompt or show a specific error message
             // setActivePanel(panelIndex); // Maybe allow retry?
             // setIsPromptModalOpen(true); // Or maybe not, show error on panel?
        }
    };

    // --- Save Comic Handler ---
    const handleSaveComic = async () => {
        if (!canPublish || isSaving) return; // Ensure all panels are complete

        console.log("Attempting to save new comic...");
        // Potentially update metadata just before saving if you have input fields
        // updateComicMetadata({ title: currentTitleState, description: currentDescState });

        const savedComicData = await saveComic(); // Call save function from context

        if (savedComicData && savedComicData.id) {
            console.log("Save successful, comic ID:", savedComicData.id);
            alert("Comic saved successfully!"); // Replace with better UX
            // Redirect to the view/edit page for the *saved* comic
            // router.push(`/comics/edit/${savedComicData.id}`); // Example redirect
        } else {
            console.error("Save failed or returned no ID.");
            alert(`Failed to save comic. ${comicHookError || 'Please try again.'}`); // Show error from hook if available
        }
    };

    // --- Render Logic ---

    // Initial Loading State (covers hook loading and initial template setup)
    if (isLoading) {
        return (
            <div className="container mx-auto py-8 flex justify-center items-center min-h-screen">
                <Loader2 className="h-16 w-16 text-blue-500 animate-spin" />
                <span className="ml-4 text-xl text-gray-600">Loading Editor...</span>
            </div>
        );
    }

    // Error State (if hook reports error OR if template failed to load correctly)
    // Check comicHookError OR if loading is done but template is still missing (implies an issue)
    if (comicHookError || (!isLoading && !comic.template)) {
        const errorMsg = comicHookError || (templateId ? `Failed to initialize editor with template ID: ${templateId}. It might be invalid.` : "Editor could not be initialized. Template ID missing.");
        return (
            <div className="container mx-auto py-8 px-4 text-center">
                <h2 className="text-2xl text-red-600 mb-4">Error Loading Editor</h2>
                <p className="text-gray-700 mb-4">{errorMsg}</p>
                <Link href="/comics/create">
                    <Button variant="outline">Choose Template</Button>
                </Link>
            </div>
        );
    }

    // Calculate if publishing/saving is possible (all panels complete)
    const canPublish = comic.panels && comic.panels.length > 0 && comic.panels.every(p => p.status === 'complete');
    const templateName = templates[comic.template || '']?.name || 'Unknown Template';

    // --- Main Editor JSX ---
    return (
        <div className="container mx-auto py-8 px-4">
            {/* Back Navigation */}
            <div className="mb-6">
                <Link href="/comics/create" className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors">
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    Back to Template Selection
                </Link>
            </div>

            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                {/* TODO: Make title editable */}
                 <h1 className="text-3xl font-bold break-words">
                    {comic.title || `New ${templateName} Comic`}
                </h1>
                 {/* Action Buttons */}
                <div className="flex gap-3 flex-shrink-0">
                    {/* Add other buttons here if needed (e.g., Edit Metadata) */}
                    <Button
                        onClick={handleSaveComic}
                        disabled={isSaving || !canPublish || isLoading} // Disable if saving, loading, or not ready
                        title={!canPublish ? "All panels must have generated images before saving." : (isSaving ? "Processing..." : "Save Comic")}
                    >
                        {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        {isSaving ? 'Saving...' : 'Save Comic'}
                    </Button>
                </div>
            </div>

            {/* Editor Area */}
            <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
                <h2 className="text-xl font-semibold mb-2">Edit Panels ({comic.panels?.length || 0} total - {templateName})</h2>
                <p className="text-gray-600 mb-6 text-sm">
                Click an empty panel area to generate an image. Click a completed panel&apos;s image to zoom. Use the pencil icon (✏️) on a completed panel to regenerate its image.
                </p>
                {comic.template && comic.panels ? (
                    <ComicCanvas
                        panels={comic.panels}
                        onPanelClick={handlePanelClick}
                        onEditPanelClick={handleEditPanelClick} // Pass the edit handler
                        layout={comic.template} // Pass the template ID for layout lookup in ComicCanvas
                    />
                ) : (
                     <div className="text-center text-gray-500">No panels loaded. Template might be missing.</div>
                )}
            </div>

            {/* Modals */}
            {/* Ensure PanelPromptModal component accepts and uses the 'isRegenerating' prop */}
            <PanelPromptModal
                isOpen={isPromptModalOpen}
                onClose={() => setIsPromptModalOpen(false)}
                onSubmit={handlePromptSubmit}
                panelNumber={activePanel !== null ? activePanel + 1 : 0}
                initialPrompt={activePanel !== null && comic.panels && comic.panels[activePanel] ? comic.panels[activePanel].prompt || '' : ''}
                // This prop causes the error if PanelPromptModal doesn't expect it:
                isRegenerating={activePanel !== null && comic.panels && comic.panels[activePanel]?.status === 'complete'}
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
    // Wrap the component that uses useSearchParams in Suspense
    return (
        <Suspense fallback={
            <div className="container mx-auto py-8 flex justify-center items-center min-h-screen">
                <Loader2 className="h-16 w-16 text-blue-500 animate-spin" />
                <span className="ml-4 text-xl text-gray-600">Loading Page Structure...</span>
            </div>
        }>
            <NewComicEditorContent />
        </Suspense>
    );
}