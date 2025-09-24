// Validation utility functions

import { z } from 'zod';

/**
 * Validates an email address format
 * 
 * @param email - Email string to validate
 * @returns True if valid email format
 * 
 * @example
 * ```typescript
 * isValidEmail("user@example.com") // true
 * isValidEmail("invalid-email") // false
 * ```
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validates a URL format
 * 
 * @param url - URL string to validate
 * @returns True if valid URL format
 * 
 * @example
 * ```typescript
 * isValidUrl("https://example.com") // true
 * isValidUrl("not-a-url") // false
 * ```
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validates a UUID format
 * 
 * @param uuid - UUID string to validate
 * @returns True if valid UUID format
 * 
 * @example
 * ```typescript
 * isValidUUID("550e8400-e29b-41d4-a716-446655440000") // true
 * isValidUUID("not-a-uuid") // false
 * ```
 */
export function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * Validates a phone number format (US format)
 * 
 * @param phone - Phone string to validate
 * @returns True if valid phone format
 * 
 * @example
 * ```typescript
 * isValidPhone("(555) 123-4567") // true
 * isValidPhone("555-123-4567") // true
 * isValidPhone("5551234567") // true
 * isValidPhone("invalid") // false
 * ```
 */
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^[\+]?[1]?[\s\-\.]?[\(]?[0-9]{3}[\)]?[\s\-\.]?[0-9]{3}[\s\-\.]?[0-9]{4}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
}

/**
 * Validates a password strength
 * 
 * @param password - Password string to validate
 * @param options - Password strength options
 * @returns Object with validation result and requirements
 * 
 * @example
 * ```typescript
 * const result = validatePasswordStrength("MyPassword123!", {
 *   minLength: 8,
 *   requireUppercase: true,
 *   requireLowercase: true,
 *   requireNumbers: true,
 *   requireSpecialChars: true
 * });
 * console.log(result.isValid); // true
 * console.log(result.requirements); // Array of unmet requirements
 * ```
 */
export function validatePasswordStrength(
  password: string,
  options: {
    minLength?: number;
    requireUppercase?: boolean;
    requireLowercase?: boolean;
    requireNumbers?: boolean;
    requireSpecialChars?: boolean;
  } = {}
): {
  isValid: boolean;
  requirements: string[];
  score: number;
} {
  const {
    minLength = 8,
    requireUppercase = true,
    requireLowercase = true,
    requireNumbers = true,
    requireSpecialChars = true
  } = options;

  const requirements: string[] = [];
  let score = 0;

  if (password.length < minLength) {
    requirements.push(`At least ${minLength} characters`);
  } else {
    score += 1;
  }

  if (requireUppercase && !/[A-Z]/.test(password)) {
    requirements.push('At least one uppercase letter');
  } else if (requireUppercase) {
    score += 1;
  }

  if (requireLowercase && !/[a-z]/.test(password)) {
    requirements.push('At least one lowercase letter');
  } else if (requireLowercase) {
    score += 1;
  }

  if (requireNumbers && !/\d/.test(password)) {
    requirements.push('At least one number');
  } else if (requireNumbers) {
    score += 1;
  }

  if (requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    requirements.push('At least one special character');
  } else if (requireSpecialChars) {
    score += 1;
  }

  return {
    isValid: requirements.length === 0,
    requirements,
    score
  };
}

/**
 * Safely parses JSON with error handling
 * 
 * @param jsonString - JSON string to parse
 * @param fallback - Fallback value if parsing fails
 * @returns Parsed object or fallback value
 * 
 * @example
 * ```typescript
 * const data = safeJsonParse('{"name": "John"}', {});
 * console.log(data); // { name: "John" }
 * 
 * const invalid = safeJsonParse('invalid json', null);
 * console.log(invalid); // null
 * ```
 */
export function safeJsonParse<T>(jsonString: string, fallback: T): T {
  try {
    return JSON.parse(jsonString);
  } catch {
    return fallback;
  }
}

/**
 * Validates data against a Zod schema with error handling
 * 
 * @param schema - Zod schema to validate against
 * @param data - Data to validate
 * @returns Object with validation result and parsed data or errors
 * 
 * @example
 * ```typescript
 * const userSchema = z.object({
 *   name: z.string(),
 *   email: z.string().email()
 * });
 * 
 * const result = validateWithZod(userSchema, { name: "John", email: "john@example.com" });
 * if (result.success) {
 *   console.log(result.data); // Validated data
 * } else {
 *   console.log(result.errors); // Validation errors
 * }
 * ```
 */
export function validateWithZod<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): {
  success: boolean;
  data?: T;
  errors?: z.ZodError;
} {
  try {
    const parsed = schema.parse(data);
    return { success: true, data: parsed };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, errors: error };
    }
    throw error;
  }
}
