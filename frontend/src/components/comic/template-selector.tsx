// src/components/comic/template-selector.tsx

import React from 'react';
import { templates } from '@/hooks/use-comic';

interface TemplateSelectorProps {
  onSelect: (templateId: string) => void;
  disabled?: boolean;
}

const TemplateSelector: React.FC<TemplateSelectorProps> = ({ onSelect, disabled }) => {
  const templateList = Object.values(templates);

  return (
    <div className={`grid grid-cols-2 md:grid-cols-3 gap-4 ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
      {templateList.map((template) => (
        <div
          key={template.id}
          className={`border rounded-lg p-4 cursor-pointer hover:shadow-md hover:border-blue-500 transition-all ${
            disabled ? 'cursor-not-allowed bg-gray-100' : 'bg-white'
          }`}
          onClick={() => {            
            if (!disabled) {
              onSelect(template.id);
            }
          }}
        >
          <div className="aspect-square bg-gray-200 mb-2 flex items-center justify-center">         
            <span className="text-gray-400 text-sm">Preview</span>
          </div>
          <h3 className="font-semibold">{template.name}</h3>
          <p className="text-sm text-gray-500">{template.panelCount} panels</p>
        </div>
      ))}
    </div>
  );
};

export default TemplateSelector;