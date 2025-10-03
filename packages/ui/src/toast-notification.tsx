"use client";

import React, { useState, useEffect, useCallback } from "react";
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from "lucide-react";

/**
 * Toast notification data
 */
export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration: number;
  timestamp: number;
}

/**
 * Props for individual toast notification
 */
interface ToastNotificationProps {
  /** Toast data */
  toast: Toast;
  /** Callback when toast is dismissed */
  onDismiss: (id: string) => void;
  /** Position of the toast */
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
  /** Custom className */
  className?: string;
}

/**
 * Individual toast notification component
 */
export function ToastNotification({
  toast,
  onDismiss,
  position = 'top-right',
  className = "",
}: ToastNotificationProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  const handleDismiss = useCallback(() => {
    setIsLeaving(true);
    setTimeout(() => {
      onDismiss(toast.id);
    }, 300); // Match animation duration
  }, [onDismiss, toast.id]);

  useEffect(() => {
    // Animate in
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Auto-dismiss after duration
    if (toast.duration > 0) {
      const timer = setTimeout(() => {
        handleDismiss();
      }, toast.duration);
      return () => clearTimeout(timer);
    }
  }, [toast.duration, handleDismiss]);

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'info':
        return <Info className="w-5 h-5 text-blue-500" />;
      default:
        return <Info className="w-5 h-5 text-gray-500" />;
    }
  };

  const getBackgroundColor = () => {
    switch (toast.type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'info':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getTextColor = () => {
    switch (toast.type) {
      case 'success':
        return 'text-green-800';
      case 'error':
        return 'text-red-800';
      case 'warning':
        return 'text-yellow-800';
      case 'info':
        return 'text-blue-800';
      default:
        return 'text-gray-800';
    }
  };

  const getPositionClasses = () => {
    switch (position) {
      case 'top-right':
        return 'top-4 right-4';
      case 'top-left':
        return 'top-4 left-4';
      case 'bottom-right':
        return 'bottom-4 right-4';
      case 'bottom-left':
        return 'bottom-4 left-4';
      case 'top-center':
        return 'top-4 left-1/2 transform -translate-x-1/2';
      case 'bottom-center':
        return 'bottom-4 left-1/2 transform -translate-x-1/2';
      default:
        return 'top-4 right-4';
    }
  };

  return (
    <div
      className={`
        fixed z-50 max-w-sm w-full
        ${getPositionClasses()}
        transform transition-all duration-300 ease-in-out
        ${isVisible && !isLeaving ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'}
        ${className}
      `}
    >
      <div
        className={`
          flex items-start p-4 rounded-lg border shadow-lg
          ${getBackgroundColor()}
        `}
      >
        <div className="flex-shrink-0 mr-3">
          {getIcon()}
        </div>
        <div className="flex-1">
          <p className={`text-sm font-medium ${getTextColor()}`}>
            {toast.message}
          </p>
        </div>
        <button
          onClick={handleDismiss}
          className="flex-shrink-0 ml-3 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

/**
 * Props for toast container
 */
interface ToastContainerProps {
  /** Array of toasts */
  toasts: Toast[];
  /** Callback when toast is dismissed */
  onDismiss: (id: string) => void;
  /** Position of the toast container */
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
  /** Maximum number of toasts to show */
  maxToasts?: number;
  /** Custom className */
  className?: string;
}

/**
 * Toast container component
 * Manages multiple toast notifications
 */
export function ToastContainer({
  toasts,
  onDismiss,
  position = 'top-right',
  maxToasts = 5,
  className = "",
}: ToastContainerProps) {
  const visibleToasts = toasts.slice(-maxToasts);

  if (visibleToasts.length === 0) {
    return null;
  }

  return (
    <div className={`fixed z-50 ${className}`}>
      <div className="space-y-2">
        {visibleToasts.map((toast) => (
          <ToastNotification
            key={toast.id}
            toast={toast}
            onDismiss={onDismiss}
            position={position}
          />
        ))}
      </div>
    </div>
  );
}

/**
 * Hook for managing toast notifications
 */
export function useToastNotifications() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (
    message: string,
    type: Toast['type'] = 'info',
    duration: number = 5000
  ): string => {
    const id = Math.random().toString(36).substr(2, 9);
    const toast: Toast = {
      id,
      message,
      type,
      duration,
      timestamp: Date.now(),
    };

    setToasts(prev => [...prev, toast]);
    return id;
  };

  const dismissToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const clearToasts = () => {
    setToasts([]);
  };

  return {
    toasts,
    showToast,
    dismissToast,
    clearToasts,
  };
}
