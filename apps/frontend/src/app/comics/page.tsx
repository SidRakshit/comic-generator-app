// src/app/comics/create/page.tsx
// PURPOSE: Allow users to select a template to start a new comic creation process.

'use client';

import { useRouter } from 'next/navigation';
import TemplateSelector from '@/components/comic/template-selector'; // Ensure this path is correct
import { useState } from 'react';
import { SEMANTIC_COLORS, UI_CONSTANTS, API_ENDPOINTS } from "@repo/common-types";
import { apiRequest } from '@/lib/api';

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
      // Create a proper CreateComicRequest object with required fields
      const comicRequest = {
        title: "Untitled Comic", // Default title, user can change later
        description: "", // Empty description
        template: templateId,
        pages: [] // Empty pages array, user will add content in editor
      };

      const newComic = await apiRequest<any>(API_ENDPOINTS.COMICS, "POST", comicRequest);
      const newComicId = newComic.comic_id;

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
