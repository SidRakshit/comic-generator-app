"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";
import { SEMANTIC_COLORS, UI_CONSTANTS } from "@repo/common-types";

interface DashboardChartsProps {
  totalRevenue: number;
  purchasingUsers: number;
  totalPanelsCreated: number;
}

export function DashboardCharts({ totalRevenue, purchasingUsers, totalPanelsCreated }: DashboardChartsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <Card className={`${SEMANTIC_COLORS.BACKGROUND.PRIMARY}`}>
        <CardHeader>
          <CardTitle>Revenue Trend</CardTitle>
        </CardHeader>
        <CardContent className={`text-sm ${SEMANTIC_COLORS.TEXT.TERTIARY}`}>
          <p>
            Stripe integration will power a revenue trend line here. For now, total revenue is
            <strong> ${totalRevenue.toFixed(2)}</strong>.
          </p>
        </CardContent>
      </Card>

      <Card className={`${SEMANTIC_COLORS.BACKGROUND.PRIMARY}`}>
        <CardHeader>
          <CardTitle>Paying Users</CardTitle>
        </CardHeader>
        <CardContent className={`text-sm ${SEMANTIC_COLORS.TEXT.TERTIARY}`}>
          <p>
            <strong>{purchasingUsers.toLocaleString()}</strong> users have purchased panels. A cohort chart will replace this
            once analytics endpoints are available.
          </p>
        </CardContent>
      </Card>

      <Card className={`${SEMANTIC_COLORS.BACKGROUND.PRIMARY}`}>
        <CardHeader>
          <CardTitle>Panels Created</CardTitle>
        </CardHeader>
        <CardContent className={`text-sm ${SEMANTIC_COLORS.TEXT.TERTIARY}`}>
          <p>
            There are <strong>{totalPanelsCreated.toLocaleString()}</strong> panels generated. Hook this card into your usage logs
            to unlock trend visualizations.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
