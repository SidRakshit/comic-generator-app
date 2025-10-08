/**
 * Utility functions for managing localStorage quota and cleanup
 */

export interface LocalStorageInfo {
  totalSize: number;
  keyCount: number;
  availableSpace: number;
  usagePercentage: number;
}

/**
 * Get information about localStorage usage
 */
export function getLocalStorageInfo(): LocalStorageInfo {
  if (typeof window === "undefined") {
    return {
      totalSize: 0,
      keyCount: 0,
      availableSpace: 0,
      usagePercentage: 0,
    };
  }

  let totalSize = 0;
  let keyCount = 0;

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key) {
      const value = localStorage.getItem(key);
      if (value) {
        totalSize += key.length + value.length;
        keyCount++;
      }
    }
  }

  // Estimate available space (most browsers have 5-10MB limit)
  const estimatedLimit = 5 * 1024 * 1024; // 5MB
  const availableSpace = Math.max(0, estimatedLimit - totalSize);
  const usagePercentage = (totalSize / estimatedLimit) * 100;

  return {
    totalSize,
    keyCount,
    availableSpace,
    usagePercentage,
  };
}

/**
 * Clean up old localStorage data to free up space
 */
export function cleanupLocalStorage(options: {
  maxAge?: number; // Age in milliseconds
  appPrefixes?: string[]; // Keys to clean up
  dryRun?: boolean; // If true, don't actually remove items
} = {}): {
  removedKeys: string[];
  freedSpace: number;
} {
  const {
    maxAge = 7 * 24 * 60 * 60 * 1000, // 7 days
    appPrefixes = ['comic-draft', 'offline-operations', 'impersonation-token'],
    dryRun = false,
  } = options;

  if (typeof window === "undefined") {
    return { removedKeys: [], freedSpace: 0 };
  }

  const now = Date.now();
  const removedKeys: string[] = [];
  let freedSpace = 0;

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key) continue;

    // Check if this key should be cleaned up
    const shouldCleanup = appPrefixes.some(prefix => key.startsWith(prefix)) ||
                         key.includes('comic') ||
                         key.includes('draft');

    if (!shouldCleanup) continue;

    try {
      const value = localStorage.getItem(key);
      if (!value) continue;

      // Try to parse as JSON to check timestamp
      let shouldRemove = false;
      try {
        const parsed = JSON.parse(value);
        if (parsed.timestamp && now - parsed.timestamp > maxAge) {
          shouldRemove = true;
        }
      } catch {
        // If not JSON or no timestamp, remove if it's an app key
        shouldRemove = true;
      }

      if (shouldRemove) {
        if (!dryRun) {
          localStorage.removeItem(key);
        }
        removedKeys.push(key);
        freedSpace += key.length + value.length;
      }
    } catch (error) {
      console.warn(`Failed to process localStorage key ${key}:`, error);
    }
  }

  return { removedKeys, freedSpace };
}

/**
 * Check if localStorage has enough space for new data
 */
export function hasEnoughSpace(requiredSize: number): boolean {
  const info = getLocalStorageInfo();
  return info.availableSpace > requiredSize;
}

/**
 * Get the largest localStorage entries
 */
export function getLargestEntries(limit: number = 10): Array<{ key: string; size: number }> {
  if (typeof window === "undefined") {
    return [];
  }

  const entries: Array<{ key: string; size: number }> = [];

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key) {
      const value = localStorage.getItem(key);
      if (value) {
        entries.push({
          key,
          size: key.length + value.length,
        });
      }
    }
  }

  return entries
    .sort((a, b) => b.size - a.size)
    .slice(0, limit);
}
