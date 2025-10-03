"use client";

import { useState, useEffect, useCallback } from "react";

/**
 * Network state information
 */
interface NetworkState {
  /** Whether the device is online */
  isOnline: boolean;
  /** Whether the network connection is slow */
  isSlowConnection: boolean;
  /** Whether the network is unstable (frequent disconnections) */
  isUnstable: boolean;
  /** Connection type if available */
  connectionType: string | null;
  /** Effective connection type if available */
  effectiveType: string | null;
  /** Downlink speed in Mbps if available */
  downlink: number | null;
  /** Round trip time in ms if available */
  rtt: number | null;
  /** Whether we're currently retrying due to network issues */
  isRetrying: boolean;
  /** Number of consecutive network failures */
  failureCount: number;
  /** Last time we were online */
  lastOnlineTime: Date | null;
  /** Last time we went offline */
  lastOfflineTime: Date | null;
}

/**
 * Hook for managing network state and connectivity
 * Provides online/offline detection, connection quality monitoring, and retry logic
 */
interface UseNetworkStateOptions {
  /** Whether to enable connection quality monitoring (defaults to true) */
  enableQualityMonitoring?: boolean;
  /** Threshold for considering a connection slow (in Mbps) */
  slowConnectionThreshold?: number;
  /** Number of consecutive failures before considering connection unstable */
  instabilityThreshold?: number;
  /** Callback when network state changes */
  onNetworkChange?: (state: NetworkState) => void;
  /** Callback when going online */
  onOnline?: () => void;
  /** Callback when going offline */
  onOffline?: () => void;
}

interface UseNetworkStateReturn extends NetworkState {
  /** Manually trigger a network check */
  checkNetwork: () => void;
  /** Reset failure count */
  resetFailureCount: () => void;
  /** Mark a network operation as failed */
  markNetworkFailure: () => void;
  /** Mark a network operation as successful */
  markNetworkSuccess: () => void;
}

const DEFAULT_SLOW_CONNECTION_THRESHOLD = 1.5; // 1.5 Mbps
const DEFAULT_INSTABILITY_THRESHOLD = 3;

export function useNetworkState({
  enableQualityMonitoring = true,
  slowConnectionThreshold = DEFAULT_SLOW_CONNECTION_THRESHOLD,
  instabilityThreshold = DEFAULT_INSTABILITY_THRESHOLD,
  onNetworkChange,
  onOnline,
  onOffline,
}: UseNetworkStateOptions = {}): UseNetworkStateReturn {
  const [networkState, setNetworkState] = useState<NetworkState>(() => {
    if (typeof window === "undefined") {
      return {
        isOnline: true,
        isSlowConnection: false,
        isUnstable: false,
        connectionType: null,
        effectiveType: null,
        downlink: null,
        rtt: null,
        isRetrying: false,
        failureCount: 0,
        lastOnlineTime: null,
        lastOfflineTime: null,
      };
    }
    
    return {
      isOnline: navigator.onLine,
      isSlowConnection: false,
      isUnstable: false,
      connectionType: null,
      effectiveType: null,
      downlink: null,
      rtt: null,
      isRetrying: false,
      failureCount: 0,
      lastOnlineTime: navigator.onLine ? new Date() : null,
      lastOfflineTime: navigator.onLine ? null : new Date(),
    };
  });

  const updateNetworkState = useCallback((updates: Partial<NetworkState>) => {
    setNetworkState(prev => {
      const newState = { ...prev, ...updates };
      onNetworkChange?.(newState);
      return newState;
    });
  }, [onNetworkChange]);

  const checkConnectionQuality = useCallback(() => {
    if (!enableQualityMonitoring || typeof window === "undefined") return;

    const connection = (navigator as any).connection || 
                     (navigator as any).mozConnection || 
                     (navigator as any).webkitConnection;

    if (connection) {
      const downlink = connection.downlink;
      const effectiveType = connection.effectiveType;
      const rtt = connection.rtt;
      const connectionType = connection.type;

      const isSlowConnection = downlink ? downlink < slowConnectionThreshold : false;
      const isUnstable = networkState.failureCount >= instabilityThreshold;

      updateNetworkState({
        connectionType,
        effectiveType,
        downlink,
        rtt,
        isSlowConnection,
        isUnstable,
      });
    }
  }, [enableQualityMonitoring, slowConnectionThreshold, instabilityThreshold, networkState.failureCount, updateNetworkState]);

  const checkNetwork = useCallback(() => {
    if (typeof window === "undefined") return;

    const isOnline = navigator.onLine;
    const wasOnline = networkState.isOnline;

    if (isOnline !== wasOnline) {
      if (isOnline) {
        updateNetworkState({
          isOnline: true,
          lastOnlineTime: new Date(),
          failureCount: 0, // Reset failure count when coming back online
        });
        onOnline?.();
      } else {
        updateNetworkState({
          isOnline: false,
          lastOfflineTime: new Date(),
        });
        onOffline?.();
      }
    }

    if (isOnline) {
      checkConnectionQuality();
    }
  }, [networkState.isOnline, updateNetworkState, onOnline, onOffline, checkConnectionQuality]);

  const markNetworkFailure = useCallback(() => {
    setNetworkState(prev => ({
      ...prev,
      failureCount: prev.failureCount + 1,
      isRetrying: true,
    }));
  }, []);

  const markNetworkSuccess = useCallback(() => {
    setNetworkState(prev => ({
      ...prev,
      failureCount: 0,
      isRetrying: false,
    }));
  }, []);

  const resetFailureCount = useCallback(() => {
    updateNetworkState({
      failureCount: 0,
      isRetrying: false,
    });
  }, [updateNetworkState]);

  // Set up event listeners
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleOnline = () => {
      updateNetworkState({
        isOnline: true,
        lastOnlineTime: new Date(),
        failureCount: 0,
      });
      onOnline?.();
    };

    const handleOffline = () => {
      updateNetworkState({
        isOnline: false,
        lastOfflineTime: new Date(),
      });
      onOffline?.();
    };

    const handleConnectionChange = () => {
      checkConnectionQuality();
    };

    // Add event listeners
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    
    if (enableQualityMonitoring) {
      const connection = (navigator as any).connection || 
                       (navigator as any).mozConnection || 
                       (navigator as any).webkitConnection;
      
      if (connection) {
        connection.addEventListener("change", handleConnectionChange);
      }
    }

    // Initial check
    checkNetwork();

    // Cleanup
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      
      if (enableQualityMonitoring) {
        const connection = (navigator as any).connection || 
                         (navigator as any).mozConnection || 
                         (navigator as any).webkitConnection;
        
        if (connection) {
          connection.removeEventListener("change", handleConnectionChange);
        }
      }
    };
  }, [enableQualityMonitoring, checkNetwork, onOnline, onOffline, updateNetworkState, checkConnectionQuality]);

  return {
    ...networkState,
    checkNetwork,
    resetFailureCount,
    markNetworkFailure,
    markNetworkSuccess,
  };
}

/**
 * Simplified version for basic usage
 */
export function useNetworkStateSimple() {
  return useNetworkState();
}
