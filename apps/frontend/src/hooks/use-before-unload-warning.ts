"use client";

import { useEffect } from "react";

/**
 * Hook for showing browser warning when user tries to leave with unsaved changes
 * Prevents accidental data loss by showing a confirmation dialog
 */
interface UseBeforeUnloadWarningOptions {
  /** Whether there are unsaved changes */
  hasUnsavedChanges: boolean;
  /** Custom warning message */
  message?: string;
  /** Whether the warning is enabled */
  enabled?: boolean;
}

/**
 * Hook that shows a browser warning when user tries to leave with unsaved changes
 * 
 * @param hasUnsavedChanges - Whether there are unsaved changes that would be lost
 * @param message - Custom warning message (optional)
 * @param enabled - Whether the warning is enabled (defaults to true)
 */
export function useBeforeUnloadWarning({
  hasUnsavedChanges,
  message = "You have unsaved changes. Are you sure you want to leave?",
  enabled = true,
}: UseBeforeUnloadWarningOptions): void {
  useEffect(() => {
    if (!enabled || typeof window === "undefined") return;

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        // Modern browsers ignore the custom message and show their own
        // But we still set it for older browsers
        event.preventDefault();
        event.returnValue = message;
        return message;
      }
    };

    // Add the event listener
    window.addEventListener("beforeunload", handleBeforeUnload);

    // Cleanup function
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [hasUnsavedChanges, message, enabled]);
}

/**
 * Simplified version for basic usage
 * 
 * @param hasUnsavedChanges - Whether there are unsaved changes
 * @param message - Custom warning message (optional)
 */
export function useBeforeUnloadWarningSimple(
  hasUnsavedChanges: boolean,
  message?: string
): void {
  useBeforeUnloadWarning({ hasUnsavedChanges, message });
}
