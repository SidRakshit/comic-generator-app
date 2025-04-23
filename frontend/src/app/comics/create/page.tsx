// src/app/comics/create/page.tsx
// UPDATED: Multi-step form for metadata and template selection.

'use client';

import { useRouter } from 'next/navigation';
import TemplateSelector from '@/components/comic/template-selector';
import { useState, ChangeEvent } from 'react'; // Import ChangeEvent
import { Button } from '@/components/ui/button';
import { Loader2, Plus, Trash2 } from 'lucide-react';
// --- MODIFIED: Import useComic and character management functions ---
import { useComicContext } from '@/context/comic-context';
import { Input } from '@/components/ui/input'; // Assuming you have ShadCN UI Input
import { Label } from '@/components/ui/label'; // Assuming you have ShadCN UI Label
import { Textarea } from '@/components/ui/textarea'; // Assuming you have ShadCN UI Textarea

export default function CreateComicPage() {
  const router = useRouter();
  // --- Step state ---
  const [step, setStep] = useState<'metadata' | 'template'>('metadata');
  // --- Use the hook directly ---
  const {
    comic,
    setTemplate,
    updateComicMetadata,
    addCharacter,
    removeCharacter,
    updateCharacter,
} = useComicContext(); // Initialize without ID or templateId

  const [isNavigating, setIsNavigating] = useState(false);
  // const [error, setError] = useState<string | null>(null); // Maybe use hookError if needed later

  // --- Handlers ---

  const handleMetadataChange = (
      e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement> // Added Select
  ) => {
      updateComicMetadata({ [e.target.name]: e.target.value });
  };

  const handleCharacterChange = (
      id: string,
      field: 'name' | 'description',
      value: string
  ) => {
      updateCharacter(id, field, value);
  };

  const goToNextStep = () => {
      // Optional: Add validation for required metadata fields here
      if (!comic.title) {
          alert("Please enter a title for the comic.");
          return;
      }
      setStep('template');
  };

  const goToPreviousStep = () => {
      setStep('metadata');
  };

  // Called when a template is selected in TemplateSelector
  const handleTemplateSelect = (templateId: string) => {
    if (isNavigating) return;
    console.log(`Template selected: ${templateId}`);

    // 1. Set template in context state
    setTemplate(templateId); // This updates the shared state

    // 2. Navigate to the generic editor page (no query param needed now)
    setIsNavigating(true);
    try {
      const editorUrl = `/comics/editor`; // Navigate to the editor page
      console.log(`Navigating to new comic editor: ${editorUrl}`);
      router.push(editorUrl);
    } catch (err) {
      console.error("Failed to navigate:", err);
      setIsNavigating(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Create New Comic</h1>
      </div>

      <div className="bg-white rounded-lg shadow p-6">

        {/* --- Step 1: Metadata --- */}
        {step === 'metadata' && (
          <div>
            <h2 className="text-xl font-semibold mb-4">1. Enter Comic Details</h2>
            <div className="space-y-4">
              {/* Title */}
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  name="title"
                  value={comic.title}
                  onChange={handleMetadataChange}
                  placeholder="Your Awesome Comic Title"
                  required
                />
              </div>
              {/* Genre */}
              <div>
                <Label htmlFor="genre">Genre (Optional)</Label>
                <Input
                  id="genre"
                  name="genre"
                  value={comic.genre || ''}
                  onChange={handleMetadataChange}
                  placeholder="e.g., Superhero, Sci-Fi, Slice of Life"
                />
              </div>
              {/* Description */}
               <div>
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={comic.description || ''}
                  onChange={handleMetadataChange}
                  placeholder="Brief description of your comic"
                />
              </div>

              {/* Characters */}
              <div>
                 <h3 className="text-lg font-semibold mb-2 border-t pt-4">Characters</h3>
                 {comic.characters?.map((char, index) => (
                     <div key={char.id} className="p-3 border rounded mb-3 space-y-2 relative bg-gray-50">
                         <Label className="font-medium">Character {index + 1}</Label>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              <div>
                                 <Label htmlFor={`char-name-${char.id}`} className="text-sm">Name</Label>
                                 <Input
                                     id={`char-name-${char.id}`}
                                     value={char.name}
                                     onChange={(e) => handleCharacterChange(char.id, 'name', e.target.value)}
                                     placeholder="Character Name"
                                 />
                             </div>
                              <div>
                                 <Label htmlFor={`char-desc-${char.id}`} className="text-sm">Description</Label>
                                 <Input // Or Textarea if preferred
                                     id={`char-desc-${char.id}`}
                                     value={char.description}
                                     onChange={(e) => handleCharacterChange(char.id, 'description', e.target.value)}
                                     placeholder="Brief description (e.g., appearance, role)"
                                 />
                             </div>
                         </div>
                         {/* Remove Button - only show if more than 1 character */}
                         {(comic.characters?.length ?? 0) > 1 && (
                             <Button
                                 type="button"
                                 variant="ghost"
                                 size="icon"
                                 className="absolute top-1 right-1 h-6 w-6 text-red-500 hover:text-red-700"
                                 onClick={() => removeCharacter(char.id)}
                                 aria-label="Remove Character"
                             >
                                 <Trash2 className="h-4 w-4" />
                             </Button>
                         )}
                     </div>
                 ))}
                 {/* Add Character Button */}
                 <Button type="button" variant="outline" size="sm" onClick={addCharacter} className="mt-2">
                     <Plus className="h-4 w-4 mr-1" /> Add Character
                 </Button>
              </div>

            </div>
            {/* Navigation Button */}
            <div className="mt-6 text-right">
              <Button onClick={goToNextStep}>Next: Choose Template</Button>
            </div>
          </div>
        )}

        {/* --- Step 2: Template Selection --- */}
        {step === 'template' && (
           <div>
             <h2 className="text-xl font-semibold mb-4">2. Choose a Template</h2>
             <p className="text-gray-600 mb-6">Select a layout to begin.</p>

             {/* TemplateSelector component */}
             <TemplateSelector
                 onSelect={handleTemplateSelect}
                 disabled={isNavigating} // Disable while processing selection
             />

             {/* Loading indicator */}
             {isNavigating && (
                 <div className="mt-4 flex justify-center items-center text-gray-500">
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                     Loading editor...
                 </div>
             )}

             {/* Navigation Buttons */}
              <div className="mt-6 flex justify-between">
                 <Button variant="outline" onClick={goToPreviousStep} disabled={isNavigating}>
                     Back to Details
                 </Button>
                 {/* No "Next" button here, selection triggers navigation */}
             </div>
           </div>
        )}

      </div>
    </div>
  );
}