// src/components/comic/template-selector.tsx (Example Structure)

import React from 'react';
// Assuming you have template definitions somewhere
import { templates } from '@/hooks/use-comic'; // Example import path

// --- Step 1: Add 'disabled' to the props interface/type ---
interface TemplateSelectorProps {
  onSelect: (templateId: string) => void;
  disabled?: boolean; // Add this line (make it optional with '?')
}

const TemplateSelector: React.FC<TemplateSelectorProps> = ({ onSelect, disabled }) => {
  const templateList = Object.values(templates); // Get templates to display

  return (
    <div className={`grid grid-cols-2 md:grid-cols-3 gap-4 ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
      {templateList.map((template) => (
        <div
          key={template.id}
          className={`border rounded-lg p-4 cursor-pointer hover:shadow-md hover:border-blue-500 transition-all ${
            disabled ? 'cursor-not-allowed bg-gray-100' : 'bg-white' // Add disabled styling
          }`}
          onClick={() => {
            // --- Step 2: Prevent onClick if disabled ---
            if (!disabled) {
              onSelect(template.id);
            }
          }}
          // You might also disable buttons directly if templates are buttons
          // Example: <button disabled={disabled} ... >
        >
          {/* Template Preview Image */}
          <div className="aspect-square bg-gray-200 mb-2 flex items-center justify-center">
            {/* Placeholder or actual preview */}
            <span className="text-gray-400 text-sm">Preview</span>
          </div>
          {/* Template Info */}
          <h3 className="font-semibold">{template.name}</h3>
          <p className="text-sm text-gray-500">{template.panelCount} panels</p>
        </div>
      ))}
    </div>
  );
};

export default TemplateSelector;