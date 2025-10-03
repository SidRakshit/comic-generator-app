"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useNetworkState } from "./use-network-state";

/**
 * Operation to be synced in the background
 */
interface SyncOperation<T = any> {
  /** Unique identifier for the operation */
  id: string;
  /** The operation to execute */
  operation: () => Promise<T>;
  /** Priority level (higher numbers = higher priority) */
  priority: number;
  /** When the operation was queued */
  timestamp: number;
  /** Maximum number of retry attempts */
  maxRetries: number;
  /** Current retry count */
  retryCount: number;
  /** Whether the operation is currently being processed */
  isProcessing: boolean;
  /** Last error that occurred */
  lastError: Error | null;
  /** Metadata for the operation */
  metadata?: Record<string, any>;
}

/**
 * Configuration for background sync
 */
interface BackgroundSyncConfig {
  /** Whether background sync is enabled */
  enabled?: boolean;
  /** Maximum number of concurrent operations */
  maxConcurrent?: number;
  /** Delay between operation attempts (ms) */
  retryDelay?: number;
  /** Maximum retry delay (ms) */
  maxRetryDelay?: number;
  /** Whether to use exponential backoff */
  useExponentialBackoff?: boolean;
  /** Callback when an operation succeeds */
  onOperationSuccess?: (operationId: string, result: any) => void;
  /** Callback when an operation fails permanently */
  onOperationFailure?: (operationId: string, error: Error) => void;
  /** Callback when sync state changes */
  onSyncStateChange?: (isSyncing: boolean, pendingCount: number) => void;
}

/**
 * State for background sync
 */
interface BackgroundSyncState {
  /** Whether sync is currently active */
  isSyncing: boolean;
  /** Number of pending operations */
  pendingCount: number;
  /** Number of failed operations */
  failedCount: number;
  /** Number of successful operations */
  successCount: number;
  /** Last sync time */
  lastSyncTime: number | null;
  /** Whether the device is online */
  isOnline: boolean;
}

/**
 * Hook for managing background synchronization of operations
 * Queues operations when offline and syncs them when online
 */
interface UseBackgroundSyncReturn {
  /** Current sync state */
  state: BackgroundSyncState;
  /** Queue an operation for background sync */
  queueOperation: <T>(
    operationId: string,
    operation: () => Promise<T>,
    priority?: number,
    metadata?: Record<string, any>
  ) => void;
  /** Remove an operation from the queue */
  removeOperation: (operationId: string) => void;
  /** Clear all operations from the queue */
  clearQueue: () => void;
  /** Manually trigger sync */
  triggerSync: () => Promise<void>;
  /** Get all pending operations */
  getPendingOperations: () => SyncOperation[];
  /** Get failed operations */
  getFailedOperations: () => SyncOperation[];
}

export function useBackgroundSync({
  enabled = true,
  maxConcurrent = 3,
  retryDelay = 1000,
  maxRetryDelay = 30000,
  useExponentialBackoff = true,
  onOperationSuccess,
  onOperationFailure,
  onSyncStateChange,
}: BackgroundSyncConfig = {}): UseBackgroundSyncReturn {
  const [operations, setOperations] = useState<Map<string, SyncOperation>>(new Map());
  const [state, setState] = useState<BackgroundSyncState>({
    isSyncing: false,
    pendingCount: 0,
    failedCount: 0,
    successCount: 0,
    lastSyncTime: null,
    isOnline: true,
  });

  const { isOnline } = useNetworkState();
  const processingRef = useRef<Set<string>>(new Set());
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Update online state
  useEffect(() => {
    setState(prev => ({ ...prev, isOnline }));
  }, [isOnline]);

  // Process operations when online
  useEffect(() => {
    if (isOnline && enabled && operations.size > 0) {
      triggerSync();
    }
  }, [isOnline, enabled, operations.size]);

  const calculateRetryDelay = useCallback((retryCount: number): number => {
    if (!useExponentialBackoff) {
      return retryDelay;
    }
    
    const delay = retryDelay * Math.pow(2, retryCount);
    return Math.min(delay, maxRetryDelay);
  }, [retryDelay, maxRetryDelay, useExponentialBackoff]);

  const processOperation = useCallback(async (operation: SyncOperation): Promise<void> => {
    if (processingRef.current.has(operation.id)) {
      return;
    }

    processingRef.current.add(operation.id);
    
    setOperations(prev => {
      const newMap = new Map(prev);
      const updatedOp = { ...operation, isProcessing: true };
      newMap.set(operation.id, updatedOp);
      return newMap;
    });

    try {
      const result = await operation.operation();
      
      // Operation succeeded
      setOperations(prev => {
        const newMap = new Map(prev);
        newMap.delete(operation.id);
        return newMap;
      });

      setState(prev => ({
        ...prev,
        successCount: prev.successCount + 1,
        lastSyncTime: Date.now(),
      }));

      onOperationSuccess?.(operation.id, result);
    } catch (error) {
      const newRetryCount = operation.retryCount + 1;
      
      if (newRetryCount >= operation.maxRetries) {
        // Operation failed permanently
        setOperations(prev => {
          const newMap = new Map(prev);
          const failedOp = { 
            ...operation, 
            isProcessing: false, 
            retryCount: newRetryCount,
            lastError: error as Error 
          };
          newMap.set(operation.id, failedOp);
          return newMap;
        });

        setState(prev => ({
          ...prev,
          failedCount: prev.failedCount + 1,
        }));

        onOperationFailure?.(operation.id, error as Error);
      } else {
        // Schedule retry
        const delay = calculateRetryDelay(newRetryCount);
        
        setOperations(prev => {
          const newMap = new Map(prev);
          const retryOp = { 
            ...operation, 
            isProcessing: false, 
            retryCount: newRetryCount,
            lastError: error as Error 
          };
          newMap.set(operation.id, retryOp);
          return newMap;
        });

        // Schedule retry
        setTimeout(() => {
          setOperations(prev => {
            const newMap = new Map(prev);
            const op = newMap.get(operation.id);
            if (op) {
              processOperation(op);
            }
            return newMap;
          });
        }, delay);
      }
    } finally {
      processingRef.current.delete(operation.id);
    }
  }, [calculateRetryDelay, onOperationSuccess, onOperationFailure]);

  const triggerSync = useCallback(async (): Promise<void> => {
    if (!enabled || !isOnline || state.isSyncing) {
      return;
    }

    setState(prev => ({ ...prev, isSyncing: true }));
    onSyncStateChange?.(true, operations.size);

    // Get operations sorted by priority (highest first) and timestamp (oldest first)
    const sortedOperations = Array.from(operations.values())
      .filter(op => !op.isProcessing)
      .sort((a, b) => {
        const priorityDiff = b.priority - a.priority;
        if (priorityDiff !== 0) return priorityDiff;
        return a.timestamp - b.timestamp;
      });

    // Process operations with concurrency limit
    const processPromises: Promise<void>[] = [];
    let currentIndex = 0;

    while (currentIndex < sortedOperations.length && processPromises.length < maxConcurrent) {
      const operation = sortedOperations[currentIndex];
      processPromises.push(processOperation(operation));
      currentIndex++;
    }

    // Process remaining operations as others complete
    const processNext = () => {
      if (currentIndex < sortedOperations.length) {
        const operation = sortedOperations[currentIndex];
        processPromises.push(processOperation(operation));
        currentIndex++;
      }
    };

    // Wait for all operations to complete
    await Promise.allSettled(processPromises);

    setState(prev => ({ ...prev, isSyncing: false }));
    onSyncStateChange?.(false, operations.size);
  }, [enabled, isOnline, state.isSyncing, operations, maxConcurrent, processOperation, onSyncStateChange]);

  const queueOperation = useCallback(<T>(
    operationId: string,
    operation: () => Promise<T>,
    priority: number = 0,
    metadata?: Record<string, any>
  ) => {
    if (!enabled) {
      return;
    }

    const syncOperation: SyncOperation<T> = {
      id: operationId,
      operation,
      priority,
      timestamp: Date.now(),
      maxRetries: 3,
      retryCount: 0,
      isProcessing: false,
      lastError: null,
      metadata,
    };

    setOperations(prev => {
      const newMap = new Map(prev);
      newMap.set(operationId, syncOperation);
      return newMap;
    });

    setState(prev => ({
      ...prev,
      pendingCount: prev.pendingCount + 1,
    }));

    // If online, process immediately
    if (isOnline) {
      processOperation(syncOperation);
    }
  }, [enabled, isOnline, processOperation]);

  const removeOperation = useCallback((operationId: string) => {
    setOperations(prev => {
      const newMap = new Map(prev);
      newMap.delete(operationId);
      return newMap;
    });

    setState(prev => ({
      ...prev,
      pendingCount: Math.max(0, prev.pendingCount - 1),
    }));
  }, []);

  const clearQueue = useCallback(() => {
    setOperations(new Map());
    setState(prev => ({
      ...prev,
      pendingCount: 0,
      failedCount: 0,
    }));
  }, []);

  const getPendingOperations = useCallback(() => {
    return Array.from(operations.values()).filter(op => !op.isProcessing);
  }, [operations]);

  const getFailedOperations = useCallback(() => {
    return Array.from(operations.values()).filter(op => 
      op.retryCount >= op.maxRetries && op.lastError
    );
  }, [operations]);

  // Update pending count when operations change
  useEffect(() => {
    const pendingCount = Array.from(operations.values()).filter(op => !op.isProcessing).length;
    setState(prev => ({ ...prev, pendingCount }));
  }, [operations]);

  return {
    state,
    queueOperation,
    removeOperation,
    clearQueue,
    triggerSync,
    getPendingOperations,
    getFailedOperations,
  };
}

/**
 * Simplified version for basic usage
 */
export function useBackgroundSyncSimple() {
  return useBackgroundSync();
}
