// Date utility functions

/**
 * Formats a date string into a human-readable format
 * 
 * @param dateString - Date string to format
 * @param options - Intl.DateTimeFormatOptions for customization
 * @returns Formatted date string
 * 
 * @example
 * ```typescript
 * formatDate("2024-01-15T10:30:00Z") // "January 15, 2024"
 * formatDate("2024-01-15T10:30:00Z", { 
 *   year: "2-digit", 
 *   month: "short" 
 * }) // "Jan 24"
 * ```
 */
export function formatDate(
  dateString: string, 
  options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric"
  }
): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", options);
}

/**
 * Formats a date string into a relative time format (e.g., "2 hours ago")
 * 
 * @param dateString - Date string to format
 * @returns Relative time string
 * 
 * @example
 * ```typescript
 * formatRelativeTime("2024-01-15T10:30:00Z") // "2 hours ago"
 * formatRelativeTime("2024-01-10T10:30:00Z") // "5 days ago"
 * ```
 */
export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return "just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)} months ago`;
  return `${Math.floor(diffInSeconds / 31536000)} years ago`;
}

/**
 * Checks if a date string is valid
 * 
 * @param dateString - Date string to validate
 * @returns True if valid, false otherwise
 * 
 * @example
 * ```typescript
 * isValidDate("2024-01-15") // true
 * isValidDate("invalid-date") // false
 * ```
 */
export function isValidDate(dateString: string): boolean {
  const date = new Date(dateString);
  return !isNaN(date.getTime());
}

/**
 * Gets the start of day for a given date
 * 
 * @param date - Date object or date string
 * @returns Date object at start of day (00:00:00)
 * 
 * @example
 * ```typescript
 * getStartOfDay(new Date()) // Date at 00:00:00 today
 * getStartOfDay("2024-01-15") // Date at 00:00:00 on Jan 15, 2024
 * ```
 */
export function getStartOfDay(date: Date | string): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Gets the end of day for a given date
 * 
 * @param date - Date object or date string
 * @returns Date object at end of day (23:59:59.999)
 * 
 * @example
 * ```typescript
 * getEndOfDay(new Date()) // Date at 23:59:59.999 today
 * getEndOfDay("2024-01-15") // Date at 23:59:59.999 on Jan 15, 2024
 * ```
 */
export function getEndOfDay(date: Date | string): Date {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}
