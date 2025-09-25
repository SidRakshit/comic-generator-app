// src/context/comic-context.tsx
"use client";

import React, { createContext, useContext, ReactNode } from "react";
import { useComic } from "@/hooks/use-comic";
import type { Comic, Panel, ComicCharacter, ComicContextType } from "@repo/common-types";

// Create the context with a default value (usually null or a minimal state)
// We'll throw an error if used outside a provider, so default value isn't critical
const ComicContext = createContext<ComicContextType | null>(null);

// Create the Provider component
interface ComicProviderProps {
	children: ReactNode;
	initialComicId?: string;
	initialTemplateId?: string;
}

export function ComicProvider({
	children,
	initialComicId,
	initialTemplateId,
}: ComicProviderProps) {
	const comicHookData = useComic(initialComicId, initialTemplateId);
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
		throw new Error("useComicContext must be used within a ComicProvider");
	}
	return context;
}
