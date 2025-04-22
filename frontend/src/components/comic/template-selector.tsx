'use client';

import { useState } from 'react';
import Image from 'next/image'; // Import Image
import { Button } from '@/components/ui/button';

interface TemplateSelectorProps {
  onSelect: (templateId: string) => void;
}

interface Template {
  id: string;
  name: string;
  description: string;
  panelCount: number;
  layout: string;
  preview: string; 
}

export default function TemplateSelector({ onSelect }: TemplateSelectorProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  // ... (templates array remains the same) ...
   const templates: Template[] = [ { id: 'template-1', name: '2x2 Grid', description: 'Classic four-panel comic layout.', panelCount: 4, layout: 'grid-2x2', preview: '/placeholders/template-2x2.png' }, { id: 'template-2', name: '3x2 Grid', description: 'Six-panel layout for more detailed stories.', panelCount: 6, layout: 'grid-3x2', preview: '/placeholders/template-3x2.png' }, { id: 'template-3', name: 'Single Panel', description: 'One large panel for a single illustration.', panelCount: 1, layout: 'single', preview: '/placeholders/template-single.png' }, { id: 'template-4', name: '3x3 Grid', description: 'Nine-panel layout for complex narratives.', panelCount: 9, layout: 'grid-3x3', preview: '/placeholders/template-3x3.png' }, { id: 'template-5', name: 'Manga Style', description: 'Right-to-left reading style with varied panel sizes.', panelCount: 5, layout: 'manga', preview: '/placeholders/template-manga.png' } ];

  // ... (handleTemplateClick, handleConfirm, getPlaceholderImage remain the same) ...
   const handleTemplateClick = (templateId: string) => { setSelectedTemplate(templateId); };
   const handleConfirm = () => { if (selectedTemplate) { onSelect(selectedTemplate); } };
   const getPlaceholderImage = (templateId: string) => { return `/api/placeholder/400/320?text=${templateId}`; };


  return (
    <div className="template-selector">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {templates.map((template) => (
          <div 
            key={template.id}
            className={`
              border-2 rounded-lg p-4 cursor-pointer transition-all
              ${selectedTemplate === template.id 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-200 hover:border-blue-200'}
            `}
            onClick={() => handleTemplateClick(template.id)}
          >
            {/* Added relative for Image fill */}
            <div className="aspect-video bg-gray-100 mb-3 rounded overflow-hidden relative"> 
              {/* Replaced img with Image */}
              <Image 
                src={getPlaceholderImage(template.id)} // Using placeholder function
                alt={template.name}
                fill // Use fill layout
                style={{ objectFit: 'cover' }}
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw" // Adjust sizes as needed
              />
            </div>
             {/* ... (Rest of card info remains the same) ... */}
            <h3 className="text-lg font-medium mb-1">{template.name}</h3>
            <p className="text-sm text-gray-600 mb-2">{template.description}</p>
            <div className="flex justify-between text-sm text-gray-500">
              <span>{template.panelCount} panels</span>
              <span>{template.layout}</span>
            </div>
          </div>
        ))}
      </div>

       {/* ... (Confirm button remains the same) ... */}
      <div className="flex justify-end"> <Button onClick={handleConfirm} disabled={!selectedTemplate} > Continue with Selected Template </Button> </div>
    </div>
  );
}