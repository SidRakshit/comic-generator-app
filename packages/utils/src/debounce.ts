// Debounce and throttle utility functions

/**
 * Debounces a function call, ensuring it's only called after a delay
 * 
 * @param func - Function to debounce
 * @param wait - Delay in milliseconds
 * @returns Debounced function
 * 
 * @example
 * ```typescript
 * const debouncedSearch = debounce((query: string) => {
 *   console.log('Searching for:', query);
 * }, 300);
 * 
 * // Only the last call will execute after 300ms
 * debouncedSearch('a');
 * debouncedSearch('ab');
 * debouncedSearch('abc'); // Only this will execute
 * ```
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return function (...args: Parameters<T>) {
    if (timeout) clearTimeout(timeout);

    timeout = setTimeout(() => {
      func(...args);
    }, wait);
  };
}

/**
 * Throttles a function call, ensuring it's called at most once per interval
 * 
 * @param func - Function to throttle
 * @param limit - Time interval in milliseconds
 * @returns Throttled function
 * 
 * @example
 * ```typescript
 * const throttledScroll = throttle((event: Event) => {
 *   console.log('Scroll event');
 * }, 100);
 * 
 * // Will be called at most once every 100ms
 * window.addEventListener('scroll', throttledScroll);
 * ```
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return function (...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Creates a debounced function that can be cancelled
 * 
 * @param func - Function to debounce
 * @param wait - Delay in milliseconds
 * @returns Object with debounced function and cancel method
 * 
 * @example
 * ```typescript
 * const { debounced, cancel } = createCancellableDebounce(
 *   (value: string) => console.log(value),
 *   300
 * );
 * 
 * debounced('hello');
 * cancel(); // Cancels the pending call
 * ```
 */
export function createCancellableDebounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): {
  debounced: (...args: Parameters<T>) => void;
  cancel: () => void;
} {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  const debounced = (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };

  const cancel = () => {
    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
    }
  };

  return { debounced, cancel };
}
