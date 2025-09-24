"use client";

import * as React from "react";
import { cn } from "@repo/utils";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
}

export const Modal = React.forwardRef<HTMLDivElement, ModalProps>(
  ({ isOpen, onClose, children, className, ...props }, ref) => {
    if (!isOpen) return null;

    return (
      <div
        ref={ref}
        className="fixed inset-0 z-50 flex items-center justify-center"
        {...props}
      >
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        />
        <div
          className={cn(
            "relative z-50 w-full max-w-lg rounded-lg bg-white p-6 shadow-lg",
            className
          )}
        >
          {children}
        </div>
      </div>
    );
  }
);
Modal.displayName = "Modal";

export interface ModalHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export const ModalHeader = React.forwardRef<HTMLDivElement, ModalHeaderProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex flex-col space-y-1.5 text-center sm:text-left",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
ModalHeader.displayName = "ModalHeader";

export interface ModalContentProps {
  children: React.ReactNode;
  className?: string;
}

export const ModalContent = React.forwardRef<HTMLDivElement, ModalContentProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex flex-col space-y-4",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
ModalContent.displayName = "ModalContent";
