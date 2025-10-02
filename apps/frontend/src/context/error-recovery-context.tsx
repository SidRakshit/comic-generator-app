"use client";

import React, { createContext, useContext, useState, useCallback, useMemo, ReactNode } from "react";
import { useRetryStrategies, OperationType } from "@/hooks/use-retry-strategies";
import { useNetworkState } from "@/hooks/use-network-state";

/**
 * Error recovery context for managing application-wide error states
 * Provides centralized error handling and recovery mechanisms
 */
interface ErrorRecoveryContextType {
  /** Map of operation IDs to their error states */
  failedOperations: Map<string, {
    error: Error;
    timestamp: number;
    retryCount: number;
    operation: () => Promise<void>;
    operationType: OperationType;
    priority: 'low' | 'medium' | 'high';
  }>;
  /** Add a failed operation to the error recovery system */
  addFailedOperation: (
    operationId: string, 
    error: Error, 
    operation: () => Promise<void>,
    operationType: OperationType,
    priority?: 'low' | 'medium' | 'high'
  ) => void;
  /** Retry a specific failed operation */
  retryOperation: (operationId: string) => Promise<void>;
  /** Retry all failed operations */
  retryAllOperations: () => Promise<void>;
  /** Clear a specific error */
  clearError: (operationId: string) => void;
  /** Clear all errors */
  clearAllErrors: () => void;
  /** Check if there are any failed operations */
  hasFailedOperations: boolean;
  /** Get all failed operations */
  getAllFailedOperations: () => Array<{
    operationId: string;
    error: Error;
    timestamp: number;
    retryCount: number;
    operationType: OperationType;
    priority: 'low' | 'medium' | 'high';
  }>;
  /** Get failed operations by priority */
  getFailedOperationsByPriority: (priority: 'low' | 'medium' | 'high') => Array<{
    operationId: string;
    error: Error;
    timestamp: number;
    retryCount: number;
    operationType: OperationType;
  }>;
  /** Network state information */
  networkState: {
    isOnline: boolean;
    isSlowConnection: boolean;
    isUnstable: boolean;
    failureCount: number;
  };
}

const ErrorRecoveryContext = createContext<ErrorRecoveryContextType | null>(null);

/**
 * Provider component for error recovery context
 */
export function ErrorRecoveryProvider({ children }: { children: ReactNode }) {
  const [failedOperations, setFailedOperations] = useState<Map<string, {
    error: Error;
    timestamp: number;
    retryCount: number;
    operation: () => Promise<void>;
    operationType: OperationType;
    priority: 'low' | 'medium' | 'high';
  }>>(new Map());

  // Use retry strategies and network state
  const { executeWithRetry } = useRetryStrategies();
  const { isOnline, isSlowConnection, isUnstable, failureCount } = useNetworkState();

  const addFailedOperation = useCallback((
    operationId: string,
    error: Error,
    operation: () => Promise<void>,
    operationType: OperationType,
    priority: 'low' | 'medium' | 'high' = 'medium'
  ) => {
    setFailedOperations(prev => {
      const newMap = new Map(prev);
      const existing = newMap.get(operationId);
      newMap.set(operationId, {
        error,
        timestamp: Date.now(),
        retryCount: (existing?.retryCount || 0) + 1,
        operation,
        operationType,
        priority,
      });
      return newMap;
    });
  }, []);

  const retryOperation = useCallback(async (operationId: string) => {
    const operationData = failedOperations.get(operationId);
    if (!operationData) return;

    try {
      await executeWithRetry(
        operationData.operation,
        operationData.operationType,
        operationId
      );
      // If successful, clear the error
      clearError(operationId);
    } catch (error) {
      // If it fails again, update the error
      addFailedOperation(
        operationId, 
        error as Error, 
        operationData.operation,
        operationData.operationType,
        operationData.priority
      );
    }
  }, [failedOperations, executeWithRetry, addFailedOperation]);

  const retryAllOperations = useCallback(async () => {
    const operations = Array.from(failedOperations.entries());
    
    // Sort by priority (high first) and then by timestamp (oldest first)
    const sortedOperations = operations.sort(([, a], [, b]) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      if (priorityDiff !== 0) return priorityDiff;
      return a.timestamp - b.timestamp;
    });

    // Retry operations sequentially to avoid overwhelming the system
    for (const [operationId] of sortedOperations) {
      await retryOperation(operationId);
    }
  }, [failedOperations, retryOperation]);

  const clearError = useCallback((operationId: string) => {
    setFailedOperations(prev => {
      const newMap = new Map(prev);
      newMap.delete(operationId);
      return newMap;
    });
  }, []);

  const clearAllErrors = useCallback(() => {
    setFailedOperations(new Map());
  }, []);

  const hasFailedOperations = failedOperations.size > 0;

  const getAllFailedOperations = useCallback(() => {
    return Array.from(failedOperations.entries()).map(([operationId, data]) => ({
      operationId,
      error: data.error,
      timestamp: data.timestamp,
      retryCount: data.retryCount,
      operationType: data.operationType,
      priority: data.priority,
    }));
  }, [failedOperations]);

  const getFailedOperationsByPriority = useCallback((priority: 'low' | 'medium' | 'high') => {
    return Array.from(failedOperations.entries())
      .filter(([, data]) => data.priority === priority)
      .map(([operationId, data]) => ({
        operationId,
        error: data.error,
        timestamp: data.timestamp,
        retryCount: data.retryCount,
        operationType: data.operationType,
      }));
  }, [failedOperations]);

  const value = useMemo(() => ({
    failedOperations,
    addFailedOperation,
    retryOperation,
    retryAllOperations,
    clearError,
    clearAllErrors,
    hasFailedOperations,
    getAllFailedOperations,
    getFailedOperationsByPriority,
    networkState: {
      isOnline,
      isSlowConnection,
      isUnstable,
      failureCount,
    },
  }), [
    failedOperations,
    addFailedOperation,
    retryOperation,
    retryAllOperations,
    clearError,
    clearAllErrors,
    hasFailedOperations,
    getAllFailedOperations,
    getFailedOperationsByPriority,
    isOnline,
    isSlowConnection,
    isUnstable,
    failureCount,
  ]);

  return (
    <ErrorRecoveryContext.Provider value={value}>
      {children}
    </ErrorRecoveryContext.Provider>
  );
}

/**
 * Hook to use the error recovery context
 */
export function useErrorRecovery(): ErrorRecoveryContextType {
  const context = useContext(ErrorRecoveryContext);
  if (context === null) {
    throw new Error("useErrorRecovery must be used within an ErrorRecoveryProvider");
  }
  return context;
}
