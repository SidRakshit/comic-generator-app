"use client";

import { useCallback, useState, useEffect } from "react";
import type { Comic } from "@repo/common-types";

/**
 * Hook for managing draft storage in localStorage
 * Provides functionality to save, load, and clear draft comics
 */
interface UseDraftStorageOptions {
  /** Storage key for the draft (defaults to 'comic-draft') */
  storageKey?: string;
  /** Whether to enable draft storage (defaults to true) */
  enabled?: boolean;
  /** Maximum age of draft in milliseconds (defaults to 7 days) */
  maxAge?: number;
}

interface UseDraftStorageReturn {
  /** Save a draft comic to localStorage */
  saveDraft: (comicData: Comic) => void;
  /** Load draft comic from localStorage */
  loadDraft: () => Comic | null;
  /** Clear draft from localStorage */
  clearDraft: () => void;
  /** Check if a draft exists */
  hasDraft: boolean;
  /** Get draft metadata (timestamp, size, etc.) */
  getDraftInfo: () => { timestamp: Date; size: number; isExpired: boolean } | null;
  /** Whether draft storage is available */
  isStorageAvailable: boolean;
}

const DEFAULT_STORAGE_KEY = "comic-draft";
const DEFAULT_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

export function useDraftStorage({
  storageKey = DEFAULT_STORAGE_KEY,
  enabled = true,
  maxAge = DEFAULT_MAX_AGE,
}: UseDraftStorageOptions = {}): UseDraftStorageReturn {
  const [isStorageAvailable, setIsStorageAvailable] = useState(false);

  // Check if localStorage is available
  useEffect(() => {
    if (typeof window === "undefined") {
      setIsStorageAvailable(false);
      return;
    }

    try {
      const testKey = "__localStorage_test__";
      localStorage.setItem(testKey, "test");
      localStorage.removeItem(testKey);
      setIsStorageAvailable(true);
    } catch (error) {
      console.warn("localStorage is not available:", error);
      setIsStorageAvailable(false);
    }
  }, []);

  const saveDraft = useCallback((comicData: Comic) => {
    if (!enabled || !isStorageAvailable || typeof window === "undefined") {
      return;
    }

    // Only save drafts (comics without an ID)
    if (comicData.id) {
      console.log("Skipping draft save - comic has ID, it's already saved");
      return;
    }

    try {
      // Strip base64 images to save space (they're too large for localStorage)
      // Keep imageUrl references but remove imageBase64 to prevent quota errors
      const comicDataWithoutBase64 = {
        ...comicData,
        panels: comicData.panels?.map(panel => ({
          ...panel,
          imageBase64: undefined, // Remove base64 data
          // Keep imageUrl so we know the panel has an image
        })) || [],
      };

      const draftData = {
        comic: comicDataWithoutBase64,
        timestamp: Date.now(),
        version: "1.0", // For future compatibility
      };

      const serialized = JSON.stringify(draftData);
      localStorage.setItem(storageKey, serialized);
      
      console.log("Draft saved to localStorage:", {
        title: comicDataWithoutBase64.title || "Untitled",
        size: serialized.length,
        panelCount: comicDataWithoutBase64.panels?.length || 0,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      if (error instanceof Error && error.name === 'QuotaExceededError') {
        console.warn("LocalStorage quota exceeded. Draft not saved. Consider clearing old data.");
        // Try to clear the old draft and retry once
        try {
          localStorage.removeItem(storageKey);
          console.log("Cleared old draft, but skipping save to avoid quota issues");
        } catch (clearError) {
          console.error("Failed to clear old draft:", clearError);
        }
      } else {
        console.error("Failed to save draft to localStorage:", error);
      }
    }
  }, [enabled, isStorageAvailable, storageKey]);

  const loadDraft = useCallback((): Comic | null => {
    if (!enabled || !isStorageAvailable || typeof window === "undefined") {
      return null;
    }

    try {
      const stored = localStorage.getItem(storageKey);
      if (!stored) return null;

      const draftData = JSON.parse(stored);
      
      // Check if draft is expired
      const isExpired = Date.now() - draftData.timestamp > maxAge;
      if (isExpired) {
        console.log("Draft expired, clearing from storage");
        localStorage.removeItem(storageKey);
        return null;
      }

      // Validate draft structure
      if (!draftData.comic || typeof draftData.comic !== "object") {
        console.warn("Invalid draft structure, clearing from storage");
        localStorage.removeItem(storageKey);
        return null;
      }

      console.log("Draft loaded from localStorage:", {
        title: draftData.comic.title || "Untitled",
        age: Date.now() - draftData.timestamp,
        version: draftData.version,
      });

      return draftData.comic as Comic;
    } catch (error) {
      console.error("Failed to load draft from localStorage:", error);
      // Clear corrupted draft
      try {
        localStorage.removeItem(storageKey);
      } catch (clearError) {
        console.error("Failed to clear corrupted draft:", clearError);
      }
      return null;
    }
  }, [enabled, isStorageAvailable, storageKey, maxAge]);

  const clearDraft = useCallback(() => {
    if (!isStorageAvailable || typeof window === "undefined") return;

    try {
      localStorage.removeItem(storageKey);
      console.log("Draft cleared from localStorage");
    } catch (error) {
      console.error("Failed to clear draft from localStorage:", error);
    }
  }, [isStorageAvailable, storageKey]);

  const hasDraft = useCallback((): boolean => {
    if (!isStorageAvailable || typeof window === "undefined") return false;

    try {
      const stored = localStorage.getItem(storageKey);
      if (!stored) return false;

      const draftData = JSON.parse(stored);
      const isExpired = Date.now() - draftData.timestamp > maxAge;
      
      if (isExpired) {
        localStorage.removeItem(storageKey);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Failed to check draft existence:", error);
      return false;
    }
  }, [isStorageAvailable, storageKey, maxAge]);

  const getDraftInfo = useCallback(() => {
    if (!isStorageAvailable || typeof window === "undefined") return null;

    try {
      const stored = localStorage.getItem(storageKey);
      if (!stored) return null;

      const draftData = JSON.parse(stored);
      const timestamp = new Date(draftData.timestamp);
      const isExpired = Date.now() - draftData.timestamp > maxAge;

      return {
        timestamp,
        size: stored.length,
        isExpired,
      };
    } catch (error) {
      console.error("Failed to get draft info:", error);
      return null;
    }
  }, [isStorageAvailable, storageKey, maxAge]);

  return {
    saveDraft,
    loadDraft,
    clearDraft,
    hasDraft: hasDraft(),
    getDraftInfo,
    isStorageAvailable,
  };
}

/**
 * Simplified version for basic usage
 * 
 * @param storageKey - Storage key for the draft (optional)
 */
export function useDraftStorageSimple(storageKey?: string) {
  return useDraftStorage({ storageKey });
}
