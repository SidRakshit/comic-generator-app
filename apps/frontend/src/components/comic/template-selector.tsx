// src/components/comic/template-selector.tsx

import React from 'react';
import { templates } from '@/hooks/use-comic';
import { SEMANTIC_COLORS, UI_CONSTANTS, INTERACTIVE_STYLES } from '@repo/common-types';

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
          className={`border ${UI_CONSTANTS.BORDER_RADIUS.LARGE} p-4 cursor-pointer hover:shadow-md ${INTERACTIVE_STYLES.BORDER.HOVER_ACCENT_LIGHT} transition-all ${
            disabled ? `cursor-not-allowed ${SEMANTIC_COLORS.BACKGROUND.SECONDARY}` : `${SEMANTIC_COLORS.BACKGROUND.PRIMARY}`
          }`}
          onClick={() => {            
            if (!disabled) {
              onSelect(template.id);
            }
          }}
        >
          <div className={`${UI_CONSTANTS.ASPECT_RATIOS.SQUARE} ${SEMANTIC_COLORS.BACKGROUND.TERTIARY} mb-2 flex items-center justify-center`}>         
            <span className={`${SEMANTIC_COLORS.TEXT.MUTED} text-sm`}>Preview</span>
          </div>
              <h3 className={`font-semibold ${SEMANTIC_COLORS.TEXT.PRIMARY}`}>{template.name}</h3>
          <p className={`text-sm ${SEMANTIC_COLORS.TEXT.TERTIARY}`}>{template.panelCount} panels</p>
        </div>
      ))}
    </div>
  );
};

export default TemplateSelector;