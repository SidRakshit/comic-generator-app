"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useNetworkState } from "./use-network-state";
import { useBackgroundSync } from "./use-background-sync";

/**
 * Offline operation that can be queued for later execution
 */
interface OfflineOperation<T = any> {
  /** Unique identifier */
  id: string;
  /** Operation type */
  type: string;
  /** The operation to execute when online */
  operation: () => Promise<T>;
  /** Data to store locally */
  data: T;
  /** Priority level */
  priority: number;
  /** When the operation was created */
  timestamp: number;
  /** Whether the operation has been synced */
  isSynced: boolean;
  /** Metadata */
  metadata?: Record<string, any>;
}

/**
 * Configuration for offline mode
 */
interface OfflineModeConfig {
  /** Whether offline mode is enabled */
  enabled?: boolean;
  /** Storage key for offline data */
  storageKey?: string;
  /** Maximum age for offline data (ms) */
  maxAge?: number;
  /** Whether to auto-sync when coming online */
  autoSync?: boolean;
  /** Callback when going offline */
  onOffline?: () => void;
  /** Callback when coming online */
  onOnline?: () => void;
  /** Callback when operation is queued */
  onOperationQueued?: (operation: OfflineOperation) => void;
  /** Callback when operation is synced */
  onOperationSynced?: (operation: OfflineOperation) => void;
}

/**
 * State for offline mode
 */
interface OfflineModeState {
  /** Whether the device is currently offline */
  isOffline: boolean;
  /** Number of queued operations */
  queuedOperationsCount: number;
  /** Whether sync is in progress */
  isSyncing: boolean;
  /** Last sync time */
  lastSyncTime: number | null;
  /** Whether offline mode is available */
  isAvailable: boolean;
}

/**
 * Hook for managing offline mode functionality
 * Provides offline operation queuing and automatic sync when online
 */
interface UseOfflineModeReturn {
  /** Current offline state */
  state: OfflineModeState;
  /** Queue an operation for offline execution */
  queueOperation: <T>(
    id: string,
    type: string,
    operation: () => Promise<T>,
    data: T,
    priority?: number,
    metadata?: Record<string, any>
  ) => void;
  /** Get all queued operations */
  getQueuedOperations: () => OfflineOperation[];
  /** Get operations by type */
  getOperationsByType: (type: string) => OfflineOperation[];
  /** Clear all queued operations */
  clearQueuedOperations: () => void;
  /** Manually trigger sync */
  syncOperations: () => Promise<void>;
  /** Check if offline mode is available */
  checkAvailability: () => boolean;
}

export function useOfflineMode({
  enabled = true,
  storageKey = "offline-operations",
  maxAge = 7 * 24 * 60 * 60 * 1000, // 7 days
  autoSync = true,
  onOffline,
  onOnline,
  onOperationQueued,
  onOperationSynced,
}: OfflineModeConfig = {}): UseOfflineModeReturn {
  const [queuedOperations, setQueuedOperations] = useState<Map<string, OfflineOperation>>(new Map());
  const [state, setState] = useState<OfflineModeState>({
    isOffline: false,
    queuedOperationsCount: 0,
    isSyncing: false,
    lastSyncTime: null,
    isAvailable: false,
  });

  const { isOnline, isSlowConnection, isUnstable } = useNetworkState();
  const { queueOperation: queueSyncOperation, triggerSync } = useBackgroundSync({
    enabled: autoSync,
    onOperationSuccess: (operationId) => {
      setQueuedOperations(prev => {
        const newMap = new Map(prev);
        const operation = newMap.get(operationId);
        if (operation) {
          const syncedOperation = { ...operation, isSynced: true };
          newMap.set(operationId, syncedOperation);
          onOperationSynced?.(syncedOperation);
        }
        return newMap;
      });
    },
  });

  const storageRef = useRef<Storage | null>(null);

  // Initialize storage
  useEffect(() => {
    if (typeof window !== "undefined" && window.localStorage) {
      storageRef.current = window.localStorage;
      setState(prev => ({ ...prev, isAvailable: true }));
    }
  }, []);

  // Load queued operations from storage on mount
  useEffect(() => {
    if (!storageRef.current || !enabled) return;

    try {
      const stored = storageRef.current.getItem(storageKey);
      if (stored) {
        const operations = JSON.parse(stored);
        const now = Date.now();
        const validOperations = operations.filter((op: OfflineOperation) => 
          now - op.timestamp < maxAge
        );
        
        setQueuedOperations(new Map(validOperations.map((op: OfflineOperation) => [op.id, op])));
        setState(prev => ({ ...prev, queuedOperationsCount: validOperations.length }));
      }
    } catch (error) {
      console.error("Failed to load offline operations:", error);
    }
  }, [enabled, storageKey, maxAge]);

  // Save queued operations to storage
  const saveToStorage = useCallback(() => {
    if (!storageRef.current || !enabled) return;

    try {
      const operations = Array.from(queuedOperations.values());
      storageRef.current.setItem(storageKey, JSON.stringify(operations));
    } catch (error) {
      console.error("Failed to save offline operations:", error);
    }
  }, [queuedOperations, enabled, storageKey]);

  // Save to storage when operations change
  useEffect(() => {
    saveToStorage();
  }, [saveToStorage]);

  // Handle online/offline state changes
  useEffect(() => {
    const wasOffline = state.isOffline;
    const isOffline = !isOnline;

    if (isOffline && !wasOffline) {
      // Going offline
      setState(prev => ({ ...prev, isOffline: true }));
      onOffline?.();
    } else if (!isOffline && wasOffline) {
      // Coming online
      setState(prev => ({ ...prev, isOffline: false }));
      onOnline?.();
      
      if (autoSync) {
        syncOperations();
      }
    }
  }, [isOnline, state.isOffline, onOffline, onOnline, autoSync]);

  const queueOperation = useCallback(<T>(
    id: string,
    type: string,
    operation: () => Promise<T>,
    data: T,
    priority: number = 0,
    metadata?: Record<string, any>
  ) => {
    if (!enabled) {
      return;
    }

    const offlineOperation: OfflineOperation<T> = {
      id,
      type,
      operation,
      data,
      priority,
      timestamp: Date.now(),
      isSynced: false,
      metadata,
    };

    setQueuedOperations(prev => {
      const newMap = new Map(prev);
      newMap.set(id, offlineOperation);
      return newMap;
    });

    setState(prev => ({
      ...prev,
      queuedOperationsCount: prev.queuedOperationsCount + 1,
    }));

    onOperationQueued?.(offlineOperation);

    // If online, queue for background sync
    if (isOnline && autoSync) {
      queueSyncOperation(id, operation, priority, metadata);
    }
  }, [enabled, isOnline, autoSync, queueSyncOperation, onOperationQueued]);

  const getQueuedOperations = useCallback(() => {
    return Array.from(queuedOperations.values());
  }, [queuedOperations]);

  const getOperationsByType = useCallback((type: string) => {
    return Array.from(queuedOperations.values()).filter(op => op.type === type);
  }, [queuedOperations]);

  const clearQueuedOperations = useCallback(() => {
    setQueuedOperations(new Map());
    setState(prev => ({ ...prev, queuedOperationsCount: 0 }));
    
    if (storageRef.current) {
      storageRef.current.removeItem(storageKey);
    }
  }, [storageKey]);

  const syncOperations = useCallback(async () => {
    if (!isOnline || state.isSyncing) {
      return;
    }

    setState(prev => ({ ...prev, isSyncing: true }));

    try {
      const unsyncedOperations = Array.from(queuedOperations.values())
        .filter(op => !op.isSynced)
        .sort((a, b) => b.priority - a.priority);

      for (const operation of unsyncedOperations) {
        try {
          await operation.operation();
          
          setQueuedOperations(prev => {
            const newMap = new Map(prev);
            const syncedOp = { ...operation, isSynced: true };
            newMap.set(operation.id, syncedOp);
            return newMap;
          });

          onOperationSynced?.(operation);
        } catch (error) {
          console.error(`Failed to sync operation ${operation.id}:`, error);
        }
      }

      setState(prev => ({ 
        ...prev, 
        isSyncing: false, 
        lastSyncTime: Date.now() 
      }));
    } catch (error) {
      console.error("Failed to sync operations:", error);
      setState(prev => ({ ...prev, isSyncing: false }));
    }
  }, [isOnline, state.isSyncing, queuedOperations, onOperationSynced]);

  const checkAvailability = useCallback(() => {
    return storageRef.current !== null && enabled;
  }, [enabled]);

  return {
    state,
    queueOperation,
    getQueuedOperations,
    getOperationsByType,
    clearQueuedOperations,
    syncOperations,
    checkAvailability,
  };
}

/**
 * Simplified version for basic usage
 */
export function useOfflineModeSimple() {
  return useOfflineMode();
}
