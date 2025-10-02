"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@repo/ui/button";
import { Card } from "@repo/ui/card";
import { 
  SkeletonLoader, 
  ComicPanelSkeleton, 
  ComicListItemSkeleton, 
  FormFieldSkeleton, 
  NavigationSkeleton 
} from "@repo/ui/skeleton-loader";
import { 
  ProgressIndicator, 
  LoadingSpinner, 
  LoadingDots 
} from "@repo/ui/progress-indicator";
import { 
  ToastContainer, 
  useToastNotifications 
} from "@repo/ui/toast-notification";
import { useOptimisticUpdates } from "@/hooks/use-optimistic-updates";
import { useBackgroundSync } from "@/hooks/use-background-sync";
import { useOfflineMode } from "@/hooks/use-offline-mode";
import { usePerformanceOptimizations } from "@/hooks/use-performance-optimizations";
import { useLoadingStates, useToast } from "@/hooks/use-loading-states";
import { useNetworkState } from "@/hooks/use-network-state";

/**
 * Demo page for Phase 4: Advanced UX Features
 * Showcases optimistic updates, background sync, offline mode, and performance optimizations
 */
export default function DemoPhase4Page() {
  const [counter, setCounter] = useState(0);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [performanceData, setPerformanceData] = useState<any>(null);

  // Hooks for Phase 4 features
  const { showToast, dismissToast, clearToasts, getToasts } = useToastNotifications();
  const { showToast: showToastSimple } = useToast();
  const { state: networkState } = useNetworkState();
  const { state: backgroundSyncState, queueOperation, triggerSync } = useBackgroundSync();
  const { state: offlineState, queueOperation: queueOfflineOp, syncOperations } = useOfflineMode();
  const { metrics, isVisible, isInViewport, dimensions, resetMetrics, checkPerformance } = usePerformanceOptimizations({
    trackRenders: true,
    enableMemoryMonitoring: true,
  });
  const { state: loadingState, startLoading, updateProgress, stopLoading } = useLoadingStates();

  // Optimistic updates demo
  const { value: optimisticCounter, isPending, applyOptimisticUpdate } = useOptimisticUpdates({
    currentValue: counter,
    applyUpdate: (current, optimistic) => optimistic,
    revertUpdate: (current) => current,
    executeOperation: async (newValue) => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      return newValue;
    },
    onOptimisticUpdate: (value) => {
      showToast(`Optimistically updated to ${value}`, "info", 2000);
    },
    onSuccess: (value) => {
      showToast(`Successfully saved ${value}`, "success", 3000);
    },
    onError: (error, revertedValue) => {
      showToast(`Failed to save: ${error.message}`, "error", 5000);
    },
  });

  // Simulate loading with progress
  const simulateLoading = async () => {
    setIsLoading(true);
    startLoading("Processing data...");
    
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 200));
      setLoadingProgress(i);
      updateProgress(i);
    }
    
    stopLoading();
    setIsLoading(false);
    showToast("Loading completed!", "success", 3000);
  };

  // Simulate background operation
  const simulateBackgroundOperation = () => {
    const operationId = `bg-op-${Date.now()}`;
    queueOperation(
      operationId,
      async () => {
        await new Promise(resolve => setTimeout(resolve, 3000));
        showToast("Background operation completed!", "success", 3000);
      },
      1, // High priority
      { type: "demo", timestamp: Date.now() }
    );
    showToast("Background operation queued", "info", 2000);
  };

  // Simulate offline operation
  const simulateOfflineOperation = () => {
    const operationId = `offline-op-${Date.now()}`;
    queueOfflineOp(
      operationId,
      "demo",
      async () => {
        await new Promise(resolve => setTimeout(resolve, 2000));
        showToast("Offline operation synced!", "success", 3000);
      },
      { message: "Demo offline operation" },
      1, // High priority
      { type: "demo", timestamp: Date.now() }
    );
    showToast("Offline operation queued", "info", 2000);
  };

  // Performance monitoring
  useEffect(() => {
    const interval = setInterval(() => {
      checkPerformance();
      setPerformanceData({
        renderCount: metrics.renderCount,
        averageRenderTime: metrics.averageRenderTime,
        memoryUsage: metrics.memoryUsage,
        isVisible,
        isInViewport,
        dimensions,
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [metrics, isVisible, isInViewport, dimensions, checkPerformance]);

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Phase 4: Advanced UX Features Demo
        </h1>
        <p className="text-gray-600">
          Showcasing optimistic updates, background sync, offline mode, and performance optimizations
        </p>
      </div>

      {/* Toast Container */}
      <ToastContainer
        toasts={getToasts()}
        onDismiss={dismissToast}
        position="top-right"
      />

      {/* Network State */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Network State</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className={`text-2xl font-bold ${networkState.isOnline ? "text-green-600" : "text-red-600"}`}>
              {networkState.isOnline ? "🟢" : "🔴"}
            </div>
            <div className="text-sm text-gray-600">Online</div>
          </div>
          <div className="text-center">
            <div className={`text-2xl font-bold ${networkState.isSlowConnection ? "text-yellow-600" : "text-green-600"}`}>
              {networkState.isSlowConnection ? "🐌" : "⚡"}
            </div>
            <div className="text-sm text-gray-600">Speed</div>
          </div>
          <div className="text-center">
            <div className={`text-2xl font-bold ${networkState.isUnstable ? "text-red-600" : "text-green-600"}`}>
              {networkState.isUnstable ? "📡" : "📶"}
            </div>
            <div className="text-sm text-gray-600">Stability</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-600">
              {networkState.failureCount}
            </div>
            <div className="text-sm text-gray-600">Failures</div>
          </div>
        </div>
      </Card>

      {/* Optimistic Updates Demo */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Optimistic Updates</h2>
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <span className="text-lg font-medium">Counter: {optimisticCounter}</span>
            {isPending && <LoadingDots size="sm" />}
          </div>
          <div className="flex space-x-2">
            <Button
              onClick={() => applyOptimisticUpdate(counter + 1)}
              disabled={isPending}
            >
              Increment (Optimistic)
            </Button>
            <Button
              onClick={() => setCounter(counter + 1)}
              variant="outline"
            >
              Increment (Immediate)
            </Button>
          </div>
        </div>
      </Card>

      {/* Loading States Demo */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Loading States & Progress</h2>
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span>Loading Progress</span>
              <span>{loadingProgress}%</span>
            </div>
            <ProgressIndicator
              value={loadingProgress}
              showPercentage
              animated
            />
          </div>
          <div className="flex space-x-2">
            <Button
              onClick={simulateLoading}
              disabled={isLoading}
            >
              {isLoading ? "Loading..." : "Start Loading"}
            </Button>
            <Button
              onClick={() => setLoadingProgress(0)}
              variant="outline"
            >
              Reset
            </Button>
          </div>
          <div className="flex items-center space-x-4">
            <LoadingSpinner size="sm" />
            <LoadingDots size="md" />
            <LoadingSpinner size="lg" color="success" />
          </div>
        </div>
      </Card>

      {/* Skeleton Loaders Demo */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Skeleton Loaders</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="font-medium">Basic Skeletons</h3>
            <SkeletonLoader width="100%" height="1rem" />
            <SkeletonLoader width="80%" height="1rem" />
            <SkeletonLoader width="60%" height="1rem" />
            <SkeletonLoader width="100%" height="100px" circular />
          </div>
          <div className="space-y-4">
            <h3 className="font-medium">Comic Skeletons</h3>
            <ComicPanelSkeleton />
            <ComicListItemSkeleton />
            <FormFieldSkeleton />
            <NavigationSkeleton />
          </div>
        </div>
      </Card>

      {/* Background Sync Demo */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Background Sync</h2>
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {backgroundSyncState.pendingCount}
              </div>
              <div className="text-sm text-gray-600">Pending</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {backgroundSyncState.successCount}
              </div>
              <div className="text-sm text-gray-600">Success</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600">
                {backgroundSyncState.failedCount}
              </div>
              <div className="text-sm text-gray-600">Failed</div>
            </div>
            <div>
              <div className={`text-2xl font-bold ${backgroundSyncState.isSyncing ? "text-yellow-600" : "text-gray-600"}`}>
                {backgroundSyncState.isSyncing ? "🔄" : "⏸️"}
              </div>
              <div className="text-sm text-gray-600">Status</div>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button onClick={simulateBackgroundOperation}>
              Queue Background Operation
            </Button>
            <Button onClick={triggerSync} variant="outline">
              Trigger Sync
            </Button>
          </div>
        </div>
      </Card>

      {/* Offline Mode Demo */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Offline Mode</h2>
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className={`text-2xl font-bold ${offlineState.isOffline ? "text-red-600" : "text-green-600"}`}>
                {offlineState.isOffline ? "🔴" : "🟢"}
              </div>
              <div className="text-sm text-gray-600">Status</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {offlineState.queuedOperationsCount}
              </div>
              <div className="text-sm text-gray-600">Queued</div>
            </div>
            <div>
              <div className={`text-2xl font-bold ${offlineState.isSyncing ? "text-yellow-600" : "text-gray-600"}`}>
                {offlineState.isSyncing ? "🔄" : "⏸️"}
              </div>
              <div className="text-sm text-gray-600">Syncing</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-600">
                {offlineState.isAvailable ? "✅" : "❌"}
              </div>
              <div className="text-sm text-gray-600">Available</div>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button onClick={simulateOfflineOperation}>
              Queue Offline Operation
            </Button>
            <Button onClick={syncOperations} variant="outline">
              Sync Operations
            </Button>
          </div>
        </div>
      </Card>

      {/* Performance Monitoring */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Performance Monitoring</h2>
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {performanceData?.renderCount || 0}
              </div>
              <div className="text-sm text-gray-600">Renders</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {performanceData?.averageRenderTime?.toFixed(2) || 0}ms
              </div>
              <div className="text-sm text-gray-600">Avg Render</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">
                {performanceData?.memoryUsage ? `${(performanceData.memoryUsage / 1024 / 1024).toFixed(1)}MB` : "N/A"}
              </div>
              <div className="text-sm text-gray-600">Memory</div>
            </div>
            <div>
              <div className={`text-2xl font-bold ${performanceData?.isVisible ? "text-green-600" : "text-red-600"}`}>
                {performanceData?.isVisible ? "👁️" : "🙈"}
              </div>
              <div className="text-sm text-gray-600">Visible</div>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button onClick={resetMetrics} variant="outline">
              Reset Metrics
            </Button>
            <Button onClick={checkPerformance} variant="outline">
              Check Performance
            </Button>
          </div>
        </div>
      </Card>

      {/* Toast Notifications Demo */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Toast Notifications</h2>
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => showToast("Success message!", "success")}
              className="bg-green-600 hover:bg-green-700"
            >
              Success Toast
            </Button>
            <Button
              onClick={() => showToast("Error message!", "error")}
              className="bg-red-600 hover:bg-red-700"
            >
              Error Toast
            </Button>
            <Button
              onClick={() => showToast("Warning message!", "warning")}
              className="bg-yellow-600 hover:bg-yellow-700"
            >
              Warning Toast
            </Button>
            <Button
              onClick={() => showToast("Info message!", "info")}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Info Toast
            </Button>
          </div>
          <div className="flex space-x-2">
            <Button onClick={clearToasts} variant="outline">
              Clear All Toasts
            </Button>
          </div>
        </div>
      </Card>

      {/* Instructions */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">How to Test Phase 4 Features</h2>
        <div className="space-y-2 text-sm text-gray-600">
          <p><strong>Optimistic Updates:</strong> Click "Increment (Optimistic)" to see immediate UI feedback while the operation processes in the background.</p>
          <p><strong>Loading States:</strong> Click "Start Loading" to see progress indicators and skeleton loaders in action.</p>
          <p><strong>Background Sync:</strong> Queue operations that will be processed in the background, even when offline.</p>
          <p><strong>Offline Mode:</strong> Queue operations when offline - they'll sync when you come back online.</p>
          <p><strong>Performance Monitoring:</strong> Watch real-time performance metrics including render count, memory usage, and visibility.</p>
          <p><strong>Toast Notifications:</strong> Click different toast buttons to see various notification types and animations.</p>
        </div>
      </Card>
    </div>
  );
}
