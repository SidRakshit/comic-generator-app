// src/app/billing/page.tsx
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@repo/ui/button";
import { Input } from "@repo/ui/input";
import { Label } from "@repo/ui/label";
import { apiRequest } from "@/lib/api";
import { SEMANTIC_COLORS, UI_CONSTANTS, INTERACTIVE_STYLES } from "@repo/common-types";

export default function BillingPage() {
  const [amount, setAmount] = useState(10);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handlePurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const session = await apiRequest<any>("/api/billing/checkout", "POST", { amount });
      if (session.checkoutUrl) {
        router.push(session.checkoutUrl);
      } else {
        throw new Error("Failed to create checkout session.");
      }
    } catch (err) {
      console.error("Failed to create checkout session:", err);
      setError(err instanceof Error ? err.message : "An unexpected error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Buy Credits</h1>
      </div>

      <div className={`${SEMANTIC_COLORS.BACKGROUND.PRIMARY} ${UI_CONSTANTS.BORDER_RADIUS.LARGE} shadow p-6`}>
        <h2 className="text-xl font-semibold mb-4">Purchase Credits</h2>
        <p className={`${SEMANTIC_COLORS.TEXT.SECONDARY} mb-6`}>Select the amount of credits you want to purchase.</p>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 border border-red-300 rounded">
            <strong>Error:</strong> {error}
          </div>
        )}

        <form onSubmit={handlePurchase} className="space-y-4">
          <div>
            <Label htmlFor="amount">Amount (in dollars)</Label>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              required
              min={5}
              max={100}
              disabled={isLoading}
            />
          </div>
          <Button
            type="submit"
            variant="outline"
            className={`w-full ${SEMANTIC_COLORS.BORDER.DEFAULT} ${SEMANTIC_COLORS.TEXT.PRIMARY} ${INTERACTIVE_STYLES.BUTTON.HOVER_LIGHT}`}
            disabled={isLoading}
          >
            {isLoading ? "Processing..." : "Purchase"}
          </Button>
        </form>
      </div>
    </div>
  );
}