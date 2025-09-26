"use client";

import { useMemo, useState } from "react";
import { Button } from "@repo/ui/button";
import { SEMANTIC_COLORS, UI_CONSTANTS } from "@repo/common-types";

export interface UserTableRow {
  user_id: string;
  email?: string;
  username?: string;
  panel_balance: number;
  totalSpent: number;
  lastPurchase?: string;
}

interface UserTableProps {
  rows: UserTableRow[];
  loading?: boolean;
  onBulkGrantPanels?: (userIds: string[]) => void;
  onBulkEmail?: (userIds: string[]) => void;
  onImpersonate?: (userId: string) => void;
  onView?: (userId: string) => void;
}

export function UserTable({ rows, loading, onBulkGrantPanels, onBulkEmail, onImpersonate, onView }: UserTableProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const allSelected = useMemo(() => rows.length > 0 && selected.size === rows.length, [rows, selected]);

  const toggleRow = (userId: string) => {
    setSelected((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(userId)) {
        newSet.delete(userId);
      } else {
        newSet.add(userId);
      }
      return newSet;
    });
  };

  const toggleAll = () => {
    if (allSelected) {
      setSelected(new Set());
    } else {
      setSelected(new Set(rows.map((row) => row.user_id)));
    }
  };

  const selectedIds = useMemo(() => Array.from(selected), [selected]);

  return (
    <div className={`rounded-lg border ${SEMANTIC_COLORS.BORDER.DEFAULT} ${SEMANTIC_COLORS.BACKGROUND.PRIMARY}`}>
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            disabled={selectedIds.length === 0 || !onBulkGrantPanels}
            onClick={() => onBulkGrantPanels?.(selectedIds)}
          >
            Grant Panels
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={selectedIds.length === 0 || !onBulkEmail}
            onClick={() => onBulkEmail?.(selectedIds)}
          >
            Send Email
          </Button>
        </div>
        <p className={`text-xs ${SEMANTIC_COLORS.TEXT.TERTIARY}`}>
          {selectedIds.length} selected
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className={`text-left ${SEMANTIC_COLORS.BACKGROUND.SECONDARY}`}>
            <tr>
              <th className="px-4 py-2">
                <input type="checkbox" checked={allSelected} onChange={toggleAll} />
              </th>
              <th className="px-4 py-2">Email</th>
              <th className="px-4 py-2">Username</th>
              <th className="px-4 py-2">Panel Balance</th>
              <th className="px-4 py-2">Total Spent</th>
              <th className="px-4 py-2">Last Purchase</th>
              <th className="px-4 py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={7} className={`px-4 py-8 text-center ${SEMANTIC_COLORS.TEXT.TERTIARY}`}>
                  {loading ? "Loading users..." : "No users match the current filters."}
                </td>
              </tr>
            ) : (
              rows.map((row) => {
                const isChecked = selected.has(row.user_id);
                return (
                  <tr key={row.user_id} className="border-t">
                    <td className="px-4 py-2">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleRow(row.user_id)}
                      />
                    </td>
                    <td className="px-4 py-2">{row.email ?? "—"}</td>
                    <td className="px-4 py-2">{row.username ?? "—"}</td>
                    <td className="px-4 py-2">{row.panel_balance.toLocaleString()}</td>
                    <td className="px-4 py-2">${row.totalSpent.toFixed(2)}</td>
                    <td className="px-4 py-2">{row.lastPurchase ?? "No purchases"}</td>
                    <td className="px-4 py-2 text-right space-x-2">
                      <Button variant="ghost" size="sm" onClick={() => onImpersonate?.(row.user_id)}>
                        Impersonate
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => onView?.(row.user_id)}>
                        View
                      </Button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
