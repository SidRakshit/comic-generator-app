"use client";

import { useState, useEffect } from "react";
import { getLocalStorageInfo, cleanupLocalStorage, getLargestEntries } from "@/lib/localStorage-utils";

export function useLocalStorageDebug() {
  const [info, setInfo] = useState(getLocalStorageInfo());
  const [largestEntries, setLargestEntries] = useState<Array<{ key: string; size: number }>>([]);

  const refresh = () => {
    setInfo(getLocalStorageInfo());
    setLargestEntries(getLargestEntries(10));
  };

  const cleanup = (options?: {
    maxAge?: number;
    appPrefixes?: string[];
  }) => {
    const result = cleanupLocalStorage({
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      appPrefixes: ['comic-draft', 'offline-operations', 'impersonation-token'],
      ...options,
    });
    
    refresh();
    return result;
  };

  const clearAll = () => {
    localStorage.clear();
    refresh();
  };

  useEffect(() => {
    refresh();
  }, []);

  return {
    info,
    largestEntries,
    refresh,
    cleanup,
    clearAll,
  };
}
