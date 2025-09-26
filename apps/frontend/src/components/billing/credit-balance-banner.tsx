"use client";

import { useState } from "react";
import { useCredits } from "@/hooks/use-credits";
import { PurchaseCreditsModal } from "@/components/billing/purchase-credits-modal";
import { Button } from "@repo/ui/button";
import { SEMANTIC_COLORS } from "@repo/common-types";

export function CreditBalanceBanner() {
  const { credits, isLoading, canCreatePanel, refreshCredits } = useCredits();
  const [modalOpen, setModalOpen] = useState(false);

  const balance = credits?.panel_balance ?? 0;
  const lowBalance = balance <= 5;

  return (
    <div
      className={`mb-4 flex items-center justify-between rounded-lg border px-4 py-3 ${SEMANTIC_COLORS.BACKGROUND.PRIMARY} ${SEMANTIC_COLORS.BORDER.DEFAULT}`}
    >
      <div>
        <p className="text-sm font-medium">
          {isLoading ? "Checking panel balance..." : `Panel balance: ${balance.toLocaleString()} panels`}
        </p>
        {!canCreatePanel && !isLoading ? (
          <p className={`text-xs ${SEMANTIC_COLORS.ERROR.TEXT}`}>
            You are out of panels. Purchase more to continue generating.
          </p>
        ) : null}
        {lowBalance && canCreatePanel ? (
          <p className={`text-xs ${SEMANTIC_COLORS.TEXT.TERTIARY}`}>
            Running low on credits—consider topping up before your next session.
          </p>
        ) : null}
      </div>
      <div className="space-x-2">
        <Button variant="outline" size="sm" onClick={() => void refreshCredits()} disabled={isLoading}>
          Refresh
        </Button>
        <Button size="sm" onClick={() => setModalOpen(true)}>
          Buy Panels
        </Button>
      </div>

      <PurchaseCreditsModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onCheckout={async (amount) => {
          console.log("Checkout amount", amount);
          await refreshCredits();
        }}
      />
    </div>
  );
}
