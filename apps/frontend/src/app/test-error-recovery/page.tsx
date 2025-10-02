"use client";

import React, { useState } from "react";
import { Button } from "@repo/ui/button";
import { Card } from "@repo/ui/card";
import { useErrorRecovery } from "@/context/error-recovery-context";
import { useNetworkState } from "@/hooks/use-network-state";

/**
 * Test page for demonstrating error recovery functionality
 * This page allows testing different error scenarios and recovery mechanisms
 */
export default function TestErrorRecoveryPage() {
  const [isLoading, setIsLoading] = useState(false);
  const { addFailedOperation, hasFailedOperations, getAllFailedOperations } = useErrorRecovery();
  const { isOnline, isSlowConnection, isUnstable, failureCount, checkNetwork } = useNetworkState();

  const simulateNetworkError = async () => {
    setIsLoading(true);
    try {
      // Simulate a network request that will fail
      await fetch("https://httpstat.us/500", { method: "GET" });
    } catch (error) {
      addFailedOperation(
        "test-network-error",
        error as Error,
        async () => {
          // Simulate retry logic
          await new Promise(resolve => setTimeout(resolve, 1000));
          throw new Error("Network error simulation");
        },
        "network",
        "high"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const simulateServerError = async () => {
    setIsLoading(true);
    try {
      // Simulate a server error
      await fetch("https://httpstat.us/503", { method: "GET" });
    } catch (error) {
      addFailedOperation(
        "test-server-error",
        error as Error,
        async () => {
          // Simulate retry logic
          await new Promise(resolve => setTimeout(resolve, 1000));
          throw new Error("Server error simulation");
        },
        "api",
        "medium"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const simulateImageGenerationError = async () => {
    setIsLoading(true);
    try {
      // Simulate an image generation error
      await fetch("https://httpstat.us/429", { method: "GET" });
    } catch (error) {
      addFailedOperation(
        "test-image-generation-error",
        error as Error,
        async () => {
          // Simulate retry logic
          await new Promise(resolve => setTimeout(resolve, 2000));
          throw new Error("Image generation error simulation");
        },
        "image-generation",
        "low"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const simulateSaveError = async () => {
    setIsLoading(true);
    try {
      // Simulate a save error
      await fetch("https://httpstat.us/400", { method: "GET" });
    } catch (error) {
      addFailedOperation(
        "test-save-error",
        error as Error,
        async () => {
          // Simulate retry logic
          await new Promise(resolve => setTimeout(resolve, 1000));
          throw new Error("Save error simulation");
        },
        "save",
        "high"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const clearAllErrors = () => {
    // This would be called from the error recovery context
    window.location.reload();
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Error Recovery Test Page
        </h1>
        <p className="text-gray-600">
          Test different error scenarios and recovery mechanisms
        </p>
      </div>

      {/* Network State Display */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Network State</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className={`text-2xl font-bold ${isOnline ? "text-green-600" : "text-red-600"}`}>
              {isOnline ? "🟢" : "🔴"}
            </div>
            <div className="text-sm text-gray-600">Online Status</div>
          </div>
          <div className="text-center">
            <div className={`text-2xl font-bold ${isSlowConnection ? "text-yellow-600" : "text-green-600"}`}>
              {isSlowConnection ? "🐌" : "⚡"}
            </div>
            <div className="text-sm text-gray-600">Connection Speed</div>
          </div>
          <div className="text-center">
            <div className={`text-2xl font-bold ${isUnstable ? "text-red-600" : "text-green-600"}`}>
              {isUnstable ? "📡" : "📶"}
            </div>
            <div className="text-sm text-gray-600">Stability</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-600">
              {failureCount}
            </div>
            <div className="text-sm text-gray-600">Failures</div>
          </div>
        </div>
        <div className="mt-4">
          <Button onClick={checkNetwork} variant="outline" size="sm">
            Check Network
          </Button>
        </div>
      </Card>

      {/* Error Simulation Buttons */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Simulate Errors</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button
            onClick={simulateNetworkError}
            disabled={isLoading}
            className="bg-red-600 hover:bg-red-700"
          >
            {isLoading ? "Loading..." : "Simulate Network Error"}
          </Button>
          <Button
            onClick={simulateServerError}
            disabled={isLoading}
            className="bg-orange-600 hover:bg-orange-700"
          >
            {isLoading ? "Loading..." : "Simulate Server Error"}
          </Button>
          <Button
            onClick={simulateImageGenerationError}
            disabled={isLoading}
            className="bg-yellow-600 hover:bg-yellow-700"
          >
            {isLoading ? "Loading..." : "Simulate Image Generation Error"}
          </Button>
          <Button
            onClick={simulateSaveError}
            disabled={isLoading}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {isLoading ? "Loading..." : "Simulate Save Error"}
          </Button>
        </div>
      </Card>

      {/* Error Status */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Error Status</h2>
        {hasFailedOperations ? (
          <div className="space-y-4">
            <div className="text-red-600 font-medium">
              {getAllFailedOperations().length} failed operations
            </div>
            <div className="space-y-2">
              {getAllFailedOperations().map((operation) => (
                <div key={operation.operationId} className="bg-red-50 p-3 rounded border border-red-200">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium text-red-800">{operation.operationId}</div>
                      <div className="text-sm text-red-600">{operation.error.message}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        Type: {operation.operationType} | Priority: {operation.priority} | 
                        Retries: {operation.retryCount}/3
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <Button onClick={clearAllErrors} variant="outline" className="w-full">
              Clear All Errors (Refresh Page)
            </Button>
          </div>
        ) : (
          <div className="text-green-600 font-medium">
            No failed operations
          </div>
        )}
      </Card>

      {/* Instructions */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">How to Test</h2>
        <div className="space-y-2 text-sm text-gray-600">
          <p>1. Click any "Simulate Error" button to create a failed operation</p>
          <p>2. The error will appear in the error recovery banner at the top of the page</p>
          <p>3. You can retry individual operations or all operations from the banner</p>
          <p>4. Different error types have different retry strategies and priorities</p>
          <p>5. Network state affects retry behavior (offline = no retries, slow = fewer retries)</p>
        </div>
      </Card>
    </div>
  );
}
