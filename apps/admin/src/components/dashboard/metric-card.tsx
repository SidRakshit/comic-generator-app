import { SEMANTIC_COLORS } from "@repo/common-types";

interface MetricCardProps {
  title: string;
  value: string;
  helper?: string;
}

export function MetricCard({ title, value, helper }: MetricCardProps) {
  return (
    <div
      className={`rounded-lg border p-4 shadow-sm ${SEMANTIC_COLORS.BACKGROUND.PRIMARY} ${SEMANTIC_COLORS.BORDER.DEFAULT}`}
    >
      <p className={`text-sm font-medium ${SEMANTIC_COLORS.TEXT.SECONDARY}`}>{title}</p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
      {helper ? (
        <p className={`mt-1 text-xs ${SEMANTIC_COLORS.TEXT.TERTIARY}`}>{helper}</p>
      ) : null}
    </div>
  );
}
