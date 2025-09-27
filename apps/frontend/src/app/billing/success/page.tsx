// src/app/billing/success/page.tsx
"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@repo/ui/button";
import { SEMANTIC_COLORS, UI_CONSTANTS } from "@repo/common-types";

export default function SuccessPage() {
  return (
    <div className="container mx-auto py-8">
      <div className={`${SEMANTIC_COLORS.BACKGROUND.PRIMARY} ${UI_CONSTANTS.BORDER_RADIUS.LARGE} shadow p-6 text-center`}>
        <h1 className="text-3xl font-bold text-green-600 mb-4">Payment Successful!</h1>
        <p className={`${SEMANTIC_COLORS.TEXT.SECONDARY} mb-6">Your credits have been added to your account.</p>
        <Link href="/profile">
          <Button>Go to Profile</Button>
        </Link>
      </div>
    </div>
  );
}

