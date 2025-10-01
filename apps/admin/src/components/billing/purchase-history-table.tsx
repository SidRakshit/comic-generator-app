"use client";

import { useMemo, useState } from "react";
import { Button } from "@repo/ui/button";
import { SEMANTIC_COLORS } from "@repo/common-types";

export interface PurchaseHistoryRow {
  purchase_id: string;
  user_email?: string | null;
  amount_dollars: number;
  panels_purchased: number;
  created_at: string;
  stripe_charge_id?: string;
  status?: "succeeded" | "pending" | "refunded";
}

interface PurchaseHistoryTableProps {
  rows: PurchaseHistoryRow[];
  loading?: boolean;
  onSelect?: (purchaseId: string) => void;
}

export function PurchaseHistoryTable({ rows, loading, onSelect }: PurchaseHistoryTableProps) {
  const [sortKey, setSortKey] = useState<"created_at" | "amount">("created_at");
  const [descending, setDescending] = useState<boolean>(true);

  const sortedRows = useMemo(() => {
    const sortable = [...rows];
    sortable.sort((a, b) => {
      if (sortKey === "amount") {
        return descending ? b.amount_dollars - a.amount_dollars : a.amount_dollars - b.amount_dollars;
      }
      const tsA = new Date(a.created_at).getTime();
      const tsB = new Date(b.created_at).getTime();
      return descending ? tsB - tsA : tsA - tsB;
    });
    return sortable;
  }, [rows, sortKey, descending]);

  const toggleSort = (key: "created_at" | "amount") => {
    if (sortKey === key) {
      setDescending((value) => !value);
    } else {
      setSortKey(key);
      setDescending(true);
    }
  };

  return (
    <div className={`rounded-lg border ${SEMANTIC_COLORS.BORDER.DEFAULT}`}>
      <div className={`overflow-x-auto ${SEMANTIC_COLORS.BACKGROUND.PRIMARY}`}>
        <table className="min-w-full text-sm">
          <thead className={`text-left ${SEMANTIC_COLORS.BACKGROUND.SECONDARY}`}>
            <tr>
              <th className="px-4 py-2">User</th>
              <th className="px-4 py-2 cursor-pointer" onClick={() => toggleSort("amount")}>
                Amount {sortKey === "amount" ? (descending ? "↓" : "↑") : null}
              </th>
              <th className="px-4 py-2">Panels</th>
              <th className="px-4 py-2 cursor-pointer" onClick={() => toggleSort("created_at")}>
                Purchased {sortKey === "created_at" ? (descending ? "↓" : "↑") : null}
              </th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedRows.length === 0 ? (
              <tr>
                <td colSpan={6} className={`px-4 py-8 text-center ${SEMANTIC_COLORS.TEXT.TERTIARY}`}>
                  {loading ? "Fetching purchases..." : "No purchases yet."}
                </td>
              </tr>
            ) : (
              sortedRows.map((row) => (
                <tr key={row.purchase_id} className="border-t">
                  <td className="px-4 py-2">{row.user_email ?? "Unknown"}</td>
                  <td className="px-4 py-2">${row.amount_dollars.toFixed(2)}</td>
                  <td className="px-4 py-2">{row.panels_purchased.toLocaleString()}</td>
                  <td className="px-4 py-2">{new Date(row.created_at).toLocaleString()}</td>
                  <td className="px-4 py-2 capitalize">{row.status ?? "succeeded"}</td>
                  <td className="px-4 py-2 text-right">
                    <Button variant="ghost" size="sm" onClick={() => onSelect?.(row.purchase_id)}>
                      View
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
