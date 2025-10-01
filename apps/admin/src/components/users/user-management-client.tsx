"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { UserTable, UserTableRow } from "./user-table";
import { Input } from "@repo/ui/input";
import { Button } from "@repo/ui/button";
import { SEMANTIC_COLORS } from "@repo/common-types";

interface UserManagementClientProps {
  initialRows: UserTableRow[];
  initialQuery?: string;
}

export function UserManagementClient({ initialRows, initialQuery = "" }: UserManagementClientProps) {
  const [query, setQuery] = useState(initialQuery);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [impersonationState, setImpersonationState] = useState<{
    status: "idle" | "success" | "error";
    message?: string | null;
  }>({ status: "idle", message: null });

  const filteredRows = useMemo(() => {
    if (!query) return initialRows;
    const lowered = query.toLowerCase();
    return initialRows.filter((row) =>
      [row.email, row.username].some((value) => value?.toLowerCase().includes(lowered))
    );
  }, [initialRows, query]);

  const applySearch = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set("search", value);
    } else {
      params.delete("search");
    }
    startTransition(() => {
      router.replace(`/users?${params.toString()}`);
    });
  };

  const handleBulkGrantPanels = (userIds: string[]) => {
    console.log("Grant panels to:", userIds);
  };

  const handleBulkEmail = (userIds: string[]) => {
    console.log("Email users:", userIds);
  };

  const handleImpersonate = async (userId: string) => {
    setImpersonationState({ status: "idle", message: null });
    try {
      const response = await fetch(`/api/users/${userId}/impersonate`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error(`Failed with status ${response.status}`);
      }

      const data = (await response.json()) as {
        redirectUrl?: string;
        impersonationToken?: string;
        frontendUrl?: string;
      };

      const redirectUrl = data.redirectUrl ??
        (data.frontendUrl && data.impersonationToken
          ? `${data.frontendUrl.replace(/\/$/, "")}/impersonate?token=${encodeURIComponent(data.impersonationToken)}`
          : null);

      if (redirectUrl) {
        window.open(redirectUrl, "_blank", "noopener");
        setImpersonationState({ status: "success", message: "Impersonation window opened in a new tab." });
      } else {
        throw new Error("Missing redirect URL");
      }
    } catch (error) {
      console.error("Failed to start impersonation", error);
      setImpersonationState({ status: "error", message: "Unable to open impersonation session." });
    }
  };

  const handleView = (userId: string) => {
    router.push(`/users/${userId}`);
  };

  return (
    <div className="space-y-6">
      <div className={`rounded-lg border bg-white p-6 ${SEMANTIC_COLORS.BORDER.DEFAULT}`}>
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex w-full max-w-md items-center gap-2">
            <Input
              placeholder="Search by email or username"
              value={query}
              onChange={(event) => {
                const value = event.target.value;
                setQuery(value);
                applySearch(value);
              }}
            />
            <Button
              variant="outline"
              onClick={() => {
                setQuery("");
                applySearch("");
              }}
              disabled={isPending}
            >
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

      {impersonationState.status !== "idle" && impersonationState.message ? (
        <div
          className={`rounded-lg border px-4 py-3 text-sm ${
            impersonationState.status === "success"
              ? `${SEMANTIC_COLORS.SUCCESS.BACKGROUND} ${SEMANTIC_COLORS.SUCCESS.BORDER} ${SEMANTIC_COLORS.SUCCESS.TEXT}`
              : `${SEMANTIC_COLORS.ERROR.BACKGROUND} ${SEMANTIC_COLORS.ERROR.BORDER} ${SEMANTIC_COLORS.ERROR.TEXT}`
          }`}
        >
          {impersonationState.message}
        </div>
      ) : null}

      <UserTable
        rows={filteredRows}
        loading={isPending}
        onBulkGrantPanels={handleBulkGrantPanels}
        onBulkEmail={handleBulkEmail}
        onImpersonate={handleImpersonate}
        onView={handleView}
      />
    </div>
  );
}
