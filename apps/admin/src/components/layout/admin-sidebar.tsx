"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@repo/utils";
import { SEMANTIC_COLORS, UI_CONSTANTS, INTERACTIVE_STYLES } from "@repo/common-types";

const navItems = [
  { href: "/", label: "Dashboard" },
  { href: "/users", label: "Users" },
  { href: "/billing", label: "Billing" },
  { href: "/audit-logs", label: "Audit Logs" }
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "hidden lg:flex w-64 flex-col border-r bg-white", // base layout
        SEMANTIC_COLORS.BORDER.DEFAULT,
        SEMANTIC_COLORS.BACKGROUND.PRIMARY
      )}
    >
      <div className="px-6 py-4 border-b">
        <span className="text-xl font-semibold">Admin Console</span>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "block rounded-md px-3 py-2 text-sm font-medium",
                isActive
                  ? `${SEMANTIC_COLORS.BACKGROUND.PRIMARY} ${SEMANTIC_COLORS.TEXT.PRIMARY} ${INTERACTIVE_STYLES.BUTTON.HOVER_LIGHT}`
                  : `${SEMANTIC_COLORS.TEXT.SECONDARY} hover:${SEMANTIC_COLORS.TEXT.PRIMARY}`
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
