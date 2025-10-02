"use client";

import React from "react";

/**
 * Props for the ProgressIndicator component
 */
interface ProgressIndicatorProps {
  /** Progress value (0-100) */
  value: number;
  /** Maximum value (default: 100) */
  max?: number;
  /** Size of the progress indicator */
  size?: 'sm' | 'md' | 'lg';
  /** Variant of the progress indicator */
  variant?: 'linear' | 'circular';
  /** Color theme */
  color?: 'primary' | 'success' | 'warning' | 'error' | 'info';
  /** Whether to show percentage text */
  showPercentage?: boolean;
  /** Whether to show animated progress */
  animated?: boolean;
  /** Custom className */
  className?: string;
  /** Custom label */
  label?: string;
  /** Whether the progress is indeterminate */
  indeterminate?: boolean;
}

/**
 * Progress indicator component
 * Shows progress with smooth animations and multiple variants
 */
export function ProgressIndicator({
  value,
  max = 100,
  size = 'md',
  variant = 'linear',
  color = 'primary',
  showPercentage = true,
  animated = true,
  className = "",
  label,
  indeterminate = false,
}: ProgressIndicatorProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  
  const sizeClasses = {
    sm: variant === 'linear' ? 'h-1' : 'w-4 h-4',
    md: variant === 'linear' ? 'h-2' : 'w-8 h-8',
    lg: variant === 'linear' ? 'h-3' : 'w-12 h-12',
  };

  const colorClasses = {
    primary: 'bg-blue-500',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    error: 'bg-red-500',
    info: 'bg-gray-500',
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  if (variant === 'circular') {
    const radius = size === 'sm' ? 16 : size === 'md' ? 32 : 48;
    const strokeWidth = size === 'sm' ? 2 : size === 'md' ? 3 : 4;
    const circumference = 2 * Math.PI * radius;
    const strokeDasharray = circumference;
    const strokeDashoffset = indeterminate 
      ? circumference * 0.25 
      : circumference - (percentage / 100) * circumference;

    return (
      <div className={`relative inline-flex items-center justify-center ${className}`}>
        <svg
          className={`${sizeClasses[size]} transform -rotate-90`}
          viewBox={`0 0 ${(radius + strokeWidth) * 2} ${(radius + strokeWidth) * 2}`}
        >
          {/* Background circle */}
          <circle
            cx={radius + strokeWidth}
            cy={radius + strokeWidth}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="none"
            className="text-gray-200"
          />
          {/* Progress circle */}
          <circle
            cx={radius + strokeWidth}
            cy={radius + strokeWidth}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            className={`${colorClasses[color]} transition-all duration-300 ease-in-out ${
              animated ? 'animate-pulse' : ''
            }`}
            style={{
              strokeLinecap: 'round',
              ...(indeterminate && {
                animation: 'spin 1s linear infinite',
              }),
            }}
          />
        </svg>
        {showPercentage && !indeterminate && (
          <div className={`absolute inset-0 flex items-center justify-center ${textSizeClasses[size]} font-medium text-gray-700`}>
            {Math.round(percentage)}%
          </div>
        )}
        {label && (
          <div className={`absolute -bottom-6 left-1/2 transform -translate-x-1/2 ${textSizeClasses[size]} text-gray-600 whitespace-nowrap`}>
            {label}
          </div>
        )}
      </div>
    );
  }

  // Linear variant
  return (
    <div className={`w-full ${className}`}>
      {label && (
        <div className={`flex justify-between items-center mb-1 ${textSizeClasses[size]} text-gray-700`}>
          <span>{label}</span>
          {showPercentage && !indeterminate && (
            <span>{Math.round(percentage)}%</span>
          )}
        </div>
      )}
      <div className={`w-full bg-gray-200 rounded-full overflow-hidden ${sizeClasses[size]}`}>
        <div
          className={`h-full ${colorClasses[color]} transition-all duration-300 ease-in-out ${
            animated ? 'animate-pulse' : ''
          } ${indeterminate ? 'animate-pulse' : ''}`}
          style={{
            width: indeterminate ? '100%' : `${percentage}%`,
            ...(indeterminate && {
              animation: 'indeterminate 2s ease-in-out infinite',
            }),
          }}
        />
      </div>
    </div>
  );
}

/**
 * Loading spinner component
 */
export function LoadingSpinner({
  size = 'md',
  color = 'primary',
  className = "",
}: {
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'success' | 'warning' | 'error' | 'info';
  className?: string;
}) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  const colorClasses = {
    primary: 'text-blue-500',
    success: 'text-green-500',
    warning: 'text-yellow-500',
    error: 'text-red-500',
    info: 'text-gray-500',
  };

  return (
    <div className={`${sizeClasses[size]} ${colorClasses[color]} ${className}`}>
      <svg
        className="animate-spin"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    </div>
  );
}

/**
 * Loading dots component
 */
export function LoadingDots({
  size = 'md',
  color = 'primary',
  className = "",
}: {
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'success' | 'warning' | 'error' | 'info';
  className?: string;
}) {
  const sizeClasses = {
    sm: 'w-1 h-1',
    md: 'w-2 h-2',
    lg: 'w-3 h-3',
  };

  const colorClasses = {
    primary: 'bg-blue-500',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    error: 'bg-red-500',
    info: 'bg-gray-500',
  };

  return (
    <div className={`flex space-x-1 ${className}`}>
      {[0, 1, 2].map((index) => (
        <div
          key={index}
          className={`${sizeClasses[size]} ${colorClasses[color]} rounded-full animate-pulse`}
          style={{
            animationDelay: `${index * 0.2}s`,
          }}
        />
      ))}
    </div>
  );
}
