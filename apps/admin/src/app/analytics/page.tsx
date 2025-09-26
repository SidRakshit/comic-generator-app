import { AdminShell } from "@/components/layout/admin-shell";
import { fetchAdminJson } from "@/lib/api-client";
import { API_ENDPOINTS, SEMANTIC_COLORS, AdminAnalyticsOverview } from "@repo/common-types";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";

async function loadAnalytics(): Promise<AdminAnalyticsOverview> {
  try {
    return await fetchAdminJson<AdminAnalyticsOverview>(API_ENDPOINTS.ADMIN_ANALYTICS_OVERVIEW);
  } catch (error) {
    console.error("Failed to load analytics overview", error);
    return {
      revenueByMonth: [],
      conversionFunnel: [],
      topPurchasers: [],
      panelUsageByDay: [],
    };
  }
}

export default async function AnalyticsPage() {
  const analytics = await loadAnalytics();

  return (
    <AdminShell title="Analytics">
      <div className="space-y-6">
        <div className={`rounded-lg border bg-white p-6 ${SEMANTIC_COLORS.BORDER.DEFAULT}`}>
          <h1 className="text-xl font-semibold">Analytics & Reporting</h1>
          <p className={`mt-2 text-sm ${SEMANTIC_COLORS.TEXT.TERTIARY}`}>
            Live metrics sourced from the admin API. Export and charting hooks can layer on top of the raw data below.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Card className={`${SEMANTIC_COLORS.BACKGROUND.PRIMARY}`}>
            <CardHeader>
              <CardTitle>Conversion Funnel</CardTitle>
            </CardHeader>
            <CardContent>
              {analytics.conversionFunnel.length === 0 ? (
                <p className={`text-sm ${SEMANTIC_COLORS.TEXT.TERTIARY}`}>No funnel data captured yet.</p>
              ) : (
                <ol className="space-y-2">
                  {analytics.conversionFunnel.map((stage) => (
                    <li key={stage.stage} className="flex items-center justify-between text-sm">
                      <span className={SEMANTIC_COLORS.TEXT.SECONDARY}>{stage.stage.replace(/_/g, " ")}</span>
                      <span className="font-semibold">{stage.count.toLocaleString()}</span>
                    </li>
                  ))}
                </ol>
              )}
            </CardContent>
          </Card>

          <Card className={`${SEMANTIC_COLORS.BACKGROUND.PRIMARY}`}>
            <CardHeader>
              <CardTitle>Revenue By Month</CardTitle>
            </CardHeader>
            <CardContent>
              {analytics.revenueByMonth.length === 0 ? (
                <p className={`text-sm ${SEMANTIC_COLORS.TEXT.TERTIARY}`}>Revenue data will appear once purchases complete.</p>
              ) : (
                <table className="w-full text-sm">
                  <thead className={`text-left ${SEMANTIC_COLORS.TEXT.TERTIARY}`}>
                    <tr>
                      <th className="py-2">Month</th>
                      <th className="py-2 text-right">Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.revenueByMonth.map((row) => (
                      <tr key={row.month} className="border-t">
                        <td className="py-2">{row.month}</td>
                        <td className="py-2 text-right">${row.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </CardContent>
          </Card>

          <Card className={`${SEMANTIC_COLORS.BACKGROUND.PRIMARY} lg:col-span-2`}>
            <CardHeader>
              <CardTitle>Top Purchasers</CardTitle>
            </CardHeader>
            <CardContent>
              {analytics.topPurchasers.length === 0 ? (
                <p className={`text-sm ${SEMANTIC_COLORS.TEXT.TERTIARY}`}>High value customers will appear as soon as purchases are recorded.</p>
              ) : (
                <table className="w-full text-sm">
                  <thead className={`text-left ${SEMANTIC_COLORS.TEXT.TERTIARY}`}>
                    <tr>
                      <th className="py-2">User</th>
                      <th className="py-2">Email</th>
                      <th className="py-2 text-right">Total Spent</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.topPurchasers.map((row) => (
                      <tr key={row.user_id} className="border-t">
                        <td className="py-2">{row.user_id}</td>
                        <td className="py-2">{row.email ?? "Unknown"}</td>
                        <td className="py-2 text-right">${row.total_spent.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </CardContent>
          </Card>

          <Card className={`${SEMANTIC_COLORS.BACKGROUND.PRIMARY} lg:col-span-2`}>
            <CardHeader>
              <CardTitle>Panel Usage (Last 30 Days)</CardTitle>
            </CardHeader>
            <CardContent>
              {analytics.panelUsageByDay.length === 0 ? (
                <p className={`text-sm ${SEMANTIC_COLORS.TEXT.TERTIARY}`}>Usage data will populate once panel consumption is tracked.</p>
              ) : (
                <div className="max-h-64 overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead className={`text-left ${SEMANTIC_COLORS.TEXT.TERTIARY}`}>
                      <tr>
                        <th className="py-2">Day</th>
                        <th className="py-2 text-right">Panels</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analytics.panelUsageByDay.map((row) => (
                        <tr key={row.day} className="border-t">
                          <td className="py-2">{row.day}</td>
                          <td className="py-2 text-right">{row.panels.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminShell>
  );
}
