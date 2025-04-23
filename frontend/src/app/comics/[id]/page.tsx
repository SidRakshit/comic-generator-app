// src/app/comics/[id]/page.tsx
// PURPOSE: Provide the editor interface for a specific comic identified by [id].
// UPDATED: generateImageAPI function reflects the new curl command.

'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import ComicCanvas from '@/components/comic/comic-canvas';         // Verify path
import PanelPromptModal from '@/components/comic/panel-prompt-modal'; // Verify path
import { useComic } from '@/hooks/use-comic';                     // Verify path
import { Button } from '@/components/ui/button';                 // Verify path
import { Panel } from '@/hooks/use-comic';                        // Verify path
import { ArrowLeft, Loader2 } from 'lucide-react';                // Verify path

// --- BEGIN: UPDATED API Call Function ---
// Function reflects the NEW curl command for generate-panel-image
async function generateImageAPI(prompt: string): Promise<{ imageUrl: string }> {
  // --- Use the new endpoint ---
  const apiUrl = 'https://comiccreator.info/api/comics/generate-panel-image';
  console.log(`Calling API: ${apiUrl} with description: "${prompt}"`);

  // --- Use the new request body structure ---
  const requestBody = {
    panelDescription: prompt // Key is now panelDescription
  };

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Add other headers like Authorization if needed
      },
      body: JSON.stringify(requestBody),
       // No '-k' equivalent - uses standard browser SSL validation
    });

    if (!response.ok) {
      let errorDetails = `HTTP error! Status: ${response.status}`;
      try { const errorData = await response.json(); errorDetails += ` - ${JSON.stringify(errorData)}`; }
      catch (jsonError) { errorDetails += ` - ${response.statusText}` }
      throw new Error(errorDetails);
    }

    // Parse the JSON response - expecting {"imageUrl": "..."}
    const data = await response.json();

    // Check if the expected field is present
    if (!data.imageUrl) {
      // Log the actual response if the expected field is missing
      console.error("Actual API response data:", data);
      throw new Error("API response did not contain the expected 'imageUrl' field.");
    }

    console.log("API call successful, received imageUrl:", data.imageUrl);
    // Return the object expected by the calling function
    return { imageUrl: data.imageUrl };

  } catch (error) {
    console.error('Error calling generateImageAPI:', error);
    throw error; // Re-throw to be caught by handlePromptSubmit
  }
}
// --- END: UPDATED API Call Function ---


// --- Main Editor Page Component ---
export default function ComicEditorPage() {
  const params = useParams();
  const router = useRouter();
  const comicId = params.id as string; // Get ID from dynamic route parameter

  // State for the editor UI interaction
  const [activePanel, setActivePanel] = useState<number | null>(null);
  const [isPromptModalOpen, setIsPromptModalOpen] = useState(false);

  // Fetching and managing comic state using the custom hook, keyed by comicId
  const {
    comic,
    updatePanelContent,
    updateComicMetadata, // Use if you add title/desc editing
    saveComic, // Hook function to save/publish
    isLoading, // Loading state from the hook
    isSaving, // Saving state from the hook
    error: comicHookError // Error state from the hook
   } = useComic(comicId); // Initialize hook WITH the comic ID

  // Effect to handle errors from the useComic hook
  useEffect(() => {
    if (comicHookError) {
        console.error("Hook Error (load/save):", comicHookError);
        // Optional: Show user notification
    }
  }, [comicHookError]);


  // --- Editor Handlers ---
  const handlePanelClick = (panelIndex: number) => {
    if (isSaving) return;
    setActivePanel(panelIndex);
    setIsPromptModalOpen(true);
  };

  // Uses the UPDATED generateImageAPI function
  const handlePromptSubmit = async (prompt: string) => {
    if (activePanel === null) return;
    const panelIndex = activePanel;
    setIsPromptModalOpen(false);
    setActivePanel(null);
    updatePanelContent(panelIndex, { status: 'loading', prompt: prompt }); // Show loading

    try {
      // --- Call the actual API function ---
      const response = await generateImageAPI(prompt); // Calls the updated function
      updatePanelContent(panelIndex, { status: 'complete', imageUrl: response.imageUrl, prompt: prompt, error: undefined });
      console.log(`Panel ${panelIndex} generation success.`);
    } catch (error) {
      console.error(`Panel ${panelIndex} generation failed:`, error);
      updatePanelContent(panelIndex, { status: 'error', error: error instanceof Error ? error.message : 'Generation failed.', prompt: prompt });
    }
  };

  const handleSaveComic = async () => {
    if (isSaving) return;
    console.log("Attempting to publish comic...");
    try {
      const savedComic = await saveComic(); // Assume hook handles API call
      console.log("Publish successful!", savedComic);
      router.push('/comics'); // Navigate after success
    } catch (error) {
      console.error('Failed to publish comic:', error);
      // Error already logged by hook effect
    }
  };

  // --- Render Logic ---
  if (isLoading && !comic) {
    return (
      <div className="container mx-auto py-8 flex justify-center items-center h-screen">
        <Loader2 className="h-16 w-16 text-blue-500 animate-spin" />
        <span className="ml-4 text-xl text-gray-600">Loading Editor...</span>
      </div>
    );
  }

  if (comicHookError && !comic) {
    return (
      <div className="container mx-auto py-8 text-center">
        <h2 className="text-2xl text-red-600 mb-4">Error Loading Comic</h2>
        <p className="text-gray-700 mb-4">{comicHookError}</p>
        <Link href="/comics/create"><Button variant="outline">Create New</Button></Link>
      </div>
    );
  }

  if (!comic) {
     return (
      <div className="container mx-auto py-8 text-center">
        <h2 className="text-2xl text-gray-600 mb-4">Comic Not Found</h2>
        <p className="text-gray-700 mb-4">Cannot find comic with ID: {comicId}</p>
        <Link href="/comics/create"><Button variant="outline">Create New</Button></Link>
      </div>
     );
  }

  const canPublish = comic.panels.every(p => p.status === 'complete');

  // --- Main Editor JSX ---
  return (
    <div className="container mx-auto py-8">
      {/* Back Navigation */}
       <div className="mb-6">
        <Link href="/comics" className="inline-flex items-center text-blue-600 hover:text-blue-800">
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to Comics List
        </Link>
      </div>

      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
         <h1 className="text-3xl font-bold">{comic.title || 'Edit Comic'}</h1>
         <div className="flex gap-3">
            {/* Publish Button */}
            <Button onClick={handleSaveComic} disabled={isSaving || !canPublish} title={!canPublish ? "All panels must be complete." : "Publish"}>
                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {isSaving ? 'Publishing...' : 'Publish Comic'}
            </Button>
         </div>
      </div>

       {/* Editor Area */}
       <div className="bg-white rounded-lg shadow p-6">
         <h2 className="text-xl font-semibold mb-4">Edit Panels ({comic.panels.length} total)</h2>
         <p className="text-gray-600 mb-6">Click a panel to generate its image.</p>

         {/* Comic Canvas component - Ensure it accepts 'layout' prop */}
         <ComicCanvas
           panels={comic.panels}
           onPanelClick={handlePanelClick}
           layout={comic.template} // Pass template string as layout
         />
       </div>

      {/* Modal - Ensure it accepts all these props */}
      <PanelPromptModal
        isOpen={isPromptModalOpen}
        onClose={() => setIsPromptModalOpen(false)}
        onSubmit={handlePromptSubmit} // Connects to function containing API call
        panelNumber={activePanel !== null ? activePanel + 1 : 0}
        initialPrompt={activePanel !== null && comic.panels[activePanel] ? comic.panels[activePanel].prompt || '' : ''}
      />
    </div>
  );
}