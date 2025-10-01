"use client";

import { useState } from "react";
import { AdminSidebar } from "./admin-sidebar";
import { AdminTopbar } from "./admin-topbar";
import { cn } from "@repo/utils";
import { SEMANTIC_COLORS } from "@repo/common-types";

interface AdminShellProps {
  children: React.ReactNode;
  title?: string;
}

export function AdminShell({ children, title }: AdminShellProps) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-slate-50">
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transition-transform lg:hidden",
          mobileNavOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <AdminSidebar />
      </div>

      <div className="hidden lg:flex lg:w-64 lg:flex-shrink-0">
        <AdminSidebar />
      </div>

      <div className="flex flex-1 flex-col lg:ml-0">
        <AdminTopbar
          title={title}
          onToggleNav={() => setMobileNavOpen((open) => !open)}
        />
        <main className={`flex-1 px-4 py-6 lg:px-8 ${SEMANTIC_COLORS.TEXT.PRIMARY}`}>
          {children}
        </main>
      </div>

      {mobileNavOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setMobileNavOpen(false)}
        />
      )}
    </div>
  );
}
