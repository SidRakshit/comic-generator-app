"use client";

import * as React from "react";
import { cn } from "@repo/utils";

export interface DropdownProps {
  children: React.ReactNode;
  className?: string;
}

export const Dropdown = React.forwardRef<HTMLDivElement, DropdownProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "relative inline-block text-left",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
Dropdown.displayName = "Dropdown";

export interface DropdownMenuProps {
  children: React.ReactNode;
  className?: string;
}

export const DropdownMenu = React.forwardRef<HTMLDivElement, DropdownMenuProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
DropdownMenu.displayName = "DropdownMenu";

export interface DropdownItemProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const DropdownItem = React.forwardRef<HTMLDivElement, DropdownItemProps>(
  ({ className, children, onClick, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 cursor-pointer",
          className
        )}
        onClick={onClick}
        {...props}
      >
        {children}
      </div>
    );
  }
);
DropdownItem.displayName = "DropdownItem";
