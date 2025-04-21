'use client';

import { useState, useEffect } from 'react';
import { Panel } from '@/hooks/useComic';
import { Loader2, ImageOff, Plus } from 'lucide-react';

interface ComicCanvasProps {
  panels: Panel[];
  onPanelClick: (panelId: number) => void;
}

export default function ComicCanvas({ panels, onPanelClick }: ComicCanvasProps) {
  const [layout, setLayout] = useState<string>('grid');

  useEffect(() => {
    // Determine the best layout based on panel count
    const panelCount = panels.length;
    if (panelCount <= 4) {
      setLayout('grid');
    } else if (panelCount <= 6) {
      setLayout('comic');
    } else {
      setLayout('vertical');
    }
  }, [panels.length]);

  const getGridClass = () => {
    const count = panels.length;
    
    switch(count) {
      case 1: return 'grid-cols-1';
      case 2: return 'grid-cols-2';
      case 3: return 'grid-cols-3';
      case 4: return 'grid-cols-2 grid-rows-2';
      case 6: return 'grid-cols-3 grid-rows-2';
      case 9: return 'grid-cols-3 grid-rows-3';
      default: return 'grid-cols-2 grid-rows-2';
    }
  };

  return (
    <div className="comic-canvas w-full">
      <div className={`grid ${getGridClass()} gap-4 mb-4`}>
        {panels.map((panel, index) => (
          <ComicPanel 
            key={index}
            panel={panel}
            panelNumber={index + 1}
            onClick={() => onPanelClick(index)}
          />
        ))}
      </div>
    </div>
  );
}

interface ComicPanelProps {
  panel: Panel;
  panelNumber: number;
  onClick: () => void;
}

function ComicPanel({ panel, panelNumber, onClick }: ComicPanelProps) {
  return (
    <div 
      className={`
        aspect-square border-2 rounded-md overflow-hidden cursor-pointer
        ${panel.status === 'loading' ? 'border-blue-400 bg-blue-50' : 
          panel.status === 'error' ? 'border-red-400 bg-red-50' : 
          panel.status === 'complete' ? 'border-green-400' : 
          'border-gray-200 bg-gray-50 hover:border-blue-200'}
      `}
      onClick={onClick}
    >
      {/* Panel content based on status */}
      {panel.status === 'loading' ? (
        <div className="flex flex-col items-center justify-center h-full">
          <Loader2 className="h-10 w-10 text-blue-500 animate-spin mb-2" />
          <p className="text-sm text-blue-500">Generating...</p>
        </div>
      ) : panel.status === 'error' ? (
        <div className="flex flex-col items-center justify-center h-full">
          <ImageOff className="h-10 w-10 text-red-500 mb-2" />
          <p className="text-sm text-red-500">Error generating image</p>
          <p className="text-xs text-red-400 mt-1">Click to try again</p>
        </div>
      ) : panel.status === 'complete' && panel.imageUrl ? (
        <div className="relative h-full">
          <img 
            src={panel.imageUrl} 
            alt={`Panel ${panelNumber}`} 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 transition-all flex items-center justify-center">
            <div className="text-white opacity-0 hover:opacity-100 p-2 bg-black bg-opacity-50 rounded">
              Click to edit
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-full">
          <div className="mb-2">
            <Plus className="h-8 w-8 text-gray-400" />
          </div>
          <p className="text-gray-500 text-sm">Panel {panelNumber}</p>
          <p className="text-gray-400 text-xs mt-1">Click to add content</p>
        </div>
      )}
    </div>
  );
}