"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";

/**
 * Performance metrics
 */
interface PerformanceMetrics {
  /** Number of renders */
  renderCount: number;
  /** Last render time */
  lastRenderTime: number;
  /** Average render time */
  averageRenderTime: number;
  /** Memory usage (if available) */
  memoryUsage: number | null;
  /** Whether the component is visible */
  isVisible: boolean;
  /** Whether the component is in viewport */
  isInViewport: boolean;
}

/**
 * Configuration for performance optimizations
 */
interface PerformanceOptimizationConfig {
  /** Whether to track render performance */
  trackRenders?: boolean;
  /** Whether to use intersection observer for visibility */
  useIntersectionObserver?: boolean;
  /** Whether to use resize observer for size changes */
  useResizeObserver?: boolean;
  /** Debounce delay for resize events */
  resizeDebounceDelay?: number;
  /** Whether to enable memory monitoring */
  enableMemoryMonitoring?: boolean;
  /** Callback when performance metrics change */
  onMetricsChange?: (metrics: PerformanceMetrics) => void;
  /** Callback when component becomes visible */
  onVisible?: () => void;
  /** Callback when component becomes hidden */
  onHidden?: () => void;
}

/**
 * Hook for performance optimizations and monitoring
 * Provides render tracking, visibility detection, and memory monitoring
 */
interface UsePerformanceOptimizationsReturn {
  /** Current performance metrics */
  metrics: PerformanceMetrics;
  /** Whether the component is visible */
  isVisible: boolean;
  /** Whether the component is in viewport */
  isInViewport: boolean;
  /** Component dimensions */
  dimensions: { width: number; height: number } | null;
  /** Reset performance metrics */
  resetMetrics: () => void;
  /** Force a performance check */
  checkPerformance: () => void;
}

export function usePerformanceOptimizations({
  trackRenders = true,
  useIntersectionObserver = true,
  useResizeObserver = true,
  resizeDebounceDelay = 100,
  enableMemoryMonitoring = false,
  onMetricsChange,
  onVisible,
  onHidden,
}: PerformanceOptimizationConfig = {}): UsePerformanceOptimizationsReturn {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    renderCount: 0,
    lastRenderTime: 0,
    averageRenderTime: 0,
    memoryUsage: null,
    memoryUsage: null,
    isVisible: true,
    isInViewport: true,
  });

  const [isVisible, setIsVisible] = useState(true);
  const [isInViewport, setIsInViewport] = useState(true);
  const [dimensions, setDimensions] = useState<{ width: number; height: number } | null>(null);

  const elementRef = useRef<HTMLElement | null>(null);
  const renderTimesRef = useRef<number[]>([]);
  const intersectionObserverRef = useRef<IntersectionObserver | null>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const resizeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Track render performance
  useEffect(() => {
    if (!trackRenders) return;

    const renderStart = performance.now();
    
    return () => {
      const renderEnd = performance.now();
      const renderTime = renderEnd - renderStart;
      
      setMetrics(prev => {
        const newRenderCount = prev.renderCount + 1;
        const newRenderTimes = [...renderTimesRef.current, renderTime];
        renderTimesRef.current = newRenderTimes;
        
        const averageRenderTime = newRenderTimes.reduce((sum, time) => sum + time, 0) / newRenderTimes.length;
        
        const newMetrics = {
          ...prev,
          renderCount: newRenderCount,
          lastRenderTime: renderTime,
          averageRenderTime,
        };
        
        onMetricsChange?.(newMetrics);
        return newMetrics;
      });
    };
  }, [trackRenders, onMetricsChange]);

  // Memory monitoring
  useEffect(() => {
    if (!enableMemoryMonitoring || typeof window === "undefined") return;

    const updateMemoryUsage = () => {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        setMetrics(prev => ({
          ...prev,
          memoryUsage: memory.usedJSHeapSize,
        }));
      }
    };

    updateMemoryUsage();
    const interval = setInterval(updateMemoryUsage, 5000); // Check every 5 seconds

    return () => clearInterval(interval);
  }, [enableMemoryMonitoring]);

  // Intersection Observer for visibility
  useEffect(() => {
    if (!useIntersectionObserver || typeof window === "undefined") return;

    const element = elementRef.current;
    if (!element) return;

    intersectionObserverRef.current = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        const isIntersecting = entry.isIntersecting;
        
        setIsInViewport(isIntersecting);
        setMetrics(prev => ({ ...prev, isInViewport: isIntersecting }));
        
        if (isIntersecting) {
          onVisible?.();
        } else {
          onHidden?.();
        }
      },
      { threshold: 0.1 }
    );

    intersectionObserverRef.current.observe(element);

    return () => {
      if (intersectionObserverRef.current) {
        intersectionObserverRef.current.disconnect();
      }
    };
  }, [useIntersectionObserver, onVisible, onHidden]);

  // Resize Observer for dimensions
  useEffect(() => {
    if (!useResizeObserver || typeof window === "undefined") return;

    const element = elementRef.current;
    if (!element) return;

    resizeObserverRef.current = new ResizeObserver((entries) => {
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }

      resizeTimeoutRef.current = setTimeout(() => {
        const entry = entries[0];
        if (entry) {
          const { width, height } = entry.contentRect;
          setDimensions({ width, height });
        }
      }, resizeDebounceDelay);
    });

    resizeObserverRef.current.observe(element);

    return () => {
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
      }
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
    };
  }, [useResizeObserver, resizeDebounceDelay]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intersectionObserverRef.current) {
        intersectionObserverRef.current.disconnect();
      }
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
      }
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
    };
  }, []);

  const resetMetrics = useCallback(() => {
    setMetrics({
      renderCount: 0,
      lastRenderTime: 0,
      averageRenderTime: 0,
      memoryUsage: null,
      isVisible: true,
      isInViewport: true,
    });
    renderTimesRef.current = [];
  }, []);

  const checkPerformance = useCallback(() => {
    if (enableMemoryMonitoring && 'memory' in performance) {
      const memory = (performance as any).memory;
      setMetrics(prev => ({
        ...prev,
        memoryUsage: memory.usedJSHeapSize,
      }));
    }
  }, [enableMemoryMonitoring]);

  return {
    metrics,
    isVisible,
    isInViewport,
    dimensions,
    resetMetrics,
    checkPerformance,
  };
}

/**
 * Hook for debouncing values
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Hook for throttling function calls
 */
export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const lastCallRef = useRef<number>(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const throttledCallback = useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now();
      
      if (now - lastCallRef.current >= delay) {
        lastCallRef.current = now;
        return callback(...args);
      } else {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        
        timeoutRef.current = setTimeout(() => {
          lastCallRef.current = Date.now();
          callback(...args);
        }, delay - (now - lastCallRef.current));
      }
    },
    [callback, delay]
  ) as T;

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return throttledCallback;
}

/**
 * Hook for memoizing expensive calculations
 */
export function useMemoizedValue<T>(
  factory: () => T,
  deps: React.DependencyList
): T {
  return useMemo(factory, deps);
}

/**
 * Hook for lazy loading components
 */
export function useLazyLoad<T>(
  importFunction: () => Promise<T>,
  deps: React.DependencyList = []
): { Component: T | null; loading: boolean; error: Error | null } {
  const [Component, setComponent] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    
    importFunction()
      .then((component) => {
        setComponent(component);
        setLoading(false);
      })
      .catch((err) => {
        setError(err);
        setLoading(false);
      });
  }, deps);

  return { Component, loading, error };
}

/**
 * Simplified version for basic usage
 */
export function usePerformanceOptimizationsSimple() {
  return usePerformanceOptimizations();
}
