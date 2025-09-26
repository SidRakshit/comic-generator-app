import { AdminShell } from "@/components/layout/admin-shell";
import { SEMANTIC_COLORS } from "@repo/common-types";

export default function AuditLogsPage() {
  return (
    <AdminShell title="Audit Logs">
      <div className={`rounded-lg border bg-white p-6 ${SEMANTIC_COLORS.BORDER.DEFAULT}`}>
        <h1 className="text-xl font-semibold">Audit Trail</h1>
        <p className={`mt-2 text-sm ${SEMANTIC_COLORS.TEXT.TERTIARY}`}>
          The comprehensive action log will populate here after event tracking is implemented.
        </p>
      </div>
    </AdminShell>
  );
}
