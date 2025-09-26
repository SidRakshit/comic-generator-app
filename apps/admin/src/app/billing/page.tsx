import { AdminShell } from "@/components/layout/admin-shell";
import { SEMANTIC_COLORS } from "@repo/common-types";

export default function BillingPage() {
  return (
    <AdminShell title="Billing">
      <div className={`rounded-lg border bg-white p-6 ${SEMANTIC_COLORS.BORDER.DEFAULT}`}>
        <h1 className="text-xl font-semibold">Billing & Credits</h1>
        <p className={`mt-2 text-sm ${SEMANTIC_COLORS.TEXT.TERTIARY}`}>
          Coming soon: credit purchase history, refunds, and revenue analytics once Stripe integration is complete.
        </p>
      </div>
    </AdminShell>
  );
}
