// src/app/comics/[id]/page.tsx
// PURPOSE: Provide the editor interface for a specific comic identified by [id].
// UPDATED: Added image zoom modal and separate edit button logic.

'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import ComicCanvas from '@/components/comic/comic-canvas';         // Verify path
import PanelPromptModal from '@/components/comic/panel-prompt'; // Verify path
import ImageZoomModal from '@/components/comic/image-zoom-modal';   // <--- UPDATED: Corrected path for the Zoom Modal component
import { useComicContext } from '@/context/comic-context';                  // Verify path
import { Button } from '@/components/ui/button';                 // Verify path
import { Panel } from '@/hooks/use-comic';                        // Verify path
import { ArrowLeft, Loader2 } from 'lucide-react';                // Verify path

// --- API Call Function (generateImageAPI) remains the same ---
async function generateImageAPI(prompt: string): Promise<{ imageUrl: string }> {
  const apiUrl = 'https://comiccreator.info/api/comics/generate-panel-image';
  console.log(`Calling API: ${apiUrl} with description: "${prompt}"`);
  const requestBody = { panelDescription: prompt };
  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });
    if (!response.ok) {
      let errorDetails = `HTTP error! Status: ${response.status}`;
      try { const errorData = await response.json(); errorDetails += ` - ${JSON.stringify(errorData)}`; }
      catch (jsonError) { errorDetails += ` - ${response.statusText}` }
      throw new Error(errorDetails);
    }
    const data = await response.json();
    if (!data.imageUrl) {
      console.error("Actual API response data:", data);
      throw new Error("API response did not contain the expected 'imageUrl' field.");
    }
    console.log("API call successful, received imageUrl:", data.imageUrl);
    return { imageUrl: data.imageUrl };
  } catch (error) {
    console.error('Error calling generateImageAPI:', error);
    throw error;
  }
}

export default function ComicEditorPage() {
  const params = useParams();
  const router = useRouter();
  const comicId = params.id as string;

  const [activePanel, setActivePanel] = useState<number | null>(null);
  const [isPromptModalOpen, setIsPromptModalOpen] = useState(false);
  const [isZoomModalOpen, setIsZoomModalOpen] = useState(false);
  const [zoomedImageUrl, setZoomedImageUrl] = useState<string | null>(null);

  const {
    comic,
    updatePanelContent,
    updateComicMetadata,
    saveComic,
    isLoading,
    isSaving,
    error: comicHookError,
} = useComicContext();

  useEffect(() => {
    if (comicHookError) {
        console.error("Hook Error (load/save):", comicHookError);
    }
  }, [comicHookError]);


  const handlePanelClick = (panelIndex: number) => {
    if (isSaving || !comic) return;

    const panel = comic.panels[panelIndex];

    if (panel.status === 'complete' && panel.imageUrl) {
      setZoomedImageUrl(panel.imageUrl);
      setIsZoomModalOpen(true);
    } else if (panel.status !== 'loading') {
      setActivePanel(panelIndex);
      setIsPromptModalOpen(true);
    }
  };

  const handleEditPanelClick = (panelIndex: number) => {
    if (isSaving || !comic || comic.panels[panelIndex]?.status !== 'complete') return;
    setActivePanel(panelIndex);
    setIsPromptModalOpen(true);
  };
  
  const handlePromptSubmit = async (prompt: string) => {
    if (activePanel === null) return;
    const panelIndex = activePanel;

    setIsPromptModalOpen(false);
    setIsZoomModalOpen(false);
    setActivePanel(null);
    setZoomedImageUrl(null);

    updatePanelContent(panelIndex, { status: 'loading', prompt: prompt });

    try {
      const response = await generateImageAPI(prompt);
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
      const savedComic = await saveComic();
      console.log("Publish successful!", savedComic);
      router.push('/comics');
    } catch (error) {
      console.error('Failed to publish comic:', error);
    }
  };

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
            <Button onClick={handleSaveComic} disabled={isSaving || !canPublish} title={!canPublish ? "All panels must be complete." : "Publish"}>
                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {isSaving ? 'Publishing...' : 'Publish Comic'}
            </Button>
         </div>
      </div>

       {/* Editor Area */}
       <div className="bg-white rounded-lg shadow p-6">
         <h2 className="text-xl font-semibold mb-4">Edit Panels ({comic.panels.length} total)</h2>
         <p className="text-gray-600 mb-6">Click an empty panel to add content. Click an existing image to zoom, or use the edit icon to change it.</p>

         {/* Comic Canvas component */}
         <ComicCanvas
           panels={comic.panels}
           onPanelClick={handlePanelClick} // Now triggers zoom or prompt for empty
           onEditPanelClick={handleEditPanelClick} // <--- ADDED: Pass the new handler
           layout={comic.template}
         />
       </div>

      {/* Prompt Modal */}
      <PanelPromptModal
        isOpen={isPromptModalOpen}
        onClose={() => setIsPromptModalOpen(false)}
        onSubmit={handlePromptSubmit}
        panelNumber={activePanel !== null ? activePanel + 1 : 0}
        initialPrompt={activePanel !== null && comic.panels[activePanel] ? comic.panels[activePanel].prompt || '' : ''}
      />

      <ImageZoomModal
        isOpen={isZoomModalOpen}
        onClose={() => setIsZoomModalOpen(false)}
        imageUrl={zoomedImageUrl}
      />
    </div>
  );
}