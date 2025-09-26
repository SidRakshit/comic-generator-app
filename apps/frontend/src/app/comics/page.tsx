// src/app/comics/create/page.tsx
// PURPOSE: Allow users to select a template to start a new comic creation process.

'use client';

import { useRouter } from 'next/navigation';
import TemplateSelector from '@/components/comic/template-selector'; // Ensure this path is correct
import { useState } from 'react';
import { SEMANTIC_COLORS, UI_CONSTANTS } from "@repo/common-types";

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
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // This function is called when a template is selected in the TemplateSelector component
  const handleTemplateSelect = async (templateId: string) => {
    if (isCreating) return;
    console.log(`Template selected by user: ${templateId}`);
    setIsCreating(true);
    setError(null);

    try {
      const newComic = await createNewComicAPI(templateId);
      const newComicId = newComic.id;

      if (!newComicId) {
          throw new Error("Failed to get a valid ID from the backend.");
      }

      console.log(`Navigating to editor page: /comics/${newComicId}`);
      router.push(`/comics/${newComicId}`);

    } catch (err) {
      console.error("Failed to create comic or navigate:", err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred. Please try again.');
      setIsCreating(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Create New Comic</h1>
      </div>

  
      <div className={`${SEMANTIC_COLORS.BACKGROUND.PRIMARY} ${UI_CONSTANTS.BORDER_RADIUS.LARGE} shadow p-6`}>
        <h2 className="text-xl font-semibold mb-4">1. Choose a Template</h2>
        <p className={`${SEMANTIC_COLORS.TEXT.SECONDARY} mb-6`}>Select a layout to start your comic.</p>

        {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 border border-red-300 rounded">
                <strong>Error:</strong> {error}
            </div>
        )}

        <TemplateSelector
            onSelect={handleTemplateSelect}
            disabled={isCreating}
        />
        
        {isCreating && (
            <div className="mt-4 text-center text-gray-500">
                Creating your comic space...
            </div>
        )}
      </div>
    </div>
  );
}