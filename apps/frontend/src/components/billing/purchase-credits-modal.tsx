"use client";

import { useState } from "react";
import { Modal } from "@repo/ui/modal";
import { Button } from "@repo/ui/button";
import { Input } from "@repo/ui/input";
import { calculatePanelsFromDollars, formatCurrency } from "@repo/utils";
import { SEMANTIC_COLORS } from "@repo/common-types";

interface PurchaseCreditsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCheckout?: (amount: number) => Promise<void>;
}

export function PurchaseCreditsModal({ isOpen, onClose, onCheckout }: PurchaseCreditsModalProps) {
  const [dollarAmount, setDollarAmount] = useState<number>(5);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const panels = calculatePanelsFromDollars(dollarAmount);

  const handleSubmit = async () => {
    if (dollarAmount <= 0 || !onCheckout) {
      onClose();
      return;
    }

    setIsSubmitting(true);
    try {
      await onCheckout(dollarAmount);
      onClose();
    } catch (error) {
      console.error("Purchase credits failed", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Buy Panels">
      <div className="space-y-4">
        <p className={`text-sm ${SEMANTIC_COLORS.TEXT.SECONDARY}`}>
          Each $5 purchase adds 20 panels to your balance. Choose the amount that fits your next project.
        </p>
        <div className="space-y-2">
          <label className={`text-sm font-medium ${SEMANTIC_COLORS.TEXT.PRIMARY}`}>Amount (USD)</label>
          <Input
            type="number"
            min={5}
            step={5}
            value={dollarAmount}
            onChange={(event) => setDollarAmount(Number(event.target.value))}
          />
          <p className={`text-xs ${SEMANTIC_COLORS.TEXT.TERTIARY}`}>
            You will receive <strong>{panels}</strong> panels ({formatCurrency(dollarAmount)}).
          </p>
        </div>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting || panels === 0}>
            {isSubmitting ? "Redirecting..." : "Proceed to Checkout"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
