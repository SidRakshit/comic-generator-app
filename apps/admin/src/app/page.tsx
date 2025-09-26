import { API_CONFIG, SEMANTIC_COLORS, UI_CONSTANTS } from "@repo/common-types";
import { AdminShell } from "@/components/layout/admin-shell";

interface DashboardData {
  userMetrics: {
    totalUsers: number;
    purchasingUsers: number;
    freeUsers: number;
  };
  revenueMetrics: {
    totalRevenue: number;
    averagePurchaseValue: number;
  };
  usageMetrics: {
    totalPanelsCreated: number;
    usersWithLowBalance: number;
  };
}

const FALLBACK_DASHBOARD: DashboardData = {
  userMetrics: {
    totalUsers: 0,
    purchasingUsers: 0,
    freeUsers: 0,
  },
  revenueMetrics: {
    totalRevenue: 0,
    averagePurchaseValue: 0,
  },
  usageMetrics: {
    totalPanelsCreated: 0,
    usersWithLowBalance: 0,
  },
};

async function fetchDashboardData(): Promise<DashboardData | null> {
  const baseUrl =
    process.env.ADMIN_API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || API_CONFIG.DEFAULT_BACKEND_URL;

  try {
    const response = await fetch(`${baseUrl.replace(/\/$/, "")}/admin/dashboard`, {
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      console.warn(`Admin dashboard API responded with ${response.status}`);
      return null;
    }

    const data = (await response.json()) as DashboardData;
    return data;
  } catch (error) {
    console.warn("Failed to fetch admin dashboard data:", error);
    return null;
  }
}

function MetricCard({ title, value, helper }: { title: string; value: string; helper?: string }) {
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

export default async function AdminDashboardPage() {
  const dashboard = (await fetchDashboardData()) ?? FALLBACK_DASHBOARD;

  return (
    <AdminShell title="Dashboard">
      <section className="space-y-6">
        <header>
          <h1 className="text-2xl font-semibold">Key Metrics</h1>
          <p className={`mt-1 text-sm ${SEMANTIC_COLORS.TEXT.TERTIARY}`}>
            Live insight into user growth, revenue, and panel usage. Data updates every visit.
          </p>
        </header>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            title="Total Users"
            value={dashboard.userMetrics.totalUsers.toLocaleString()}
            helper="All registered accounts"
          />
          <MetricCard
            title="Purchasing Users"
            value={dashboard.userMetrics.purchasingUsers.toLocaleString()}
            helper="Users with at least one credit purchase"
          />
          <MetricCard
            title="Total Revenue"
            value={`$${dashboard.revenueMetrics.totalRevenue.toFixed(2)}`}
            helper="Lifetime credit purchases"
          />
          <MetricCard
            title="Panels Created"
            value={dashboard.usageMetrics.totalPanelsCreated.toLocaleString()}
            helper="Across the entire platform"
          />
        </div>

        <div
          className={`rounded-lg border p-6 ${SEMANTIC_COLORS.BACKGROUND.PRIMARY} ${SEMANTIC_COLORS.BORDER.DEFAULT}`}
        >
          <h2 className="text-lg font-semibold">Next Actions</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm">
            <li>Wire Stripe SDK into the admin API to replace placeholder responses.</li>
            <li>Hook up authentication so the admin console fetches live data.</li>
            <li>Replace this callout with charts once analytics endpoints are ready.</li>
          </ul>
        </div>
      </section>
    </AdminShell>
  );
}
