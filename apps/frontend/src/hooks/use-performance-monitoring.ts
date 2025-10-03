"use client";

import { useEffect, useRef, useCallback, useState } from "react";

/**
 * Performance metrics interface
 */
interface PerformanceMetrics {
  /** First Contentful Paint */
  fcp: number | null;
  /** Largest Contentful Paint */
  lcp: number | null;
  /** First Input Delay */
  fid: number | null;
  /** Cumulative Layout Shift */
  cls: number | null;
  /** Time to Interactive */
  tti: number | null;
  /** Total Blocking Time */
  tbt: number | null;
  /** Speed Index */
  si: number | null;
  /** Memory usage */
  memoryUsage: number | null;
  /** Navigation timing */
  navigationTiming: {
    domContentLoaded: number | null;
    loadComplete: number | null;
    domInteractive: number | null;
  };
}

/**
 * Performance monitoring configuration
 */
interface PerformanceMonitoringConfig {
  /** Whether to enable monitoring */
  enabled?: boolean;
  /** Sampling rate (0-1) */
  samplingRate?: number;
  /** Whether to report to analytics */
  reportToAnalytics?: boolean;
  /** Custom analytics function */
  onMetricsUpdate?: (metrics: PerformanceMetrics) => void;
  /** Whether to log to console in development */
  logToConsole?: boolean;
}

/**
 * Hook for performance monitoring
 * Tracks Core Web Vitals and other performance metrics
 */
export function usePerformanceMonitoring({
  enabled = true,
  samplingRate = 1.0,
  reportToAnalytics = true,
  onMetricsUpdate,
  logToConsole = process.env.NODE_ENV === "development",
}: PerformanceMonitoringConfig = {}) {
  const metricsRef = useRef<PerformanceMetrics>({
    fcp: null,
    lcp: null,
    fid: null,
    cls: null,
    tti: null,
    tbt: null,
    si: null,
    memoryUsage: null,
    navigationTiming: {
      domContentLoaded: null,
      loadComplete: null,
      domInteractive: null,
    },
  });

  const updateMetrics = useCallback((newMetrics: Partial<PerformanceMetrics>) => {
    metricsRef.current = { ...metricsRef.current, ...newMetrics };
    
    if (logToConsole) {
      console.log("Performance Metrics Updated:", newMetrics);
    }
    
    onMetricsUpdate?.(metricsRef.current);
  }, [onMetricsUpdate, logToConsole]);

  // Track Core Web Vitals
  useEffect(() => {
    if (!enabled || typeof window === "undefined") return;

    // Skip if sampling rate is less than 1 and random check fails
    if (Math.random() > samplingRate) return;

    // First Contentful Paint
    const fcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const fcpEntry = entries.find(entry => entry.name === "first-contentful-paint");
      if (fcpEntry) {
        updateMetrics({ fcp: fcpEntry.startTime });
      }
    });

    try {
      fcpObserver.observe({ entryTypes: ["paint"] });
    } catch (error) {
      console.warn("FCP observer not supported:", error);
    }

    // Largest Contentful Paint
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      if (lastEntry) {
        updateMetrics({ lcp: lastEntry.startTime });
      }
    });

    try {
      lcpObserver.observe({ entryTypes: ["largest-contentful-paint"] });
    } catch (error) {
      console.warn("LCP observer not supported:", error);
    }

    // First Input Delay
    const fidObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry: any) => {
        updateMetrics({ fid: entry.processingStart - entry.startTime });
      });
    });

    try {
      fidObserver.observe({ entryTypes: ["first-input"] });
    } catch (error) {
      console.warn("FID observer not supported:", error);
    }

    // Cumulative Layout Shift
    let clsValue = 0;
    const clsObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry: any) => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
        }
      });
      updateMetrics({ cls: clsValue });
    });

    try {
      clsObserver.observe({ entryTypes: ["layout-shift"] });
    } catch (error) {
      console.warn("CLS observer not supported:", error);
    }

    // Navigation timing
    const updateNavigationTiming = () => {
      const navigation = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming;
      if (navigation) {
        updateMetrics({
          navigationTiming: {
            domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
            loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
            domInteractive: navigation.domInteractive - (performance.timing?.navigationStart || 0),
          },
        });
      }
    };

    // Update navigation timing when page loads
    if (document.readyState === "complete") {
      updateNavigationTiming();
    } else {
      window.addEventListener("load", updateNavigationTiming);
    }

    // Memory usage (if available)
    const updateMemoryUsage = () => {
      if ("memory" in performance) {
        const memory = (performance as any).memory;
        updateMetrics({ memoryUsage: memory.usedJSHeapSize });
      }
    };

    updateMemoryUsage();
    const memoryInterval = setInterval(updateMemoryUsage, 5000);

    // Cleanup
    return () => {
      fcpObserver?.disconnect();
      lcpObserver?.disconnect();
      fidObserver?.disconnect();
      clsObserver?.disconnect();
      window.removeEventListener("load", updateNavigationTiming);
      clearInterval(memoryInterval);
    };
  }, [enabled, samplingRate, updateMetrics]);

  // Track custom metrics
  const trackCustomMetric = useCallback((name: string, value: number, unit: string = "ms") => {
    if (logToConsole) {
      console.log(`Custom Metric - ${name}: ${value}${unit}`);
    }

    // Report to analytics if enabled
    if (reportToAnalytics && typeof window !== "undefined" && (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag) {
      (window as unknown as { gtag: (...args: unknown[]) => void }).gtag("event", "custom_metric", {
        metric_name: name,
        metric_value: value,
        metric_unit: unit,
      });
    }
  }, [logToConsole, reportToAnalytics]);

  // Track page load time
  const trackPageLoad = useCallback((pageName: string) => {
    const loadTime = performance.now();
    trackCustomMetric("page_load_time", loadTime);
    
    if (reportToAnalytics && typeof window !== "undefined" && (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag) {
      (window as unknown as { gtag: (...args: unknown[]) => void }).gtag("event", "page_load", {
        page_name: pageName,
        load_time: loadTime,
      });
    }
  }, [trackCustomMetric, reportToAnalytics]);

  // Track user interactions
  const trackInteraction = useCallback((action: string, target: string, duration?: number) => {
    if (logToConsole) {
      console.log(`User Interaction - ${action}: ${target}${duration ? ` (${duration}ms)` : ""}`);
    }

    if (reportToAnalytics && typeof window !== "undefined" && (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag) {
      (window as unknown as { gtag: (...args: unknown[]) => void }).gtag("event", "user_interaction", {
        action,
        target,
        duration,
      });
    }
  }, [logToConsole, reportToAnalytics]);

  // Track errors
  const trackError = useCallback((error: Error, context?: string) => {
    if (logToConsole) {
      console.error("Performance Error:", error, context);
    }

    if (reportToAnalytics && typeof window !== "undefined" && (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag) {
      (window as unknown as { gtag: (...args: unknown[]) => void }).gtag("event", "exception", {
        description: error.message,
        fatal: false,
        custom_map: {
          context: context || "unknown",
        },
      });
    }
  }, [logToConsole, reportToAnalytics]);

  return {
    metrics: metricsRef.current,
    trackCustomMetric,
    trackPageLoad,
    trackInteraction,
    trackError,
  };
}

/**
 * Hook for monitoring component performance
 */
export function useComponentPerformance(componentName: string) {
  const renderStartTime = useRef<number>(0);
  const renderCount = useRef<number>(0);

  // Track render start
  useEffect(() => {
    renderStartTime.current = performance.now();
  });

  // Track render end
  useEffect(() => {
    const renderTime = performance.now() - renderStartTime.current;
    renderCount.current += 1;

    if (process.env.NODE_ENV === "development") {
      console.log(`${componentName} render #${renderCount.current}: ${renderTime.toFixed(2)}ms`);
    }
  });

  return {
    renderCount: renderCount.current,
  };
}

/**
 * Hook for monitoring network performance
 */
export function useNetworkPerformance() {
  const [networkInfo, setNetworkInfo] = useState<{
    effectiveType: string;
    downlink: number;
    rtt: number;
  } | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const updateNetworkInfo = () => {
      const connection = (navigator as any).connection || 
                       (navigator as any).mozConnection || 
                       (navigator as any).webkitConnection;

      if (connection) {
        setNetworkInfo({
          effectiveType: connection.effectiveType || "unknown",
          downlink: connection.downlink || 0,
          rtt: connection.rtt || 0,
        });
      }
    };

    updateNetworkInfo();

    if ((navigator as any).connection) {
      (navigator as any).connection.addEventListener("change", updateNetworkInfo);
    }

    return () => {
      if ((navigator as any).connection) {
        (navigator as any).connection.removeEventListener("change", updateNetworkInfo);
      }
    };
  }, []);

  return networkInfo;
}
