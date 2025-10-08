"use client";

import { useState, useEffect } from "react";
import { getLocalStorageInfo, cleanupLocalStorage, getLargestEntries } from "@/lib/localStorage-utils";

interface LocalStorageDebugProps {
  onClose?: () => void;
}

export function LocalStorageDebug({ onClose }: LocalStorageDebugProps) {
  const [info, setInfo] = useState(getLocalStorageInfo());
  const [largestEntries, setLargestEntries] = useState<Array<{ key: string; size: number }>>([]);

  useEffect(() => {
    setInfo(getLocalStorageInfo());
    setLargestEntries(getLargestEntries(10));
  }, []);

  const handleCleanup = () => {
    const result = cleanupLocalStorage({
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      appPrefixes: ['comic-draft', 'offline-operations', 'impersonation-token'],
    });
    
    console.log(`Cleanup result:`, result);
    
    // Refresh info
    setInfo(getLocalStorageInfo());
    setLargestEntries(getLargestEntries(10));
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">LocalStorage Debug</h2>
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          )}
        </div>

        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded">
            <h3 className="font-semibold mb-2">Storage Info</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Total Size:</span> {formatBytes(info.totalSize)}
              </div>
              <div>
                <span className="font-medium">Key Count:</span> {info.keyCount}
              </div>
              <div>
                <span className="font-medium">Available Space:</span> {formatBytes(info.availableSpace)}
              </div>
              <div>
                <span className="font-medium">Usage:</span> {info.usagePercentage.toFixed(1)}%
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded">
            <h3 className="font-semibold mb-2">Largest Entries</h3>
            <div className="space-y-2 text-sm">
              {largestEntries.map((entry, index) => (
                <div key={index} className="flex justify-between">
                  <span className="truncate max-w-xs" title={entry.key}>
                    {entry.key}
                  </span>
                  <span className="font-mono">{formatBytes(entry.size)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleCleanup}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Cleanup Old Data
            </button>
            <button
              onClick={() => {
                localStorage.clear();
                setInfo(getLocalStorageInfo());
                setLargestEntries(getLargestEntries(10));
              }}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Clear All
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
