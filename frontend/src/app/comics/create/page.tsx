// src/app/comics/create/page.tsx
// PURPOSE: Allow users to select a template to start a new comic creation process.
//          Creates a new comic entry via API and navigates to the editor page.

'use client';

import { useRouter } from 'next/navigation';
import TemplateSelector from '@/components/comic/template-selector'; // Verify path
import { useState } from 'react';
import { Button } from '@/components/ui/button'; // If needed for other UI elements
import { Loader2 } from 'lucide-react'; // For loading indicator

// Mock function to simulate creating a new comic entry in the backend
// Replace this with your actual API call logic.
async function createNewComicAPI(templateId: string): Promise<{ id: string }> {
  console.log(`API CALL (MOCK): Creating comic with template: ${templateId}`);
  await new Promise(resolve => setTimeout(resolve, 700)); // Simulate network delay
  const newId = `comic_${templateId}_${Date.now()}`; // Example ID generation
  console.log(`API CALL (MOCK): Received new comic ID: ${newId}`);
  // --- IMPORTANT: Replace with your actual API call ---
  // Example using fetch:
  // const response = await fetch('/api/comics', { // Your backend endpoint
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json', /* Add Auth headers if needed */ },
  //   body: JSON.stringify({ templateId: templateId })
  // });
  // if (!response.ok) {
  //   throw new Error(`Failed to create comic: ${response.statusText}`);
  // }
  // const data = await response.json(); // Expects { id: '...' }
  // return data;
  // --- End Replace ---
  return { id: newId }; // Return mock ID for now
}


export default function CreateComicPage() {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Called when a template is selected in TemplateSelector
  const handleTemplateSelect = async (templateId: string) => {
    if (isCreating) return;

    console.log(`Template selected: ${templateId}`);
    setIsCreating(true);
    setError(null);

    try {
      // Step 1: Call API to create the new comic entry
      const newComic = await createNewComicAPI(templateId);
      const newComicId = newComic.id;

      if (!newComicId) {
          throw new Error("Failed to get a valid ID for the new comic.");
      }

      // Step 2: Navigate to the dedicated editor page for this new comic
      console.log(`Navigating to editor page: /comics/${newComicId}`);
      router.push(`/comics/${newComicId}`); // <--- NAVIGATION HAPPENS HERE

    } catch (err) {
      console.error("Failed to create comic or navigate:", err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
      setIsCreating(false); // Re-enable UI on error
    }
  };

  return (
    <div className="container mx-auto py-8">
      {/* Page Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Create New Comic</h1>
        {/* Remove Save/Publish buttons - they belong on the editor page */}
      </div>

      {/* Template Selection Area */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">1. Choose a Template</h2>
        <p className="text-gray-600 mb-6">Select a layout to begin.</p>

        {/* Display error message if creation/navigation fails */}
        {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 border border-red-300 rounded">
                <strong>Error:</strong> {error}
            </div>
        )}

        {/* TemplateSelector component needs 'disabled' and 'onSelect' props */}
        {/* Ensure TemplateSelector component definition includes the 'disabled' prop */}
        <TemplateSelector
            onSelect={handleTemplateSelect}
            disabled={isCreating} // Disable while processing the selection
        />

        {/* Loading indicator while creating/navigating */}
        {isCreating && (
            <div className="mt-4 flex justify-center items-center text-gray-500">
                 <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating comic space...
            </div>
        )}
      </div>

      {/* NOTE: No ComicCanvas or PanelPromptModal is rendered here anymore */}
    </div>
  );
}