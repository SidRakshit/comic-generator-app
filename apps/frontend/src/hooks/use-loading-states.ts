"use client";

import { useState, useCallback, useRef, useEffect } from "react";

/**
 * Loading state configuration
 */
interface LoadingStateConfig {
  /** Initial loading state */
  initialLoading?: boolean;
  /** Minimum loading time (ms) */
  minLoadingTime?: number;
  /** Whether to show skeleton while loading */
  showSkeleton?: boolean;
  /** Skeleton animation duration (ms) */
  skeletonDuration?: number;
  /** Whether to show progress indicator */
  showProgress?: boolean;
  /** Callback when loading starts */
  onLoadingStart?: () => void;
  /** Callback when loading ends */
  onLoadingEnd?: () => void;
  /** Callback when loading state changes */
  onLoadingChange?: (isLoading: boolean) => void;
}

/**
 * Loading state information
 */
interface LoadingState {
  /** Whether currently loading */
  isLoading: boolean;
  /** Loading progress (0-100) */
  progress: number;
  /** Loading message */
  message: string | null;
  /** Whether to show skeleton */
  showSkeleton: boolean;
  /** Loading start time */
  startTime: number | null;
  /** Estimated completion time */
  estimatedCompletion: number | null;
}

/**
 * Hook for managing loading states with enhanced UX
 * Provides skeleton loading, progress tracking, and smooth transitions
 */
interface UseLoadingStatesReturn {
  /** Current loading state */
  state: LoadingState;
  /** Start loading with optional message */
  startLoading: (message?: string) => void;
  /** Update loading progress */
  updateProgress: (progress: number) => void;
  /** Update loading message */
  updateMessage: (message: string) => void;
  /** Stop loading */
  stopLoading: () => void;
  /** Set loading with progress */
  setLoadingWithProgress: (progress: number, message?: string) => void;
  /** Reset loading state */
  resetLoading: () => void;
}

export function useLoadingStates({
  initialLoading = false,
  minLoadingTime = 500,
  showSkeleton = true,
  skeletonDuration = 2000,
  showProgress = false,
  onLoadingStart,
  onLoadingEnd,
  onLoadingChange,
}: LoadingStateConfig = {}): UseLoadingStatesReturn {
  const [state, setState] = useState<LoadingState>({
    isLoading: initialLoading,
    progress: 0,
    message: null,
    showSkeleton: showSkeleton && initialLoading,
    startTime: initialLoading ? Date.now() : null,
    estimatedCompletion: null,
  });

  const minTimeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const skeletonTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (minTimeTimeoutRef.current) {
        clearTimeout(minTimeTimeoutRef.current);
      }
      if (skeletonTimeoutRef.current) {
        clearTimeout(skeletonTimeoutRef.current);
      }
    };
  }, []);

  const startLoading = useCallback((message?: string) => {
    const startTime = Date.now();
    
    setState(prev => ({
      ...prev,
      isLoading: true,
      progress: 0,
      message: message || null,
      showSkeleton: showSkeleton,
      startTime,
      estimatedCompletion: null,
    }));

    onLoadingStart?.();
    onLoadingChange?.(true);

    // Set minimum loading time
    if (minTimeTimeoutRef.current) {
      clearTimeout(minTimeTimeoutRef.current);
    }
    
    minTimeTimeoutRef.current = setTimeout(() => {
      // Minimum time has passed, loading can be stopped
    }, minLoadingTime);

    // Set skeleton timeout
    if (showSkeleton && skeletonTimeoutRef.current) {
      clearTimeout(skeletonTimeoutRef.current);
    }
    
    if (showSkeleton) {
      skeletonTimeoutRef.current = setTimeout(() => {
        setState(prev => ({ ...prev, showSkeleton: false }));
      }, skeletonDuration);
    }
  }, [minLoadingTime, showSkeleton, skeletonDuration, onLoadingStart, onLoadingChange]);

  const updateProgress = useCallback((progress: number) => {
    const clampedProgress = Math.max(0, Math.min(100, progress));
    
    setState(prev => {
      const startTime = prev.startTime;
      const estimatedCompletion = startTime 
        ? startTime + (Date.now() - startTime) * (100 / clampedProgress)
        : null;

      return {
        ...prev,
        progress: clampedProgress,
        estimatedCompletion,
      };
    });
  }, []);

  const updateMessage = useCallback((message: string) => {
    setState(prev => ({ ...prev, message }));
  }, []);

  const stopLoading = useCallback(() => {
    // Check if minimum time has passed
    const now = Date.now();
    const startTime = state.startTime;
    const elapsed = startTime ? now - startTime : 0;
    const remainingTime = Math.max(0, minLoadingTime - elapsed);

    if (remainingTime > 0) {
      // Wait for minimum time to pass
      setTimeout(() => {
        setState(prev => ({
          ...prev,
          isLoading: false,
          progress: 100,
          showSkeleton: false,
          estimatedCompletion: null,
        }));

        onLoadingEnd?.();
        onLoadingChange?.(false);
      }, remainingTime);
    } else {
      // Can stop immediately
      setState(prev => ({
        ...prev,
        isLoading: false,
        progress: 100,
        showSkeleton: false,
        estimatedCompletion: null,
      }));

      onLoadingEnd?.();
      onLoadingChange?.(false);
    }

    // Clear timeouts
    if (minTimeTimeoutRef.current) {
      clearTimeout(minTimeTimeoutRef.current);
      minTimeTimeoutRef.current = null;
    }
    if (skeletonTimeoutRef.current) {
      clearTimeout(skeletonTimeoutRef.current);
      skeletonTimeoutRef.current = null;
    }
  }, [state.startTime, minLoadingTime, onLoadingEnd, onLoadingChange]);

  const setLoadingWithProgress = useCallback((progress: number, message?: string) => {
    updateProgress(progress);
    if (message) {
      updateMessage(message);
    }
  }, [updateProgress, updateMessage]);

  const resetLoading = useCallback(() => {
    setState({
      isLoading: false,
      progress: 0,
      message: null,
      showSkeleton: false,
      startTime: null,
      estimatedCompletion: null,
    });

    // Clear timeouts
    if (minTimeTimeoutRef.current) {
      clearTimeout(minTimeTimeoutRef.current);
      minTimeTimeoutRef.current = null;
    }
    if (skeletonTimeoutRef.current) {
      clearTimeout(skeletonTimeoutRef.current);
      skeletonTimeoutRef.current = null;
    }

    onLoadingChange?.(false);
  }, [onLoadingChange]);

  return {
    state,
    startLoading,
    updateProgress,
    updateMessage,
    stopLoading,
    setLoadingWithProgress,
    resetLoading,
  };
}

/**
 * Hook for toast notifications
 */
interface ToastConfig {
  /** Toast duration (ms) */
  duration?: number;
  /** Maximum number of toasts */
  maxToasts?: number;
  /** Toast position */
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
  /** Callback when toast is shown */
  onToastShow?: (toast: Toast) => void;
  /** Callback when toast is dismissed */
  onToastDismiss?: (toast: Toast) => void;
}

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration: number;
  timestamp: number;
}

interface UseToastReturn {
  /** Show a toast notification */
  showToast: (message: string, type?: Toast['type'], duration?: number) => string;
  /** Dismiss a toast */
  dismissToast: (id: string) => void;
  /** Clear all toasts */
  clearToasts: () => void;
  /** Get all toasts */
  getToasts: () => Toast[];
}

export function useToast({
  duration = 5000,
  maxToasts = 5,
  position = 'top-right',
  onToastShow,
  onToastDismiss,
}: ToastConfig = {}): UseToastReturn {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((
    message: string, 
    type: Toast['type'] = 'info', 
    toastDuration: number = duration
  ): string => {
    const id = Math.random().toString(36).substr(2, 9);
    const toast: Toast = {
      id,
      message,
      type,
      duration: toastDuration,
      timestamp: Date.now(),
    };

    setToasts(prev => {
      const newToasts = [...prev, toast];
      // Limit number of toasts
      if (newToasts.length > maxToasts) {
        return newToasts.slice(-maxToasts);
      }
      return newToasts;
    });

    onToastShow?.(toast);

    // Auto-dismiss after duration
    if (toastDuration > 0) {
      setTimeout(() => {
        dismissToast(id);
      }, toastDuration);
    }

    return id;
  }, [duration, maxToasts, onToastShow]);

  const dismissToast = useCallback((id: string) => {
    setToasts(prev => {
      const toast = prev.find(t => t.id === id);
      if (toast) {
        onToastDismiss?.(toast);
      }
      return prev.filter(t => t.id !== id);
    });
  }, [onToastDismiss]);

  const clearToasts = useCallback(() => {
    setToasts([]);
  }, []);

  const getToasts = useCallback(() => {
    return toasts;
  }, [toasts]);

  return {
    showToast,
    dismissToast,
    clearToasts,
    getToasts,
  };
}

/**
 * Simplified version for basic usage
 */
export function useLoadingStatesSimple() {
  return useLoadingStates();
}

export function useToastSimple() {
  return useToast();
}
