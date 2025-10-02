"use client";

import React, { useState } from "react";
import { Button } from "./button";
import { AlertCircle, RefreshCw, X, ChevronDown, ChevronUp } from "lucide-react";

/**
 * Props for the ErrorRecoveryBanner component
 */
interface ErrorRecoveryBannerProps {
  /** Whether there are failed operations */
  hasFailedOperations: boolean;
  /** Array of failed operations */
  failedOperations: Array<{
    operationId: string;
    error: Error;
    timestamp: number;
    retryCount: number;
  }>;
  /** Function to retry a specific operation */
  onRetryOperation: (operationId: string) => Promise<void>;
  /** Function to clear a specific error */
  onClearError: (operationId: string) => void;
  /** Function to clear all errors */
  onClearAllErrors: () => void;
  /** Whether the banner is expanded to show details */
  isExpanded?: boolean;
  /** Callback when expansion state changes */
  onExpansionChange?: (expanded: boolean) => void;
  /** Custom className for styling */
  className?: string;
}

/**
 * Banner component for displaying and managing failed operations
 * Shows a summary of errors and allows retry/clear actions
 */
export function ErrorRecoveryBanner({
  hasFailedOperations,
  failedOperations,
  onRetryOperation,
  onClearError,
  onClearAllErrors,
  isExpanded = false,
  onExpansionChange,
  className = "",
}: ErrorRecoveryBannerProps) {
  const [isRetrying, setIsRetrying] = useState<string | null>(null);

  if (!hasFailedOperations || failedOperations.length === 0) {
    return null;
  }

  const handleRetry = async (operationId: string) => {
    setIsRetrying(operationId);
    try {
      await onRetryOperation(operationId);
    } finally {
      setIsRetrying(null);
    }
  };

  const handleRetryAll = async () => {
    for (const operation of failedOperations) {
      await handleRetry(operation.operationId);
    }
  };

  const formatTimeAgo = (timestamp: number): string => {
    const now = Date.now();
    const diffInMinutes = Math.floor((now - timestamp) / (1000 * 60));
    
    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  const toggleExpansion = () => {
    onExpansionChange?.(!isExpanded);
  };

  return (
    <div className={`bg-red-50 border border-red-200 rounded-lg p-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
          <div>
            <h3 className="text-sm font-medium text-red-800">
              {failedOperations.length} operation{failedOperations.length === 1 ? "" : "s"} failed
            </h3>
            <p className="text-sm text-red-600">
              Some operations couldn't complete. You can retry them or clear the errors.
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRetryAll}
            disabled={isRetrying !== null}
            className="text-red-700 border-red-300 hover:bg-red-100"
          >
            <RefreshCw className={`h-4 w-4 mr-1 ${isRetrying ? "animate-spin" : ""}`} />
            Retry All
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={onClearAllErrors}
            className="text-red-700 border-red-300 hover:bg-red-100"
          >
            <X className="h-4 w-4 mr-1" />
            Clear All
          </Button>
          
          {failedOperations.length > 1 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleExpansion}
              className="text-red-700 hover:bg-red-100"
            >
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Expanded Details */}
      {isExpanded && failedOperations.length > 0 && (
        <div className="mt-4 space-y-3">
          {failedOperations.map((operation) => (
            <div
              key={operation.operationId}
              className="flex items-center justify-between bg-white rounded-md p-3 border border-red-200"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-900 truncate">
                    {operation.operationId}
                  </span>
                  <span className="text-xs text-gray-500 ml-2">
                    {formatTimeAgo(operation.timestamp)}
                  </span>
                </div>
                <p className="text-sm text-red-600 truncate">
                  {operation.error.message}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-gray-500">
                    Retry {operation.retryCount}/3
                  </span>
                </div>
              </div>
              
              <div className="flex items-center gap-2 ml-4">
                <Button
                  size="sm"
                  onClick={() => handleRetry(operation.operationId)}
                  disabled={isRetrying === operation.operationId}
                  className="text-red-700 border-red-300 hover:bg-red-100"
                >
                  <RefreshCw className={`h-3 w-3 mr-1 ${
                    isRetrying === operation.operationId ? "animate-spin" : ""
                  }`} />
                  Retry
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onClearError(operation.operationId)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Simplified version for basic usage
 */
export function ErrorRecoveryBannerSimple({
  hasFailedOperations,
  failedOperations,
  onRetryOperation,
  onClearError,
  onClearAllErrors,
}: Pick<ErrorRecoveryBannerProps, 
  "hasFailedOperations" | "failedOperations" | "onRetryOperation" | "onClearError" | "onClearAllErrors"
>) {
  return (
    <ErrorRecoveryBanner
      hasFailedOperations={hasFailedOperations}
      failedOperations={failedOperations}
      onRetryOperation={onRetryOperation}
      onClearError={onClearError}
      onClearAllErrors={onClearAllErrors}
    />
  );
}
