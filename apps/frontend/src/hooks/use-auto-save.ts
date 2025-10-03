"use client";

import { useState, useEffect, useCallback } from "react";

/**
 * Hook for automatic saving functionality
 * Provides auto-save capabilities with configurable intervals and change detection
 */
interface UseAutoSaveOptions {
  /** Whether auto-save is enabled */
  enabled: boolean;
  /** Auto-save interval in milliseconds */
  interval: number;
  /** Function to call when auto-saving */
  onSave: () => Promise<void>;
  /** Whether there are unsaved changes */
  hasChanges: boolean;
  /** Optional callback when auto-save starts */
  onAutoSaveStart?: () => void;
  /** Optional callback when auto-save completes */
  onAutoSaveComplete?: () => void;
  /** Optional callback when auto-save fails */
  onAutoSaveError?: (error: Error) => void;
}

interface UseAutoSaveReturn {
  /** Whether auto-save is currently in progress */
  isAutoSaving: boolean;
  /** Timestamp of the last successful auto-save */
  lastAutoSave: Date | null;
  /** Number of consecutive auto-save failures */
  failureCount: number;
  /** Manually trigger an auto-save */
  triggerAutoSave: () => Promise<void>;
}

export function useAutoSave({
  enabled,
  interval,
  onSave,
  hasChanges,
  onAutoSaveStart,
  onAutoSaveComplete,
  onAutoSaveError,
}: UseAutoSaveOptions): UseAutoSaveReturn {
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [lastAutoSave, setLastAutoSave] = useState<Date | null>(null);
  const [failureCount, setFailureCount] = useState(0);

  const triggerAutoSave = useCallback(async () => {
    if (isAutoSaving || !hasChanges) return;

    try {
      setIsAutoSaving(true);
      onAutoSaveStart?.();
      
      await onSave();
      
      setLastAutoSave(new Date());
      setFailureCount(0);
      onAutoSaveComplete?.();
      
      console.log("Auto-save completed successfully");
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error("Auto-save failed");
      console.error("Auto-save failed:", errorObj);
      
      setFailureCount(prev => prev + 1);
      onAutoSaveError?.(errorObj);
    } finally {
      setIsAutoSaving(false);
    }
  }, [isAutoSaving, hasChanges, onSave, onAutoSaveStart, onAutoSaveComplete, onAutoSaveError]);

  // Set up auto-save interval
  useEffect(() => {
    if (!enabled || !hasChanges || isAutoSaving) return;

    const timer = setInterval(() => {
      triggerAutoSave();
    }, interval);

    return () => clearInterval(timer);
  }, [enabled, interval, hasChanges, isAutoSaving, triggerAutoSave]);

  // Reset failure count when changes are made
  useEffect(() => {
    if (hasChanges) {
      setFailureCount(0);
    }
  }, [hasChanges]);

  return {
    isAutoSaving,
    lastAutoSave,
    failureCount,
    triggerAutoSave,
  };
}
