// src/components/comic/comic-canvas.tsx (or wherever this component lives)

'use client';

import Image from 'next/image';
import { Panel } from '@/hooks/use-comic';
import { Loader2, ImageOff, Plus } from 'lucide-react';

interface ComicCanvasProps {
  panels: Panel[];
  onPanelClick: (panelId: number) => void;
  layout: string | null;
}

// --- Step 1: Modify getGridClass signature to accept panels ---
const getGridClass = (layout: string | null, panels: Panel[]): string => { // Added 'panels' parameter
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
      // --- Use the passed 'panels' parameter for fallback ---
      const count = panels.length;
      if (count <= 1) return 'grid-cols-1';
      if (count <= 4) return 'grid-cols-2 grid-rows-2';
      if (count <= 6) return 'grid-cols-3 grid-rows-2';
      if (count <= 9) return 'grid-cols-3 grid-rows-3';
      return 'grid-cols-2 grid-rows-2'; // Final fallback
  }
};

export default function ComicCanvas({ panels, onPanelClick, layout }: ComicCanvasProps) {

  // --- Step 2: Pass 'panels' when calling getGridClass ---
  const gridClass = getGridClass(layout, panels); // Pass 'panels' here

  return (
    <div className="comic-canvas w-full">
      <div className={`grid ${gridClass} gap-4 mb-4`}>
        {panels.map((panel, index) => (
          <ComicPanel
            key={panel.id || index}
            panel={panel}
            panelNumber={index + 1}
            onClick={() => onPanelClick(index)}
          />
        ))}
      </div>
    </div>
  );
}

// --- ComicPanel component remains unchanged ---
interface ComicPanelProps {
  panel: Panel;
  panelNumber: number;
  onClick: () => void;
}

function ComicPanel({ panel, panelNumber, onClick }: ComicPanelProps) {
  // ... (ComicPanel implementation is the same) ...
  return (
    <div
      className={`
        aspect-square border-2 rounded-md overflow-hidden cursor-pointer relative
        ${panel.status === 'loading' ? 'border-blue-400 bg-blue-50' :
          panel.status === 'error' ? 'border-red-400 bg-red-50' :
          panel.status === 'complete' ? 'border-green-400' :
          'border-gray-200 bg-gray-50 hover:border-blue-200'}
      `}
      onClick={onClick}
    >
      {/* Panel content based on status */}
      {panel.status === 'loading' ? (
        <div className="flex flex-col items-center justify-center h-full"> <Loader2 className="h-10 w-10 text-blue-500 animate-spin mb-2" /> <p className="text-sm text-blue-500">Generating...</p> </div>
      ) : panel.status === 'error' ? (
        <div className="flex flex-col items-center justify-center h-full"> <ImageOff className="h-10 w-10 text-red-500 mb-2" /> <p className="text-sm text-red-500">{panel.error || 'Error generating image'}</p> <p className="text-xs text-red-400 mt-1">Click to try again</p> </div>
      ) : panel.status === 'complete' && panel.imageUrl ? (
        <div className="relative h-full">
          <Image
            src={panel.imageUrl}
            alt={`Panel ${panelNumber}`}
            fill
            style={{ objectFit: 'cover' }}
            sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            priority={panelNumber <= 4}
          />
          <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 transition-all flex items-center justify-center group">
            <div className="text-white opacity-0 group-hover:opacity-100 p-2 bg-black bg-opacity-50 rounded">
              Click to edit
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-full"> <div className="mb-2"> <Plus className="h-8 w-8 text-gray-400" /> </div> <p className="text-gray-500 text-sm">Panel {panelNumber}</p> <p className="text-gray-400 text-xs mt-1">Click to add content</p> </div>
      )}
    </div>
  );
}