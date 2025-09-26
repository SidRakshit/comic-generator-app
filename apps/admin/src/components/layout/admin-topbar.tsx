"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import { Button } from "@repo/ui/button";
import { SEMANTIC_COLORS, UI_CONSTANTS } from "@repo/common-types";

interface AdminTopbarProps {
  onToggleNav?: () => void;
  title?: string;
}

export function AdminTopbar({ onToggleNav, title }: AdminTopbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleToggle = () => {
    setIsMenuOpen((prev) => !prev);
    onToggleNav?.();
  };

  return (
    <header
      className={`sticky top-0 z-40 border-b bg-white ${SEMANTIC_COLORS.BORDER.DEFAULT}`}
    >
      <div className="flex h-16 items-center px-4 lg:px-6">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden mr-2"
          onClick={handleToggle}
          aria-label="Toggle navigation"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <span className="text-lg font-semibold">
          {title ?? "Admin Console"}
        </span>
      </div>
    </header>
  );
}
