import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines multiple class values into a single className string
 * Uses clsx for conditional classes and twMerge to handle Tailwind conflicts
 */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs)); 
}

/**
 * Generates a unique ID with an optional prefix
 */
export function generateId(prefix: string = "id"): string {
    return `${prefix}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Delays execution for a specified amount of time
 */
export function delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Formats a date string into a human-readable format
 */
export function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric"
    });
}

/**
 * Truncates a string to a maximum length, adding an ellipsis if needed
 */
export function truncateString(str: string, maxLength: number = 50): string {
    if (!str || str.length <= maxLength) return str;
    return `${str.substring(0, maxLength)}...`;
}

/**
 * Converts a file to a data URL
 */
export function fileToDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

/**
 * Debounces a function call
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
    func: T,
    wait: number
): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout | null = null;

    return function (...args: Parameters<T>) {
        if (timeout) clearTimeout(timeout);

        timeout = setTimeout(() => {
            func(...args);
        }, wait);
    };
}