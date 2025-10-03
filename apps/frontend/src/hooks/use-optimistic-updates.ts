"use client";

import { useState, useCallback, useRef, useEffect } from "react";

/**
 * Configuration for optimistic updates
 */
interface OptimisticUpdateConfig<T> {
  /** The current state value */
  currentValue: T;
  /** Function to apply the optimistic update */
  applyUpdate: (currentValue: T, optimisticValue: T) => T;
  /** Function to revert the optimistic update */
  revertUpdate: (currentValue: T, optimisticValue: T) => T;
  /** Function to execute the actual operation */
  executeOperation: (value: T) => Promise<T>;
  /** Whether optimistic updates are enabled */
  enabled?: boolean;
  /** Timeout for automatic revert if operation fails */
  revertTimeout?: number;
  /** Callback when optimistic update is applied */
  onOptimisticUpdate?: (value: T) => void;
  /** Callback when operation succeeds */
  onSuccess?: (value: T) => void;
  /** Callback when operation fails */
  onError?: (error: Error, revertedValue: T) => void;
}

/**
 * State for tracking optimistic updates
 */
interface OptimisticState<T> {
  /** The current optimistic value */
  optimisticValue: T | null;
  /** Whether an operation is in progress */
  isPending: boolean;
  /** The last error that occurred */
  lastError: Error | null;
  /** Whether the last operation was successful */
  lastSuccess: boolean;
  /** Timestamp of the last operation */
  lastOperationTime: number | null;
}

/**
 * Hook for managing optimistic updates
 * Provides immediate UI feedback while operations are in progress
 */
interface UseOptimisticUpdatesReturn<T> {
  /** The current value (optimistic or actual) */
  value: T;
  /** Whether an operation is in progress */
  isPending: boolean;
  /** The last error that occurred */
  lastError: Error | null;
  /** Whether the last operation was successful */
  lastSuccess: boolean;
  /** Apply an optimistic update */
  applyOptimisticUpdate: (updateValue: T) => Promise<T>;
  /** Revert to the actual value */
  revertToActual: () => void;
  /** Clear any pending state */
  clearPending: () => void;
}

export function useOptimisticUpdates<T>({
  currentValue,
  applyUpdate,
  revertUpdate,
  executeOperation,
  enabled = true,
  revertTimeout = 10000, // 10 seconds default
  onOptimisticUpdate,
  onSuccess,
  onError,
}: OptimisticUpdateConfig<T>): UseOptimisticUpdatesReturn<T> {
  const [state, setState] = useState<OptimisticState<T>>({
    optimisticValue: null,
    isPending: false,
    lastError: null,
    lastSuccess: false,
    lastOperationTime: null,
  });

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const operationIdRef = useRef<number>(0);

  // Clear timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const applyOptimisticUpdate = useCallback(async (updateValue: T): Promise<T> => {
    if (!enabled) {
      // If optimistic updates are disabled, just execute the operation
      try {
        setState(prev => ({ ...prev, isPending: true, lastError: null }));
        const result = await executeOperation(updateValue);
        setState(prev => ({ 
          ...prev, 
          isPending: false, 
          lastSuccess: true, 
          lastOperationTime: Date.now() 
        }));
        onSuccess?.(result);
        return result;
      } catch (error) {
        setState(prev => ({ 
          ...prev, 
          isPending: false, 
          lastError: error as Error, 
          lastSuccess: false 
        }));
        onError?.(error as Error, currentValue);
        throw error;
      }
    }

    // Generate unique operation ID
    const operationId = ++operationIdRef.current;

    // Apply optimistic update immediately
    const optimisticValue = applyUpdate(currentValue, updateValue);
    setState(prev => ({
      ...prev,
      optimisticValue,
      isPending: true,
      lastError: null,
      lastSuccess: false,
    }));

    onOptimisticUpdate?.(optimisticValue);

    // Set up timeout for automatic revert
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setState(prev => {
        if (prev.isPending && operationId === operationIdRef.current) {
          return {
            ...prev,
            optimisticValue: null,
            isPending: false,
            lastError: new Error("Operation timed out"),
            lastSuccess: false,
          };
        }
        return prev;
      });
    }, revertTimeout);

    try {
      // Execute the actual operation
      const result = await executeOperation(updateValue);
      
      // Check if this is still the current operation
      if (operationId === operationIdRef.current) {
        setState(prev => ({
          ...prev,
          optimisticValue: null,
          isPending: false,
          lastSuccess: true,
          lastOperationTime: Date.now(),
        }));

        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }

        onSuccess?.(result);
        return result;
      }
      
      return result;
    } catch (error) {
      // Check if this is still the current operation
      if (operationId === operationIdRef.current) {
        const revertedValue = revertUpdate(currentValue, optimisticValue);
        setState(prev => ({
          ...prev,
          optimisticValue: null,
          isPending: false,
          lastError: error as Error,
          lastSuccess: false,
        }));

        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }

        onError?.(error as Error, revertedValue);
        throw error;
      }
      
      throw error;
    }
  }, [
    enabled,
    currentValue,
    applyUpdate,
    revertUpdate,
    executeOperation,
    revertTimeout,
    onOptimisticUpdate,
    onSuccess,
    onError,
  ]);

  const revertToActual = useCallback(() => {
    setState(prev => ({
      ...prev,
      optimisticValue: null,
      isPending: false,
    }));

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const clearPending = useCallback(() => {
    setState(prev => ({
      ...prev,
      isPending: false,
      lastError: null,
    }));

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  // Return the optimistic value if available, otherwise the actual value
  const value = state.optimisticValue ?? currentValue;

  return {
    value,
    isPending: state.isPending,
    lastError: state.lastError,
    lastSuccess: state.lastSuccess,
    applyOptimisticUpdate,
    revertToActual,
    clearPending,
  };
}

/**
 * Simplified version for basic usage
 */
export function useOptimisticUpdatesSimple<T>(
  currentValue: T,
  executeOperation: (value: T) => Promise<T>
) {
  return useOptimisticUpdates({
    currentValue,
    applyUpdate: (_, newValue) => newValue,
    revertUpdate: (original) => original,
    executeOperation,
  });
}
