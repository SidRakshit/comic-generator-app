// src/app/billing/cancel/page.tsx
"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@repo/ui/button";
import { SEMANTIC_COLORS, UI_CONSTANTS } from "@repo/common-types";

export default function CancelPage() {
  return (
    <div className="container mx-auto py-8">
      <div
        className={`${SEMANTIC_COLORS.BACKGROUND.PRIMARY} ${UI_CONSTANTS.BORDER_RADIUS.LARGE} shadow p-6 text-center`}
      >
        <h1 className="text-3xl font-bold text-red-600 mb-4">
          Payment Canceled
        </h1>
        <p className={`${SEMANTIC_COLORS.TEXT.SECONDARY} mb-6`}>
          Your payment was not processed.
        </p>
        <Link href="/billing">
          <Button>Try Again</Button>
        </Link>
      </div>
    </div>
  );
}
