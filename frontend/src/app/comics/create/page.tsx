// src/app/comics/create/page.tsx
// PURPOSE: Allow users to select a template to start a new comic creation process.
//          Creates a new comic entry via API and navigates to the editor page.

'use client';

import { useRouter } from 'next/navigation';
import TemplateSelector from '@/components/comic/template-selector'; // Verify path
import { useState } from 'react';
import { Button } from '@/components/ui/button'; // If needed for other UI elements
import { Loader2 } from 'lucide-react'; // For loading indicator

export default function CreateComicPage() {
  const router = useRouter();
  const [isNavigating, setIsNavigating] = useState(false); // Renamed state
  const [error, setError] = useState<string | null>(null); // Keep error state for clarity

  // Called when a template is selected in TemplateSelector
  const handleTemplateSelect = (templateId: string) => { // Make it non-async
    if (isNavigating) return;

    console.log(`Template selected: ${templateId}`);
    setIsNavigating(true);
    setError(null);

    try {
      // Navigate to a generic editor route, passing templateId as query param
      const editorUrl = `/comics/editor?templateId=${encodeURIComponent(templateId)}`;
      console.log(`Navigating to new comic editor: ${editorUrl}`);
      router.push(editorUrl); // <--- MODIFIED NAVIGATION

      // No API call needed here for now
      // No need to reset isNavigating here, the page navigation handles it

    } catch (err) {
      // Catch potential errors during navigation preparation (though unlikely here)
      console.error("Failed to navigate:", err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred during navigation setup.');
      setIsNavigating(false); // Re-enable UI on error
    }
  };

  return (
    <div className="container mx-auto py-8">
      {/* ... (Header remains the same) ... */}
       <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Create New Comic</h1>
      </div>

      {/* Template Selection Area */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">1. Choose a Template</h2>
        <p className="text-gray-600 mb-6">Select a layout to begin.</p>

        {error && ( /* Error display remains useful */
            <div className="mb-4 p-3 bg-red-100 text-red-700 border border-red-300 rounded">
                <strong>Error:</strong> {error}
            </div>
        )}

        <TemplateSelector
            onSelect={handleTemplateSelect}
            disabled={isNavigating} // Use isNavigating state
        />

        {isNavigating && ( /* Update loading text */
            <div className="mt-4 flex justify-center items-center text-gray-500">
                 <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading editor...
            </div>
        )}
      </div>
    </div>
  );
}