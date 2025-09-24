// ID generation utilities

/**
 * Generates a unique ID with an optional prefix
 * 
 * @param prefix - Optional prefix for the ID (default: "id")
 * @returns Unique ID string
 * 
 * @example
 * ```typescript
 * generateId() // "id-abc1234"
 * generateId("user") // "user-xyz5678"
 * generateId("comic") // "comic-def9012"
 * ```
 */
export function generateId(prefix: string = "id"): string {
  return `${prefix}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Generates a UUID v4
 * 
 * @returns UUID v4 string
 * 
 * @example
 * ```typescript
 * generateUUID() // "550e8400-e29b-41d4-a716-446655440000"
 * ```
 */
export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Generates a short random string
 * 
 * @param length - Length of the string (default: 8)
 * @returns Random string
 * 
 * @example
 * ```typescript
 * generateRandomString() // "aB3xY9mK"
 * generateRandomString(12) // "aB3xY9mKpQ7w"
 * ```
 */
export function generateRandomString(length: number = 8): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
