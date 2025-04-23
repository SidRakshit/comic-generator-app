// src/context/comic-context.tsx
'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useComic } from '@/hooks/use-comic'; // Import your existing hook
import type { Comic, Panel, ComicCharacter } from '@/hooks/use-comic'; // Import types

// Define the shape of the context value (what consumers will get)
// This mirrors the return value of your useComic hook
interface ComicContextType {
  comic: Comic;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  setTemplate: (templateId: string | null) => void;
  updatePanelContent: (panelIndex: number, updates: Partial<Panel>) => void;
  updateComicMetadata: (updates: Partial<Omit<Comic, 'panels' | 'characters'>>) => void;
  addCharacter: () => void;
  removeCharacter: (idToRemove: string) => void;
  updateCharacter: (idToUpdate: string, field: keyof Omit<ComicCharacter, 'id'>, value: string) => void;
  saveComic: () => Promise<Comic | undefined>; // Keep saveComic signature
  // Add any other functions/state from useComic you need globally
}

// Create the context with a default value (usually null or a minimal state)
// We'll throw an error if used outside a provider, so default value isn't critical
const ComicContext = createContext<ComicContextType | null>(null);

// Create the Provider component
interface ComicProviderProps {
  children: ReactNode;
  // --- Add props to handle initialization based on route ---
  initialComicId?: string;
  initialTemplateId?: string;
}

export function ComicProvider({ children, initialComicId, initialTemplateId }: ComicProviderProps) {
  // Use your existing hook INSIDE the provider
  // Pass the initialization props down to the hook
  const comicHookData = useComic(initialComicId, initialTemplateId);

  // The value provided by the context is the data returned from the hook
  return (
    <ComicContext.Provider value={comicHookData}>
      {children}
    </ComicContext.Provider>
  );
}

// Create a custom hook for easy consumption of the context
export function useComicContext() {
  const context = useContext(ComicContext);
  if (context === null) {
    throw new Error('useComicContext must be used within a ComicProvider');
  }
  return context;
}