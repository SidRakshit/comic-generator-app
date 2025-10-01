import { SEMANTIC_COLORS } from "@repo/common-types";
import { AdminShell } from "@/components/layout/admin-shell";
import { MetricCard } from "@/components/dashboard/metric-card";
import { DashboardCharts } from "@/components/dashboard/dashboard-charts";
import { fetchAdminJson } from "@/lib/api-client";

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
  try {
    return await fetchAdminJson<DashboardData>("/admin/dashboard");
  } catch (error) {
    console.warn("Failed to fetch admin dashboard data:", error);
    return null;
  }
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

        <DashboardCharts
          totalRevenue={dashboard.revenueMetrics.totalRevenue}
          purchasingUsers={dashboard.userMetrics.purchasingUsers}
          totalPanelsCreated={dashboard.usageMetrics.totalPanelsCreated}
        />

        <div className={`rounded-lg border p-6 ${SEMANTIC_COLORS.BACKGROUND.PRIMARY} ${SEMANTIC_COLORS.BORDER.DEFAULT}`}>
          <h2 className="text-lg font-semibold">Next Actions</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm">
            <li>Monitor low balance users ({dashboard.usageMetrics.usersWithLowBalance}) and trigger outreach.</li>
            <li>Use the billing export to reconcile revenue with Stripe payouts.</li>
            <li>Review the analytics tab for cohort and usage trends.</li>
          </ul>
        </div>
      </section>
    </AdminShell>
  );
}
