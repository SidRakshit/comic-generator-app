"use client";

import { useMemo, useState } from "react";
import { AdminShell } from "@/components/layout/admin-shell";
import { PurchaseHistoryTable, PurchaseHistoryRow } from "@/components/billing/purchase-history-table";
import { RefundRequestPanel } from "@/components/billing/refund-request-panel";
import { SEMANTIC_COLORS } from "@repo/common-types";
import { Button } from "@repo/ui/button";

const MOCK_PURCHASES: PurchaseHistoryRow[] = [
  {
    purchase_id: "purchase-1",
    user_email: "alice@example.com",
    amount_dollars: 25,
    panels_purchased: 100,
    created_at: "2024-03-05T14:23:00Z",
    stripe_charge_id: "ch_abc123",
    status: "succeeded",
  },
  {
    purchase_id: "purchase-2",
    user_email: "bob@example.com",
    amount_dollars: 10,
    panels_purchased: 40,
    created_at: "2024-03-02T09:12:00Z",
    stripe_charge_id: "ch_def456",
    status: "pending",
  },
];

export default function BillingPage() {
  const [selectedPurchase, setSelectedPurchase] = useState<string | null>(null);
  const selectedRow = useMemo(
    () => MOCK_PURCHASES.find((row) => row.purchase_id === selectedPurchase) ?? null,
    [selectedPurchase]
  );

  return (
    <AdminShell title="Billing">
      <div className="space-y-6">
        <div className={`rounded-lg border bg-white p-6 ${SEMANTIC_COLORS.BORDER.DEFAULT}`}>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-xl font-semibold">Billing & Credits</h1>
              <p className={`mt-2 text-sm ${SEMANTIC_COLORS.TEXT.TERTIARY}`}>
                Track credit purchases and manage refunds. Data is currently mocked until Stripe events are wired.
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                Export History
              </Button>
              <Button variant="ghost" size="sm">
                Stripe Dashboard
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <div className="xl:col-span-2 space-y-4">
            <PurchaseHistoryTable
              rows={MOCK_PURCHASES}
              loading={false}
              onSelect={(purchaseId) => setSelectedPurchase(purchaseId)}
            />
            <div className={`rounded-lg border p-4 ${SEMANTIC_COLORS.BACKGROUND.PRIMARY} ${SEMANTIC_COLORS.BORDER.DEFAULT}`}>
              <h3 className="text-sm font-semibold">Coming up next</h3>
              <ul className={`mt-2 list-disc space-y-1 pl-5 text-xs ${SEMANTIC_COLORS.TEXT.TERTIARY}`}>
                <li>Replace mocked data with Stripe webhook-driven purchase history.</li>
                <li>Surface failed payments and retry status in this table.</li>
                <li>Enable CSV export and refund submission via the backend admin endpoints.</li>
              </ul>
            </div>
          </div>
          <div className="space-y-4">
            <RefundRequestPanel
              onSubmit={async (chargeId, reason) => {
                console.log("Refund request", chargeId, reason);
              }}
            />
            <div className={`rounded-lg border p-4 ${SEMANTIC_COLORS.BACKGROUND.PRIMARY} ${SEMANTIC_COLORS.BORDER.DEFAULT}`}>
              <h3 className="text-sm font-semibold">Selected Purchase</h3>
              {selectedRow ? (
                <dl className={`mt-3 space-y-2 text-xs ${SEMANTIC_COLORS.TEXT.TERTIARY}`}>
                  <div>
                    <dt className="font-medium text-slate-700">User</dt>
                    <dd>{selectedRow.user_email}</dd>
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
    </AdminShell>
  );
}
