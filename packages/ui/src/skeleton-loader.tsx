"use client";

import React from "react";

/**
 * Props for the SkeletonLoader component
 */
interface SkeletonLoaderProps {
  /** Width of the skeleton */
  width?: string | number;
  /** Height of the skeleton */
  height?: string | number;
  /** Number of skeleton lines */
  lines?: number;
  /** Whether to show a circular skeleton */
  circular?: boolean;
  /** Whether to show a rectangular skeleton */
  rectangular?: boolean;
  /** Animation duration in milliseconds */
  duration?: number;
  /** Custom className */
  className?: string;
  /** Whether the skeleton is visible */
  visible?: boolean;
}

/**
 * Skeleton loader component for showing loading placeholders
 * Provides smooth animations and customizable shapes
 */
export function SkeletonLoader({
  width = "100%",
  height = "1rem",
  lines = 1,
  circular = false,
  rectangular = false,
  duration = 1500,
  className = "",
  visible = true,
}: SkeletonLoaderProps) {
  if (!visible) {
    return null;
  }

  const baseClasses = "bg-gray-200 animate-pulse rounded";
  const shapeClasses = circular 
    ? "rounded-full" 
    : rectangular 
    ? "rounded-none" 
    : "rounded";

  const skeletonStyle = {
    width: typeof width === "number" ? `${width}px` : width,
    height: typeof height === "number" ? `${height}px` : height,
    animationDuration: `${duration}ms`,
  };

  if (lines > 1) {
    return (
      <div className={`space-y-2 ${className}`}>
        {Array.from({ length: lines }, (_, index) => (
          <div
            key={index}
            className={`${baseClasses} ${shapeClasses}`}
            style={{
              ...skeletonStyle,
              width: index === lines - 1 ? "75%" : "100%",
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={`${baseClasses} ${shapeClasses} ${className}`}
      style={skeletonStyle}
    />
  );
}

/**
 * Skeleton loader for comic panels
 */
export function ComicPanelSkeleton({
  className = "",
  visible = true,
}: {
  className?: string;
  visible?: boolean;
}) {
  if (!visible) {
    return null;
  }

  return (
    <div className={`bg-gray-100 rounded-lg p-4 ${className}`}>
      <SkeletonLoader
        width="100%"
        height="200px"
        rectangular
        className="mb-3"
      />
      <SkeletonLoader
        width="80%"
        height="1rem"
        className="mb-2"
      />
      <SkeletonLoader
        width="60%"
        height="0.875rem"
      />
    </div>
  );
}

/**
 * Skeleton loader for comic list items
 */
export function ComicListItemSkeleton({
  className = "",
  visible = true,
}: {
  className?: string;
  visible?: boolean;
}) {
  if (!visible) {
    return null;
  }

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-4 ${className}`}>
      <div className="flex space-x-4">
        <SkeletonLoader
          width="80px"
          height="80px"
          rectangular
        />
        <div className="flex-1 space-y-2">
          <SkeletonLoader
            width="60%"
            height="1.25rem"
          />
          <SkeletonLoader
            width="40%"
            height="1rem"
          />
          <SkeletonLoader
            width="30%"
            height="0.875rem"
          />
        </div>
      </div>
    </div>
  );
}

/**
 * Skeleton loader for form fields
 */
export function FormFieldSkeleton({
  className = "",
  visible = true,
}: {
  className?: string;
  visible?: boolean;
}) {
  if (!visible) {
    return null;
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <SkeletonLoader
        width="25%"
        height="1rem"
      />
      <SkeletonLoader
        width="100%"
        height="2.5rem"
        rectangular
      />
    </div>
  );
}

/**
 * Skeleton loader for navigation items
 */
export function NavigationSkeleton({
  className = "",
  visible = true,
}: {
  className?: string;
  visible?: boolean;
}) {
  if (!visible) {
    return null;
  }

  return (
    <div className={`flex space-x-4 ${className}`}>
      {Array.from({ length: 4 }, (_, index) => (
        <SkeletonLoader
          key={index}
          width="80px"
          height="1rem"
        />
      ))}
    </div>
  );
}
