"use client";

import React, { useEffect, useRef, useState } from "react";

/**
 * Hook for managing focus trap
 * Keeps focus within a specific element (useful for modals, dropdowns)
 */
export function useFocusTrap(isActive: boolean = true) {
  const containerRef = useRef<HTMLElement>(null);
  const previousActiveElement = useRef<Element | null>(null);

  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const container = containerRef.current;
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    // Store the previously focused element
    previousActiveElement.current = document.activeElement;

    // Focus the first element
    if (firstElement) {
      firstElement.focus();
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return;

      if (event.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement?.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement?.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      // Restore focus to the previously focused element
      if (previousActiveElement.current instanceof HTMLElement) {
        previousActiveElement.current.focus();
      }
    };
  }, [isActive]);

  return containerRef;
}

/**
 * Hook for managing ARIA live regions
 * Announces changes to screen readers
 */
export function useAriaLiveRegion() {
  const [announcements, setAnnouncements] = useState<string[]>([]);

  const announce = (message: string, priority: "polite" | "assertive" = "polite") => {
    setAnnouncements(prev => [...prev, message]);
    
    // Clear the announcement after a short delay
    setTimeout(() => {
      setAnnouncements(prev => prev.filter(msg => msg !== message));
    }, 1000);
  };

  const LiveRegion = ({ priority = "polite" }: { priority?: "polite" | "assertive" }) => (
    <div
      aria-live={priority}
      aria-atomic="true"
      className="sr-only"
    >
      {announcements.map((message, index) => (
        <div key={index}>{message}</div>
      ))}
    </div>
  );

  return { announce, LiveRegion };
}

/**
 * Hook for keyboard navigation
 * Handles arrow key navigation for lists, grids, etc.
 */
export function useKeyboardNavigation(
  items: any[],
  orientation: "horizontal" | "vertical" | "both" = "both"
) {
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);
  const containerRef = useRef<HTMLElement>(null);

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (items.length === 0) return;

    const { key } = event;
    let newIndex = focusedIndex;

    switch (key) {
      case "ArrowDown":
        if (orientation === "vertical" || orientation === "both") {
          event.preventDefault();
          newIndex = (focusedIndex + 1) % items.length;
        }
        break;
      case "ArrowUp":
        if (orientation === "vertical" || orientation === "both") {
          event.preventDefault();
          newIndex = focusedIndex <= 0 ? items.length - 1 : focusedIndex - 1;
        }
        break;
      case "ArrowRight":
        if (orientation === "horizontal" || orientation === "both") {
          event.preventDefault();
          newIndex = (focusedIndex + 1) % items.length;
        }
        break;
      case "ArrowLeft":
        if (orientation === "horizontal" || orientation === "both") {
          event.preventDefault();
          newIndex = focusedIndex <= 0 ? items.length - 1 : focusedIndex - 1;
        }
        break;
      case "Home":
        event.preventDefault();
        newIndex = 0;
        break;
      case "End":
        event.preventDefault();
        newIndex = items.length - 1;
        break;
    }

    if (newIndex !== focusedIndex) {
      setFocusedIndex(newIndex);
    }
  };

  const focusItem = (index: number) => {
    if (index >= 0 && index < items.length) {
      setFocusedIndex(index);
    }
  };

  const clearFocus = () => {
    setFocusedIndex(-1);
  };

  return {
    focusedIndex,
    containerRef,
    handleKeyDown,
    focusItem,
    clearFocus,
  };
}

/**
 * Hook for skip links
 * Provides keyboard navigation shortcuts
 */
export function useSkipLinks() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Show skip links when Tab is pressed
      if (event.key === "Tab") {
        setIsVisible(true);
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      // Hide skip links when Tab is released
      if (event.key === "Tab") {
        setTimeout(() => setIsVisible(false), 100);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("keyup", handleKeyUp);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  const SkipLinks = ({ links }: { links: Array<{ href: string; label: string }> }) => {
    if (!isVisible) return null;

    return (
      <div className="fixed top-0 left-0 z-50 p-2">
        <div className="bg-blue-600 text-white rounded-lg shadow-lg p-2">
          {links.map((link, index) => (
            <a
              key={index}
              href={link.href}
              className="block px-3 py-2 text-sm hover:bg-blue-700 rounded focus:outline-none focus:ring-2 focus:ring-white"
            >
              Skip to {link.label}
            </a>
          ))}
        </div>
      </div>
    );
  };

  return { SkipLinks };
}

/**
 * Accessible button component with proper ARIA attributes
 */
interface AccessibleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Button variant */
  variant?: "primary" | "secondary" | "danger" | "ghost";
  /** Button size */
  size?: "sm" | "md" | "lg";
  /** Loading state */
  loading?: boolean;
  /** Icon to display */
  icon?: React.ReactNode;
  /** Icon position */
  iconPosition?: "left" | "right";
  /** Full width */
  fullWidth?: boolean;
  /** Children */
  children: React.ReactNode;
}

export function AccessibleButton({
  variant = "primary",
  size = "md",
  loading = false,
  icon,
  iconPosition = "left",
  fullWidth = false,
  children,
  className = "",
  disabled,
  ...props
}: AccessibleButtonProps) {
  const baseClasses = "inline-flex items-center justify-center font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variantClasses = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
    secondary: "bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500",
    danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
    ghost: "text-gray-700 hover:bg-gray-100 focus:ring-gray-500",
  };

  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
  };

  const isDisabled = disabled || loading;

  return (
    <button
      className={`
        ${baseClasses}
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${fullWidth ? "w-full" : ""}
        ${className}
      `}
      disabled={isDisabled}
      aria-disabled={isDisabled}
      aria-busy={loading}
      {...props}
    >
      {loading && (
        <div className="animate-spin -ml-1 mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
      )}
      {icon && iconPosition === "left" && !loading && (
        <span className="mr-2">{icon}</span>
      )}
      {children}
      {icon && iconPosition === "right" && !loading && (
        <span className="ml-2">{icon}</span>
      )}
    </button>
  );
}

/**
 * Accessible form field wrapper
 */
interface AccessibleFieldProps {
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: React.ReactElement;
  className?: string;
}

export function AccessibleField({
  label,
  error,
  hint,
  required = false,
  children,
  className = "",
}: AccessibleFieldProps) {
  const fieldId = children.props.id || `field-${Math.random().toString(36).substr(2, 9)}`;
  const errorId = error ? `${fieldId}-error` : undefined;
  const hintId = hint ? `${fieldId}-hint` : undefined;

  const describedBy = [errorId, hintId].filter(Boolean).join(" ");

  return (
    <div className={`space-y-1 ${className}`}>
      <label
        htmlFor={fieldId}
        className="block text-sm font-medium text-gray-700"
      >
        {label}
        {required && <span className="text-red-500 ml-1" aria-label="required">*</span>}
      </label>
      
      {hint && (
        <p id={hintId} className="text-sm text-gray-500">
          {hint}
        </p>
      )}
      
      {React.cloneElement(children, {
        id: fieldId,
        "aria-invalid": error ? "true" : "false",
        "aria-describedby": describedBy || undefined,
        "aria-required": required,
      })}
      
      {error && (
        <p id={errorId} className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

/**
 * Screen reader only text
 */
export function ScreenReaderOnly({ children }: { children: React.ReactNode }) {
  return (
    <span className="sr-only">
      {children}
    </span>
  );
}
