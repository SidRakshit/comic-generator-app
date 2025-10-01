import { AdminShell } from "@/components/layout/admin-shell";
import { BillingClient } from "@/components/billing/billing-client";
import { fetchAdminJson } from "@/lib/api-client";
import { PurchaseHistoryRow } from "@/components/billing/purchase-history-table";

async function fetchPurchases(): Promise<PurchaseHistoryRow[]> {
  try {
    return await fetchAdminJson<PurchaseHistoryRow[]>("/admin/billing/purchases");
  } catch (error) {
    console.warn("Failed to fetch purchase history", error);
    return [];
  }
}

export default async function BillingPage() {
  const purchases = await fetchPurchases();

  return (
    <AdminShell title="Billing">
      <BillingClient purchases={purchases} />
    </AdminShell>
  );
}
