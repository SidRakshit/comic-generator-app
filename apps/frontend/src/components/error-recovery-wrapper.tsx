"use client";

import React, { useState } from "react";
import { ErrorRecoveryBanner } from "@repo/ui/error-recovery-banner";
import { useErrorRecovery } from "@/context/error-recovery-context";

/**
 * Client-side wrapper for the error recovery banner
 * This allows us to use hooks in the layout
 */
export function ErrorRecoveryWrapper() {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const {
    hasFailedOperations,
    getAllFailedOperations,
    retryOperation,
    retryAllOperations,
    clearError,
    clearAllErrors,
    networkState,
  } = useErrorRecovery();

  return (
    <ErrorRecoveryBanner
      hasFailedOperations={hasFailedOperations}
      failedOperations={getAllFailedOperations()}
      onRetryOperation={retryOperation}
      onRetryAllOperations={retryAllOperations}
      onClearError={clearError}
      onClearAllErrors={clearAllErrors}
      isExpanded={isExpanded}
      onExpansionChange={setIsExpanded}
      networkState={networkState}
      className="mb-4"
    />
  );
}
