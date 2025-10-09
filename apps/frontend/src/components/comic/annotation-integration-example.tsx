"use client";

import { useState } from 'react';
import { DialogueBubble, Panel } from '@repo/common-types';
import PanelAnnotation from './panel-annotation';
import { apiRequest } from '@/lib/api';

interface AnnotationIntegrationExampleProps {
  comicId: string;
  panel: Panel;
  characters?: Array<{ id: string; name: string; description: string }>;
  onBubblesUpdated?: (bubbles: DialogueBubble[]) => void;
}

export default function AnnotationIntegrationExample({
  comicId,
  panel,
  characters = [],
  onBubblesUpdated
}: AnnotationIntegrationExampleProps) {
  const [isAnnotating, setIsAnnotating] = useState(false);
  const [bubbles, setBubbles] = useState<DialogueBubble[]>(panel.bubbles || []);
  const [isLoading, setIsLoading] = useState(false);

  const handleAnnotateClick = () => {
    setIsAnnotating(true);
  };

  const handleBubblesChange = (newBubbles: DialogueBubble[]) => {
    setBubbles(newBubbles);
  };

  const handleSaveAnnotations = async () => {
    if (!panel.id) return;

    setIsLoading(true);
    try {
      // Save annotations to backend
      const response = await apiRequest<{ success: boolean }>(
        `/api/comics/${comicId}/panels/${panel.id}/annotate`,
        'POST',
        { bubbles }
      );

      if (response.success) {
        onBubblesUpdated?.(bubbles);
        setIsAnnotating(false);
      }
    } catch (error) {
      console.error('Failed to save annotations:', error);
      // Handle error (show toast, etc.)
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelAnnotations = () => {
    setBubbles(panel.bubbles || []);
    setIsAnnotating(false);
  };

  const handleInjectText = async () => {
    if (!panel.id) return;

    setIsLoading(true);
    try {
      // Inject text into panel
      const response = await apiRequest<{ success: boolean; processedImageUrl: string }>(
        `/api/comics/${comicId}/panels/${panel.id}/inject-text`,
        'POST',
        {}
      );

      if (response.success) {
        // Update panel with processed image URL
        console.log('Text injected successfully:', response.processedImageUrl);
        // You might want to update the panel state here
      }
    } catch (error) {
      console.error('Failed to inject text:', error);
      // Handle error
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreviewText = async () => {
    if (!panel.id) return;

    try {
      // Get preview of text injection
      const response = await apiRequest<{ success: boolean; previewImageUrl: string }>(
        `/api/comics/${comicId}/panels/${panel.id}/preview`,
        'GET'
      );

      if (response.success) {
        // Show preview image
        console.log('Preview image:', response.previewImageUrl);
        // You might want to show this in a modal
      }
    } catch (error) {
      console.error('Failed to get preview:', error);
    }
  };

  if (isAnnotating && panel.imageUrl) {
    return (
      <PanelAnnotation
        panelId={panel.id}
        imageUrl={panel.imageUrl}
        bubbles={bubbles}
        onBubblesChange={handleBubblesChange}
        onSave={handleSaveAnnotations}
        onCancel={handleCancelAnnotations}
        characters={characters}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <button
          onClick={handleAnnotateClick}
          disabled={!panel.imageUrl || isLoading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {isLoading ? 'Loading...' : 'Annotate Panel'}
        </button>
        
        {bubbles.length > 0 && (
          <>
            <button
              onClick={handlePreviewText}
              disabled={isLoading}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
            >
              Preview Text
            </button>
            
            <button
              onClick={handleInjectText}
              disabled={isLoading}
              className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50"
            >
              Inject Text
            </button>
          </>
        )}
      </div>

      {bubbles.length > 0 && (
        <div className="bg-gray-100 p-4 rounded">
          <h3 className="font-semibold mb-2">Bubbles ({bubbles.length})</h3>
          <div className="space-y-2">
            {bubbles.map((bubble, index) => (
              <div key={bubble.id} className="text-sm">
                <span className="font-medium">{bubble.type}:</span> {bubble.text}
                {bubble.characterName && (
                  <span className="text-gray-600"> - {bubble.characterName}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
