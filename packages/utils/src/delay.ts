// Delay and timing utility functions

/**
 * Delays execution for a specified amount of time
 * 
 * @param ms - Delay in milliseconds
 * @returns Promise that resolves after the delay
 * 
 * @example
 * ```typescript
 * // Wait for 1 second
 * await delay(1000);
 * console.log('This runs after 1 second');
 * 
 * // Use in async function
 * async function example() {
 *   console.log('Start');
 *   await delay(500);
 *   console.log('After 500ms');
 * }
 * ```
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Creates a promise that resolves after a delay with a value
 * 
 * @param ms - Delay in milliseconds
 * @param value - Value to resolve with
 * @returns Promise that resolves with the value after delay
 * 
 * @example
 * ```typescript
 * const result = await delayWithValue(1000, 'Hello');
 * console.log(result); // 'Hello' (after 1 second)
 * ```
 */
export function delayWithValue<T>(ms: number, value: T): Promise<T> {
  return new Promise(resolve => setTimeout(() => resolve(value), ms));
}

/**
 * Creates a promise that rejects after a delay with an error
 * 
 * @param ms - Delay in milliseconds
 * @param error - Error to reject with
 * @returns Promise that rejects with the error after delay
 * 
 * @example
 * ```typescript
 * try {
 *   await delayWithError(1000, new Error('Timeout'));
 * } catch (error) {
 *   console.log(error.message); // 'Timeout' (after 1 second)
 * }
 * ```
 */
export function delayWithError(ms: number, error: Error): Promise<never> {
  return new Promise((_, reject) => setTimeout(() => reject(error), ms));
}

/**
 * Creates a timeout promise that rejects if not resolved within time
 * 
 * @param promise - Promise to wrap with timeout
 * @param ms - Timeout in milliseconds
 * @param errorMessage - Error message for timeout
 * @returns Promise that resolves with original value or rejects on timeout
 * 
 * @example
 * ```typescript
 * const apiCall = fetch('/api/data');
 * const result = await withTimeout(apiCall, 5000, 'API call timed out');
 * ```
 */
export function withTimeout<T>(
  promise: Promise<T>,
  ms: number,
  errorMessage: string = 'Operation timed out'
): Promise<T> {
  const timeoutPromise = delayWithError(ms, new Error(errorMessage));
  return Promise.race([promise, timeoutPromise]);
}

/**
 * Retries a function with exponential backoff
 * 
 * @param fn - Function to retry
 * @param maxRetries - Maximum number of retries
 * @param baseDelay - Base delay in milliseconds
 * @returns Promise that resolves with function result
 * 
 * @example
 * ```typescript
 * const result = await retryWithBackoff(
 *   () => fetch('/api/data'),
 *   3, // max 3 retries
 *   1000 // start with 1 second delay
 * );
 * ```
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error | undefined;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt === maxRetries) {
        throw lastError;
      }
      
      // Exponential backoff: delay = baseDelay * 2^attempt
      const delayMs = baseDelay * Math.pow(2, attempt);
      await delay(delayMs);
    }
  }
  
  throw lastError ?? new Error('Retry failed without capturing an error');
}
