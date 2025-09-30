"use client";

import { useMemo, useState } from "react";
import { PurchaseHistoryTable, PurchaseHistoryRow } from "./purchase-history-table";
import { RefundRequestPanel } from "./refund-request-panel";
import { Button } from "@repo/ui/button";
import { SEMANTIC_COLORS, API_ENDPOINTS } from "@repo/common-types";

interface BillingClientProps {
  purchases: PurchaseHistoryRow[];
}

export function BillingClient({ purchases }: BillingClientProps) {
  const [selectedPurchase, setSelectedPurchase] = useState<string | null>(null);
  const [refundState, setRefundState] = useState<{ status: "idle" | "success" | "error"; message?: string | null }>({
    status: "idle",
    message: null,
  });

  const selectedRow = useMemo(
    () => purchases.find((row) => row.purchase_id === selectedPurchase) ?? null,
    [purchases, selectedPurchase]
  );

  const handleExport = () => {
    window.open(API_ENDPOINTS.ADMIN_BILLING_EXPORT, "_blank", "noopener");
  };

  const handleRefund = async (chargeId: string, reason: string) => {
    setRefundState({ status: "idle", message: null });
    try {
      const response = await fetch(API_ENDPOINTS.BILLING_REFUND, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stripeChargeId: chargeId, reason }),
      });

      if (!response.ok) {
        throw new Error(`Refund request failed with status ${response.status}`);
      }

      setRefundState({ status: "success", message: "Refund request forwarded to Stripe." });
    } catch (error) {
      console.error("Failed to initiate refund", error);
      setRefundState({ status: "error", message: "Unable to process refund. Check logs for details." });
    }
  };

  return (
    <div className="space-y-6">
      <div className={`rounded-lg border bg-white p-6 ${SEMANTIC_COLORS.BORDER.DEFAULT}`}>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-xl font-semibold">Billing & Credits</h1>
            <p className={`mt-2 text-sm ${SEMANTIC_COLORS.TEXT.TERTIARY}`}>
              Track credit purchases and manage refunds. Data is fetched from the admin API every time you load the page.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleExport}>
              Export History
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.open("https://dashboard.stripe.com/", "_blank", "noopener")}
            >
              Stripe Dashboard
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2 space-y-4">
          <PurchaseHistoryTable
            rows={purchases}
            loading={false}
            onSelect={(purchaseId) => setSelectedPurchase(purchaseId)}
          />
          <div className={`rounded-lg border p-4 ${SEMANTIC_COLORS.BACKGROUND.PRIMARY} ${SEMANTIC_COLORS.BORDER.DEFAULT}`}>
            <h3 className="text-sm font-semibold">Coming up next</h3>
            <ul className={`mt-2 list-disc space-y-1 pl-5 text-xs ${SEMANTIC_COLORS.TEXT.TERTIARY}`}>
              <li>Surface failed payments and retry status directly from Stripe events.</li>
              <li>Wire up CSV export and refund submission via the admin API.</li>
              <li>Auto-refresh this table when new webhook events arrive.</li>
            </ul>
          </div>
        </div>
        <div className="space-y-4">
          <RefundRequestPanel
            onSubmit={handleRefund}
            status={refundState.status}
            message={refundState.message ?? null}
          />
          <div className={`rounded-lg border p-4 ${SEMANTIC_COLORS.BACKGROUND.PRIMARY} ${SEMANTIC_COLORS.BORDER.DEFAULT}`}>
            <h3 className="text-sm font-semibold">Selected Purchase</h3>
            {selectedRow ? (
              <dl className={`mt-3 space-y-2 text-xs ${SEMANTIC_COLORS.TEXT.TERTIARY}`}>
                <div>
                  <dt className="font-medium text-slate-700">User</dt>
                  <dd>{selectedRow.user_email ?? "Unknown"}</dd>
                </div>
                <div>
                  <dt className="font-medium text-slate-700">Amount</dt>
                  <dd>${selectedRow.amount_dollars.toFixed(2)}</dd>
                </div>
                <div>
                  <dt className="font-medium text-slate-700">Panels</dt>
                  <dd>{selectedRow.panels_purchased.toLocaleString()}</dd>
                </div>
                <div>
                  <dt className="font-medium text-slate-700">Stripe Charge</dt>
                  <dd>{selectedRow.stripe_charge_id ?? "—"}</dd>
                </div>
              </dl>
            ) : (
              <p className={`mt-3 text-xs ${SEMANTIC_COLORS.TEXT.TERTIARY}`}>
                Select a purchase row to see details.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
