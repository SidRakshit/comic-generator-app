"use client";

import { useState } from "react";
import { Button } from "@repo/ui/button";
import { Input } from "@repo/ui/input";
import { Textarea } from "@repo/ui/textarea";
import { SEMANTIC_COLORS } from "@repo/common-types";

interface RefundRequestPanelProps {
  onSubmit?: (chargeId: string, reason: string) => Promise<void> | void;
}

export function RefundRequestPanel({ onSubmit }: RefundRequestPanelProps) {
  const [chargeId, setChargeId] = useState("");
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!chargeId || !onSubmit) return;
    setIsSubmitting(true);
    try {
      await onSubmit(chargeId, reason);
      setChargeId("");
      setReason("");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`space-y-3 rounded-lg border p-4 ${SEMANTIC_COLORS.BACKGROUND.PRIMARY} ${SEMANTIC_COLORS.BORDER.DEFAULT}`}>
      <h3 className="text-sm font-semibold">Process Refund</h3>
      <p className={`text-xs ${SEMANTIC_COLORS.TEXT.TERTIARY}`}>
        Enter a Stripe charge ID and optional reason. Full refund logic will be wired up after webhook integration.
      </p>
      <Input
        placeholder="ch_123..."
        value={chargeId}
        onChange={(event) => setChargeId(event.target.value)}
      />
      <Textarea
        placeholder="Optional reason"
        value={reason}
        onChange={(event) => setReason(event.target.value)}
        rows={3}
      />
      <div className="flex justify-end">
        <Button onClick={handleSubmit} disabled={isSubmitting || !chargeId}>
          {isSubmitting ? "Submitting..." : "Submit Refund"}
        </Button>
      </div>
    </div>
  );
}
