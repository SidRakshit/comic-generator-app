import { AdminShell } from "@/components/layout/admin-shell";
import { SEMANTIC_COLORS } from "@repo/common-types";

export default function UsersPage() {
  return (
    <AdminShell title="Users">
      <div className={`rounded-lg border bg-white p-6 ${SEMANTIC_COLORS.BORDER.DEFAULT}`}>
        <h1 className="text-xl font-semibold">User Management</h1>
        <p className={`mt-2 text-sm ${SEMANTIC_COLORS.TEXT.TERTIARY}`}>
          Detailed user tables and impersonation tools will live here. For now, this page is a placeholder while the
          admin API endpoints come online.
        </p>
      </div>
    </AdminShell>
  );
}
