// String utility functions

/**
 * Truncates a string to a maximum length, adding an ellipsis if needed
 * 
 * @param str - String to truncate
 * @param maxLength - Maximum length (default: 50)
 * @returns Truncated string with ellipsis if needed
 * 
 * @example
 * ```typescript
 * truncateString("Hello world", 5) // "Hello..."
 * truncateString("Short", 10) // "Short"
 * truncateString("This is a very long string", 20) // "This is a very long..."
 * ```
 */
export function truncateString(str: string, maxLength: number = 50): string {
  if (!str || str.length <= maxLength) return str;
  return `${str.substring(0, maxLength)}...`;
}

/**
 * Capitalizes the first letter of a string
 * 
 * @param str - String to capitalize
 * @returns String with first letter capitalized
 * 
 * @example
 * ```typescript
 * capitalize("hello world") // "Hello world"
 * capitalize("HELLO") // "HELLO"
 * capitalize("") // ""
 * ```
 */
export function capitalize(str: string): string {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Converts a string to title case
 * 
 * @param str - String to convert
 * @returns String in title case
 * 
 * @example
 * ```typescript
 * toTitleCase("hello world") // "Hello World"
 * toTitleCase("HELLO WORLD") // "Hello World"
 * toTitleCase("hello-world") // "Hello-world"
 * ```
 */
export function toTitleCase(str: string): string {
  return str.replace(/\w\S*/g, (txt) => 
    txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  );
}

/**
 * Converts a string to kebab-case
 * 
 * @param str - String to convert
 * @returns String in kebab-case
 * 
 * @example
 * ```typescript
 * toKebabCase("Hello World") // "hello-world"
 * toKebabCase("helloWorld") // "hello-world"
 * toKebabCase("HELLO_WORLD") // "hello-world"
 * ```
 */
export function toKebabCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase();
}

/**
 * Converts a string to camelCase
 * 
 * @param str - String to convert
 * @returns String in camelCase
 * 
 * @example
 * ```typescript
 * toCamelCase("hello world") // "helloWorld"
 * toCamelCase("hello-world") // "helloWorld"
 * toCamelCase("HELLO_WORLD") // "helloWorld"
 * ```
 */
export function toCamelCase(str: string): string {
  return str
    .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
      return index === 0 ? word.toLowerCase() : word.toUpperCase();
    })
    .replace(/\s+/g, '');
}

/**
 * Removes extra whitespace and normalizes spaces
 * 
 * @param str - String to normalize
 * @returns Normalized string
 * 
 * @example
 * ```typescript
 * normalizeWhitespace("  hello   world  ") // "hello world"
 * normalizeWhitespace("hello\n\nworld") // "hello world"
 * ```
 */
export function normalizeWhitespace(str: string): string {
  return str.replace(/\s+/g, ' ').trim();
}

/**
 * Checks if a string is empty or contains only whitespace
 * 
 * @param str - String to check
 * @returns True if empty or whitespace only
 * 
 * @example
 * ```typescript
 * isEmpty("") // true
 * isEmpty("   ") // true
 * isEmpty("hello") // false
 * ```
 */
export function isEmpty(str: string): boolean {
  return !str || str.trim().length === 0;
}

/**
 * Generates a slug from a string
 * 
 * @param str - String to slugify
 * @returns URL-friendly slug
 * 
 * @example
 * ```typescript
 * slugify("Hello World!") // "hello-world"
 * slugify("My Awesome Post") // "my-awesome-post"
 * ```
 */
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
