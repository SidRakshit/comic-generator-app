// src/components/comic/comic-canvas.tsx
// UPDATED: Added edit icon for completed panels and separate click handlers.

'use client';

import Image from 'next/image';
import { Panel } from '@/hooks/use-comic'; //
// Import Edit icon, Plus is already imported
import { Loader2, ImageOff, Plus, Edit } from 'lucide-react';

// --- 1. Add onEditPanelClick to props ---
interface ComicCanvasProps {
  panels: Panel[];
  onPanelClick: (index: number) => void; // Handles zoom for completed, add for others
  onEditPanelClick: (index: number) => void; // Handles edit click for completed
  layout: string | null;
}

// getGridClass function remains the same as your provided code
const getGridClass = (layout: string | null, panels: Panel[]): string => {
  switch (layout) {
    case 'grid-2x2':
      return 'grid-cols-2 grid-rows-2';
    case 'grid-3x2':
      return 'grid-cols-3 grid-rows-2';
    case 'single':
      return 'grid-cols-1';
    case 'grid-3x3':
      return 'grid-cols-3 grid-rows-3';
    case 'manga':
      return 'grid-cols-2 manga-layout'; // Placeholder
    default:
      const count = panels.length;
      if (count <= 1) return 'grid-cols-1';
      if (count <= 4) return 'grid-cols-2 grid-rows-2';
      if (count <= 6) return 'grid-cols-3 grid-rows-2';
      if (count <= 9) return 'grid-cols-3 grid-rows-3';
      return 'grid-cols-2 grid-rows-2';
  }
};

export default function ComicCanvas({ panels, onPanelClick, onEditPanelClick, layout }: ComicCanvasProps) { // Destructure new prop

  const gridClass = getGridClass(layout, panels);

  return (
    <div className="comic-canvas w-full">
      <div className={`grid ${gridClass} gap-4 mb-4`}>
        {panels.map((panel, index) => (
          <ComicPanel
            key={panel.id || index}
            panel={panel}
            panelNumber={index + 1}
            // --- 2. Pass BOTH handlers down to ComicPanel ---
            onClick={() => onPanelClick(index)} // This will be the main click (zoom/add)
            onEditClick={() => onEditPanelClick(index)} // This is for the edit icon
          />
        ))}
      </div>
    </div>
  );
}

// --- 3. Add onEditClick to ComicPanelProps ---
interface ComicPanelProps {
  panel: Panel;
  panelNumber: number;
  onClick: () => void;      // Main click handler (zoom/add)
  onEditClick: () => void; // Edit icon click handler
}

// --- 4. Modify ComicPanel component ---
function ComicPanel({ panel, panelNumber, onClick, onEditClick }: ComicPanelProps) { // Destructure new prop

  return (
    <div
      className={`
        group aspect-square border-2 rounded-md overflow-hidden cursor-pointer relative
        ${panel.status === 'loading' ? 'border-blue-400 bg-blue-50' :
          panel.status === 'error' ? 'border-red-400 bg-red-50' :
          panel.status === 'complete' ? 'border-green-400' :
          'border-gray-200 bg-gray-50 hover:border-blue-200'}
      `}
      // The main onClick handler remains on the panel div
      onClick={onClick}
    >
      {/* Panel content based on status */}
      {panel.status === 'loading' ? (
        <div className="flex flex-col items-center justify-center h-full pointer-events-none"> {/* Prevent clicks during load */}
           <Loader2 className="h-10 w-10 text-blue-500 animate-spin mb-2" />
           <p className="text-sm text-blue-500">Generating...</p>
        </div>
      ) : panel.status === 'error' ? (
        // Error state also uses the main onClick (to try again)
        <div className="flex flex-col items-center justify-center h-full text-center p-2">
           <ImageOff className="h-10 w-10 text-red-500 mb-2" />
           <p className="text-sm text-red-500">{panel.error || 'Error generating image'}</p>
           <p className="text-xs text-red-400 mt-1">Click to try again</p>
        </div>
      ) : panel.status === 'complete' && panel.imageUrl ? (
        // --- Completed Panel: Image + Edit Button ---
        <>
          {/* Image remains the same */}
          <div className="relative h-full w-full"> {/* Ensure wrapper takes full space */}
            <Image
              src={panel.imageUrl}
              alt={`Panel ${panelNumber}`}
              fill
              style={{ objectFit: 'cover' }}
              sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
              priority={panelNumber <= 4}
              className="pointer-events-none" // Make image non-interactive for clicks if needed, parent div handles click
            />
          </div>
          {/* --- Edit Button --- */}
          <button
            type="button" // Good practice for buttons not submitting forms
            className="absolute top-2 right-2 z-10 p-1.5 bg-black bg-opacity-50 text-white rounded-full opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity hover:bg-opacity-75"
            onClick={(e) => {
              e.stopPropagation(); // IMPORTANT: Prevent triggering the parent div's onClick (which opens zoom)
              onEditClick(); // Call the specific edit handler
            }}
            aria-label={`Edit Panel ${panelNumber}`}
            title={`Edit Panel ${panelNumber}`}
          >
            <Edit className="h-4 w-4" /> {/* Use Edit Icon */}
          </button>
        </>
      ) : (
         // Empty state uses the main onClick (to add content)
        <div className="flex flex-col items-center justify-center h-full">
           <div className="mb-2"> <Plus className="h-8 w-8 text-gray-400" /> </div>
           <p className="text-gray-500 text-sm">Panel {panelNumber}</p>
           <p className="text-gray-400 text-xs mt-1">Click to add content</p>
        </div>
      )}
    </div>
  );
}