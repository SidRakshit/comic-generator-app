'use client';

import { useState } from 'react';
import ComicCanvas from '@/components/comic/ComicCanvas';
import TemplateSelector from '@/components/comic/TemplateSelector';
import PanelPromptModal from '@/components/comic/PanelPromptModal';
import { useComic } from '@/hooks/useComic';
import { Button } from '@/components/ui/button';

export default function CreateComicPage() {
  const { comic, setTemplate, updatePanelContent, saveComic, isSaving } = useComic();
  const [activePanel, setActivePanel] = useState<number | null>(null);
  const [isPromptModalOpen, setIsPromptModalOpen] = useState(false);

  // Handle template selection
  const handleTemplateSelect = (templateId: string) => {
    setTemplate(templateId);
  };

  // Open prompt modal for a specific panel
  const handlePanelClick = (panelId: number) => {
    setActivePanel(panelId);
    setIsPromptModalOpen(true);
  };

  // Handle prompt submission
  const handlePromptSubmit = async (prompt: string) => {
    if (activePanel === null) return;
    
    try {
      // Show loading state in the panel
      updatePanelContent(activePanel, {
        status: 'loading',
        prompt: prompt
      });
      
      setIsPromptModalOpen(false);
      
      // Placeholder for API call
      // In a real implementation, this would call your AI image generation service
      const response = await mockGenerateImage(prompt);
      
      // Update panel with generated content
      updatePanelContent(activePanel, {
        status: 'complete',
        prompt: prompt,
        imageUrl: response.imageUrl
      });
    } catch (error) {
      console.error('Failed to generate panel:', error);
      updatePanelContent(activePanel, {
        status: 'error',
        prompt: prompt,
        error: 'Failed to generate image. Please try again.'
      });
    }
  };

  // Placeholder function for API call
  const mockGenerateImage = async (prompt: string) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Return mock data
    return {
      imageUrl: `/api/mock-image?prompt=${encodeURIComponent(prompt)}`,
      // In your real implementation, this would be the actual image from your backend
    };
  };

  // Handle save comic
  const handleSaveComic = async () => {
    try {
      await saveComic();
      // Redirect to comic view or dashboard
      // window.location.href = '/comics';
    } catch (error) {
      console.error('Failed to save comic:', error);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Create New Comic</h1>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => console.log('Draft saved')}>
            Save Draft
          </Button>
          <Button onClick={handleSaveComic} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Publish Comic'}
          </Button>
        </div>
      </div>

      {!comic.template ? (
        // Step 1: Select a template
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Choose a Template</h2>
          <TemplateSelector onSelect={handleTemplateSelect} />
        </div>
      ) : (
        // Step 2: Fill panels with content
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">
            Fill Your Panels
          </h2>
          <p className="text-gray-600 mb-6">
            Click on each panel and enter a prompt to generate an image.
          </p>
          
          <ComicCanvas 
            panels={comic.panels} 
            onPanelClick={handlePanelClick} 
          />
          
          <div className="mt-6 flex justify-between">
            <Button 
              variant="outline" 
              onClick={() => setTemplate(null)}
            >
              Change Template
            </Button>
            <Button 
              onClick={handleSaveComic} 
              disabled={isSaving || comic.panels.some(p => p.status !== 'complete')}
            >
              {isSaving ? 'Saving...' : 'Publish Comic'}
            </Button>
          </div>
        </div>
      )}

      {/* Prompt Modal */}
      <PanelPromptModal 
        isOpen={isPromptModalOpen}
        onClose={() => setIsPromptModalOpen(false)}
        onSubmit={handlePromptSubmit}
        panelNumber={activePanel !== null ? activePanel + 1 : 0}
        initialPrompt={activePanel !== null && comic.panels[activePanel] 
          ? comic.panels[activePanel].prompt || '' 
          : ''}
      />
    </div>
  );
}