"use client";

import { AdminShell } from "@/components/layout/admin-shell";
import { UserTable, UserTableRow } from "@/components/users/user-table";
import { SEMANTIC_COLORS } from "@repo/common-types";
import { Input } from "@repo/ui/input";
import { Button } from "@repo/ui/button";
import { useState } from "react";

const MOCK_USERS: UserTableRow[] = [
  {
    user_id: "user-1",
    email: "alice@example.com",
    username: "alice",
    panel_balance: 42,
    totalSpent: 25,
    lastPurchase: "2024-03-05",
  },
  {
    user_id: "user-2",
    email: "bob@example.com",
    username: "bob",
    panel_balance: 0,
    totalSpent: 15,
    lastPurchase: "2024-02-28",
  },
];

export default function UsersPage() {
  const [query, setQuery] = useState("");
  const filteredUsers = MOCK_USERS.filter((user) =>
    [user.email, user.username].some((value) => value?.toLowerCase().includes(query.toLowerCase()))
  );

  const handleBulkGrantPanels = (userIds: string[]) => {
    console.log("Grant panels to:", userIds);
  };

  const handleBulkEmail = (userIds: string[]) => {
    console.log("Email users:", userIds);
  };

  return (
    <AdminShell title="Users">
      <div className={`space-y-6`}>
        <div className={`rounded-lg border bg-white p-6 ${SEMANTIC_COLORS.BORDER.DEFAULT}`}>
          <h1 className="text-xl font-semibold">User Management</h1>
          <p className={`mt-2 text-sm ${SEMANTIC_COLORS.TEXT.TERTIARY}`}>
            Search, filter, and act on your user base. API integration will replace the mock data once endpoints land.
          </p>

          <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex w-full max-w-md items-center gap-2">
              <Input
                placeholder="Search by email or username"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
              <Button variant="outline" onClick={() => setQuery("")}>
                Clear
              </Button>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm">
                Export CSV
              </Button>
              <Button variant="ghost" size="sm">
                Advanced Filters
              </Button>
            </div>
          </div>
        </div>

        <UserTable
          rows={filteredUsers}
          loading={false}
          onBulkGrantPanels={handleBulkGrantPanels}
          onBulkEmail={handleBulkEmail}
        />
      </div>
    </AdminShell>
  );
}
