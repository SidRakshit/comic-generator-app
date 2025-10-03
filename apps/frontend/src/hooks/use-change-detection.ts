"use client";

import { useState, useEffect, useCallback, useRef } from "react";

/**
 * Hook for detecting changes between original and current data
 * Uses deep comparison to determine if data has been modified
 */
interface UseChangeDetectionOptions<T> {
  /** Original data to compare against */
  originalData: T;
  /** Current data to check for changes */
  currentData: T;
  /** Custom comparison function (optional) */
  isEqual?: (original: T, current: T) => boolean;
  /** Whether change detection is enabled */
  enabled?: boolean;
  /** Debounce delay in milliseconds (optional) */
  debounceMs?: number;
}

interface UseChangeDetectionReturn<T> {
  /** Whether there are changes between original and current data */
  hasChanges: boolean;
  /** Reset the original data to current data (mark as saved) */
  markAsSaved: () => void;
  /** Get the difference between original and current data */
  getChanges: () => Partial<T>;
}

/**
 * Hook that detects changes between original and current data
 * 
 * @param originalData - The baseline data to compare against
 * @param currentData - The current data to check for changes
 * @param isEqual - Custom equality function (optional)
 * @param enabled - Whether change detection is enabled (defaults to true)
 * @param debounceMs - Debounce delay in milliseconds (optional)
 */
export function useChangeDetection<T>({
  originalData,
  currentData,
  isEqual,
  enabled = true,
  debounceMs,
}: UseChangeDetectionOptions<T>): UseChangeDetectionReturn<T> {
  const [hasChanges, setHasChanges] = useState(false);
  const [originalDataRef, setOriginalDataRef] = useState(originalData);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Default deep equality function
  const defaultIsEqual = useCallback((original: T, current: T): boolean => {
    try {
      return JSON.stringify(original) === JSON.stringify(current);
    } catch (error) {
      console.warn("Failed to compare objects, falling back to reference equality:", error);
      return original === current;
    }
  }, []);

  const equalityCheck = isEqual || defaultIsEqual;

  // Check for changes
  const checkChanges = useCallback(() => {
    if (!enabled) {
      setHasChanges(false);
      return;
    }

    const hasChangesResult = !equalityCheck(originalDataRef, currentData);
    setHasChanges(hasChangesResult);
  }, [enabled, originalDataRef, currentData, equalityCheck]);

  // Debounced change detection
  useEffect(() => {
    if (debounceMs && debounceMs > 0) {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
      
      debounceTimeoutRef.current = setTimeout(() => {
        checkChanges();
      }, debounceMs);
    } else {
      checkChanges();
    }

    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [checkChanges, debounceMs]);

  // Mark as saved (reset original data to current data)
  const markAsSaved = useCallback(() => {
    setOriginalDataRef(currentData);
    setHasChanges(false);
  }, [currentData]);

  // Get changes between original and current data
  const getChanges = useCallback((): Partial<T> => {
    if (!hasChanges) return {};

    try {
      // Simple implementation - in a real app you might want more sophisticated diffing
      const originalJson = JSON.stringify(originalDataRef);
      const currentJson = JSON.stringify(currentData);
      
      if (originalJson === currentJson) return {};

      // Return the current data as changes (simplified approach)
      return currentData;
    } catch (error) {
      console.warn("Failed to get changes:", error);
      return {};
    }
  }, [hasChanges, originalDataRef, currentData]);

  // Update original data when it changes externally
  useEffect(() => {
    setOriginalDataRef(originalData);
  }, [originalData]);

  return {
    hasChanges,
    markAsSaved,
    getChanges,
  };
}

/**
 * Simplified version for basic usage
 * 
 * @param originalData - The baseline data to compare against
 * @param currentData - The current data to check for changes
 */
export function useChangeDetectionSimple<T>(
  originalData: T,
  currentData: T
): boolean {
  const { hasChanges } = useChangeDetection({ originalData, currentData });
  return hasChanges;
}
