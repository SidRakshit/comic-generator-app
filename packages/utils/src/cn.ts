// ClassName utility functions

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines multiple class values into a single className string
 * Uses clsx for conditional classes and twMerge to handle Tailwind conflicts
 * 
 * @param inputs - Class values to combine
 * @returns Combined className string
 * 
 * @example
 * ```typescript
 * cn('px-2 py-1', 'px-4') // 'px-4 py-1' (Tailwind conflicts resolved)
 * cn('text-red-500', { 'text-blue-500': isBlue }) // Conditional classes
 * ```
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}