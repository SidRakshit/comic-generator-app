"use client";

import React, { createContext, useContext, useState, useCallback, useMemo, ReactNode } from "react";

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
  }>;
  /** Add a failed operation to the error recovery system */
  addFailedOperation: (operationId: string, error: Error, operation: () => Promise<void>) => void;
  /** Retry a specific failed operation */
  retryOperation: (operationId: string) => Promise<void>;
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
  }>;
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
  }>>(new Map());

  const addFailedOperation = useCallback((
    operationId: string,
    error: Error,
    operation: () => Promise<void>
  ) => {
    setFailedOperations(prev => {
      const newMap = new Map(prev);
      const existing = newMap.get(operationId);
      newMap.set(operationId, {
        error,
        timestamp: Date.now(),
        retryCount: (existing?.retryCount || 0) + 1,
        operation,
      });
      return newMap;
    });
  }, []);

  const retryOperation = useCallback(async (operationId: string) => {
    const operationData = failedOperations.get(operationId);
    if (!operationData) return;

    try {
      await operationData.operation();
      // If successful, clear the error
      clearError(operationId);
    } catch (error) {
      // If it fails again, update the error
      addFailedOperation(operationId, error as Error, operationData.operation);
    }
  }, [failedOperations, addFailedOperation]);

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
    }));
  }, [failedOperations]);

  const value = useMemo(() => ({
    failedOperations,
    addFailedOperation,
    retryOperation,
    clearError,
    clearAllErrors,
    hasFailedOperations,
    getAllFailedOperations,
  }), [
    failedOperations,
    addFailedOperation,
    retryOperation,
    clearError,
    clearAllErrors,
    hasFailedOperations,
    getAllFailedOperations,
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
