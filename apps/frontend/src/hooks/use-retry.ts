"use client";

import { useState, useCallback, useRef } from "react";

/**
 * Hook for retry logic with exponential backoff
 * Provides robust retry functionality for async operations
 */
interface UseRetryOptions {
  /** Maximum number of retry attempts (defaults to 3) */
  maxRetries?: number;
  /** Base delay in milliseconds (defaults to 1000) */
  baseDelay?: number;
  /** Maximum delay in milliseconds (defaults to 10000) */
  maxDelay?: number;
  /** Whether to enable jitter (random delay variation) (defaults to true) */
  enableJitter?: boolean;
  /** Custom retry condition function */
  shouldRetry?: (error: Error, attempt: number) => boolean;
}

interface UseRetryReturn {
  /** Execute an operation with retry logic */
  executeWithRetry: <T>(operation: () => Promise<T>, operationName?: string) => Promise<T>;
  /** Current retry attempt number */
  retryCount: number;
  /** Whether a retry is currently in progress */
  isRetrying: boolean;
  /** Whether the last operation failed and can be retried */
  canRetry: boolean;
  /** Last error that occurred */
  lastError: Error | null;
  /** Reset retry state */
  reset: () => void;
}

const DEFAULT_MAX_RETRIES = 3;
const DEFAULT_BASE_DELAY = 1000;
const DEFAULT_MAX_DELAY = 10000;

export function useRetry({
  maxRetries = DEFAULT_MAX_RETRIES,
  baseDelay = DEFAULT_BASE_DELAY,
  maxDelay = DEFAULT_MAX_DELAY,
  enableJitter = true,
  shouldRetry,
}: UseRetryOptions = {}): UseRetryReturn {
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const [lastError, setLastError] = useState<Error | null>(null);
  const [canRetry, setCanRetry] = useState(false);
  
  const operationRef = useRef<(() => Promise<any>) | null>(null);
  const operationNameRef = useRef<string>("operation");

  const executeWithRetry = useCallback(async <T>(
    operation: () => Promise<T>,
    operationName: string = "operation"
  ): Promise<T> => {
    operationRef.current = operation;
    operationNameRef.current = operationName;
    
    let lastAttemptError: Error | null = null;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        setIsRetrying(attempt > 0);
        setRetryCount(attempt);
        setLastError(null);
        setCanRetry(false);

        const result = await operation();
        
        // Success - reset state
        setRetryCount(0);
        setIsRetrying(false);
        setLastError(null);
        setCanRetry(false);
        operationRef.current = null;
        
        console.log(`${operationName} succeeded on attempt ${attempt + 1}`);
        return result;
      } catch (error) {
        lastAttemptError = error as Error;
        setLastError(lastAttemptError);
        
        // Check if we should retry this error
        if (shouldRetry && !shouldRetry(lastAttemptError, attempt)) {
          console.log(`${operationName} failed with non-retryable error:`, lastAttemptError.message);
          break;
        }
        
        // If this was the last attempt, don't retry
        if (attempt === maxRetries) {
          console.error(`${operationName} failed after ${maxRetries + 1} attempts:`, lastAttemptError);
          setCanRetry(true);
          break;
        }
        
        // Calculate delay with exponential backoff and optional jitter
        const exponentialDelay = baseDelay * Math.pow(2, attempt);
        const jitter = enableJitter ? Math.random() * 1000 : 0;
        const delay = Math.min(exponentialDelay + jitter, maxDelay);
        
        console.warn(
          `${operationName} failed (attempt ${attempt + 1}/${maxRetries + 1}), retrying in ${Math.round(delay)}ms:`,
          lastAttemptError.message
        );
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    // All retries exhausted
    setIsRetrying(false);
    setCanRetry(true);
    throw lastAttemptError;
  }, [maxRetries, baseDelay, maxDelay, enableJitter, shouldRetry]);

  const reset = useCallback(() => {
    setRetryCount(0);
    setIsRetrying(false);
    setLastError(null);
    setCanRetry(false);
    operationRef.current = null;
  }, []);

  return {
    executeWithRetry,
    retryCount,
    isRetrying,
    canRetry,
    lastError,
    reset,
  };
}

/**
 * Simplified version for basic usage
 * 
 * @param maxRetries - Maximum number of retry attempts (optional)
 */
export function useRetrySimple(maxRetries?: number) {
  return useRetry({ maxRetries });
}

/**
 * Hook for retrying a specific operation
 * 
 * @param operation - The operation to retry
 * @param options - Retry options
 */
export function useRetryOperation<T>(
  operation: () => Promise<T>,
  options: UseRetryOptions & { operationName?: string } = {}
) {
  const { executeWithRetry, ...retryState } = useRetry(options);
  const { operationName = "operation" } = options;

  const execute = useCallback(() => {
    return executeWithRetry(operation, operationName);
  }, [executeWithRetry, operation, operationName]);

  return {
    execute,
    ...retryState,
  };
}
