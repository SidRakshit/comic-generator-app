"use client";

import { useCallback } from "react";
import { useRetry } from "./use-retry";
import { useNetworkState } from "./use-network-state";

/**
 * Different types of operations that may need retry logic
 */
export type OperationType = 
  | "save"           // Saving comic data
  | "load"           // Loading comic data
  | "image-generation" // Generating images
  | "upload"         // File uploads
  | "auth"           // Authentication operations
  | "api"            // General API calls
  | "network";       // Network-dependent operations

/**
 * Retry strategy configuration for different operation types
 */
interface RetryStrategy {
  /** Maximum number of retries */
  maxRetries: number;
  /** Base delay in milliseconds */
  baseDelay: number;
  /** Maximum delay in milliseconds */
  maxDelay: number;
  /** Whether to enable jitter (random delay variation) */
  enableJitter: boolean;
  /** Whether to use exponential backoff */
  useExponentialBackoff: boolean;
  /** Whether to retry on network errors */
  retryOnNetworkError: boolean;
  /** Whether to retry on server errors (5xx) */
  retryOnServerError: boolean;
  /** Whether to retry on client errors (4xx) */
  retryOnClientError: boolean;
  /** Custom retry condition function */
  shouldRetry?: (error: Error, attempt: number, operationType: OperationType) => boolean;
}

/**
 * Default retry strategies for different operation types
 */
const DEFAULT_STRATEGIES: Record<OperationType, RetryStrategy> = {
  save: {
    maxRetries: 3,
    baseDelay: 1000,
    maxDelay: 10000,
    enableJitter: true,
    useExponentialBackoff: true,
    retryOnNetworkError: true,
    retryOnServerError: true,
    retryOnClientError: false,
  },
  load: {
    maxRetries: 5,
    baseDelay: 500,
    maxDelay: 8000,
    enableJitter: true,
    useExponentialBackoff: true,
    retryOnNetworkError: true,
    retryOnServerError: true,
    retryOnClientError: false,
  },
  "image-generation": {
    maxRetries: 2,
    baseDelay: 2000,
    maxDelay: 15000,
    enableJitter: true,
    useExponentialBackoff: true,
    retryOnNetworkError: true,
    retryOnServerError: true,
    retryOnClientError: false,
  },
  upload: {
    maxRetries: 3,
    baseDelay: 1500,
    maxDelay: 12000,
    enableJitter: true,
    useExponentialBackoff: true,
    retryOnNetworkError: true,
    retryOnServerError: true,
    retryOnClientError: false,
  },
  auth: {
    maxRetries: 2,
    baseDelay: 1000,
    maxDelay: 5000,
    enableJitter: false,
    useExponentialBackoff: false,
    retryOnNetworkError: true,
    retryOnServerError: true,
    retryOnClientError: false,
  },
  api: {
    maxRetries: 3,
    baseDelay: 1000,
    maxDelay: 10000,
    enableJitter: true,
    useExponentialBackoff: true,
    retryOnNetworkError: true,
    retryOnServerError: true,
    retryOnClientError: false,
  },
  network: {
    maxRetries: 5,
    baseDelay: 500,
    maxDelay: 5000,
    enableJitter: true,
    useExponentialBackoff: true,
    retryOnNetworkError: true,
    retryOnServerError: true,
    retryOnClientError: false,
  },
};

/**
 * Hook for managing retry strategies based on operation type and network state
 */
interface UseRetryStrategiesOptions {
  /** Custom retry strategies to override defaults */
  customStrategies?: Partial<Record<OperationType, Partial<RetryStrategy>>>;
  /** Whether to adapt retry behavior based on network state */
  adaptToNetworkState?: boolean;
}

interface UseRetryStrategiesReturn {
  /** Execute an operation with the appropriate retry strategy */
  executeWithRetry: <T>(
    operation: () => Promise<T>,
    operationType: OperationType,
    operationName?: string
  ) => Promise<T>;
  /** Get the retry strategy for a specific operation type */
  getStrategy: (operationType: OperationType) => RetryStrategy;
  /** Check if an error should be retried based on the operation type */
  shouldRetryError: (error: Error, operationType: OperationType, attempt: number) => boolean;
}

export function useRetryStrategies({
  customStrategies = {},
  adaptToNetworkState = true,
}: UseRetryStrategiesOptions = {}): UseRetryStrategiesReturn {
  const { isOnline, isSlowConnection, isUnstable } = useNetworkState();

  // Merge custom strategies with defaults
  const strategies: Record<OperationType, RetryStrategy> = Object.keys(DEFAULT_STRATEGIES).reduce(
    (acc, key) => {
      const operationType = key as OperationType;
      const defaultStrategy = DEFAULT_STRATEGIES[operationType];
      const customStrategy = customStrategies[operationType] || {};
      
      acc[operationType] = {
        ...defaultStrategy,
        ...customStrategy,
        shouldRetry: customStrategy.shouldRetry || defaultStrategy.shouldRetry,
      };
      
      return acc;
    },
    {} as Record<OperationType, RetryStrategy>
  );

  // Adapt strategies based on network state
  const getAdaptedStrategy = useCallback((operationType: OperationType): RetryStrategy => {
    const strategy = strategies[operationType];
    
    if (!adaptToNetworkState) {
      return strategy;
    }

    let adaptedStrategy = { ...strategy };

    // If offline, don't retry
    if (!isOnline) {
      adaptedStrategy.maxRetries = 0;
      return adaptedStrategy;
    }

    // If slow connection, reduce retries but increase delays
    if (isSlowConnection) {
      adaptedStrategy.maxRetries = Math.max(1, Math.floor(strategy.maxRetries * 0.7));
      adaptedStrategy.baseDelay = Math.min(strategy.maxDelay, strategy.baseDelay * 1.5);
    }

    // If unstable connection, reduce retries and increase delays
    if (isUnstable) {
      adaptedStrategy.maxRetries = Math.max(1, Math.floor(strategy.maxRetries * 0.5));
      adaptedStrategy.baseDelay = Math.min(strategy.maxDelay, strategy.baseDelay * 2);
    }

    return adaptedStrategy;
  }, [strategies, adaptToNetworkState, isOnline, isSlowConnection, isUnstable]);

  const shouldRetryError = useCallback((
    error: Error,
    operationType: OperationType,
    attempt: number
  ): boolean => {
    const strategy = getAdaptedStrategy(operationType);
    
    // Check if we've exceeded max retries
    if (attempt >= strategy.maxRetries) {
      return false;
    }

    // Check custom retry condition
    if (strategy.shouldRetry) {
      return strategy.shouldRetry(error, attempt, operationType);
    }

    // Check error type
    const errorMessage = error.message.toLowerCase();
    
    // Network errors
    if (strategy.retryOnNetworkError && (
      errorMessage.includes("network") ||
      errorMessage.includes("fetch") ||
      errorMessage.includes("timeout") ||
      errorMessage.includes("connection")
    )) {
      return true;
    }

    // Server errors (5xx)
    if (strategy.retryOnServerError && (
      errorMessage.includes("500") ||
      errorMessage.includes("502") ||
      errorMessage.includes("503") ||
      errorMessage.includes("504") ||
      errorMessage.includes("server error")
    )) {
      return true;
    }

    // Client errors (4xx) - usually don't retry
    if (strategy.retryOnClientError && (
      errorMessage.includes("400") ||
      errorMessage.includes("401") ||
      errorMessage.includes("403") ||
      errorMessage.includes("404")
    )) {
      return true;
    }

    return false;
  }, [getAdaptedStrategy]);

  const executeWithRetry = useCallback(async <T>(
    operation: () => Promise<T>,
    operationType: OperationType,
    operationName?: string
  ): Promise<T> => {
    const strategy = getAdaptedStrategy(operationType);
    
    // Use the base retry hook with the adapted strategy
    const { executeWithRetry: baseExecuteWithRetry } = useRetry({
      maxRetries: strategy.maxRetries,
      baseDelay: strategy.baseDelay,
      maxDelay: strategy.maxDelay,
      enableJitter: strategy.enableJitter,
      shouldRetry: (error, attempt) => shouldRetryError(error, operationType, attempt),
    });

    return baseExecuteWithRetry(operation, operationName || operationType);
  }, [getAdaptedStrategy, shouldRetryError]);

  const getStrategy = useCallback((operationType: OperationType): RetryStrategy => {
    return getAdaptedStrategy(operationType);
  }, [getAdaptedStrategy]);

  return {
    executeWithRetry,
    getStrategy,
    shouldRetryError,
  };
}

/**
 * Simplified version for basic usage
 */
export function useRetryStrategiesSimple() {
  return useRetryStrategies();
}
