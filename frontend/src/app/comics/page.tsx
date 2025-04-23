// src/app/comics/create/page.tsx
// PURPOSE: Allow users to select a template to start a new comic creation process.

'use client';

import { useRouter } from 'next/navigation';
import TemplateSelector from '@/components/comic/template-selector'; // Ensure this path is correct
import { useState } from 'react';

// Mock function to simulate creating a new comic entry in the backend
// Replace this with your actual API call logic.
// It should take a templateId and return the unique ID of the created comic.
async function createNewComicAPI(templateId: string): Promise<{ id: string }> {
  console.log(`API CALL (MOCK): Creating comic with template: ${templateId}`);
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 700));
  // In a real app, you'd get the ID from the backend response
  const newId = `comic_${templateId}_${Date.now()}`;
  console.log(`API CALL (MOCK): Received new comic ID: ${newId}`);
  return { id: newId };
}

export default function CreateComicPage() {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false); // State to handle loading/disabling UI
  const [error, setError] = useState<string | null>(null); // State for error messages

  // This function is called when a template is selected in the TemplateSelector component
  const handleTemplateSelect = async (templateId: string) => {
    if (isCreating) return; // Prevent multiple clicks

    console.log(`Template selected by user: ${templateId}`);
    setIsCreating(true); // Indicate loading state
    setError(null); // Clear previous errors

    try {
      // --- Step 1: Call the backend to create a new comic entry ---
      const newComic = await createNewComicAPI(templateId);
      const newComicId = newComic.id;

      if (!newComicId) {
          throw new Error("Failed to get a valid ID from the backend.");
      }

      // --- Step 2: Navigate to the editor page for the new comic ---
      console.log(`Navigating to editor page: /comics/${newComicId}`);
      router.push(`/comics/${newComicId}`);

    } catch (err) {
      console.error("Failed to create comic or navigate:", err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred. Please try again.');
      setIsCreating(false); // Re-enable UI on error
    }
    // No need to set isCreating back to false on success, as the page navigates away.
  };

  return (
    <div className="container mx-auto py-8">
      {/* Page Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Create New Comic</h1>
        {/* Add any other header elements if needed */}
      </div>

      {/* Template Selection Area */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">1. Choose a Template</h2>
        <p className="text-gray-600 mb-6">Select a layout to start your comic.</p>

        {/* Display error message if creation fails */}
        {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 border border-red-300 rounded">
                <strong>Error:</strong> {error}
            </div>
        )}

        {/* The TemplateSelector component handles displaying templates */}
        {/* It needs an onSelect prop that triggers handleTemplateSelect */}
        <TemplateSelector
            onSelect={handleTemplateSelect}
            disabled={isCreating} // Disable selector while processing
        />

        {/* Optional: Show a loading indicator */}
        {isCreating && (
            <div className="mt-4 text-center text-gray-500">
                Creating your comic space...
            </div>
        )}
      </div>
    </div>
  );
}