"use client";

import { useState } from "react";
import { AdminShell } from "@/components/layout/admin-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";
import { Button } from "@repo/ui/button";
import { SEMANTIC_COLORS } from "@repo/common-types";
import { Input } from "@repo/ui/input";

const DATE_PRESETS = ["7d", "30d", "90d"];

export default function AnalyticsPage() {
  const [preset, setPreset] = useState("30d");

  return (
    <AdminShell title="Analytics">
      <div className="space-y-6">
        <div className={`rounded-lg border bg-white p-6 ${SEMANTIC_COLORS.BORDER.DEFAULT}`}>
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-xl font-semibold">Analytics & Reporting</h1>
              <p className={`mt-2 text-sm ${SEMANTIC_COLORS.TEXT.TERTIARY}`}>
                Purchase funnel and cohort charts will render here once the analytics endpoints go live.
              </p>
            </div>
            <div className="flex items-center gap-2">
              {DATE_PRESETS.map((value) => (
                <Button
                  key={value}
                  variant={value === preset ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPreset(value)}
                >
                  {value}
                </Button>
              ))}
              <Input type="date" className="w-36" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Card className={`${SEMANTIC_COLORS.BACKGROUND.PRIMARY}`}>
            <CardHeader>
              <CardTitle>Revenue Cohorts</CardTitle>
            </CardHeader>
            <CardContent className={`text-sm ${SEMANTIC_COLORS.TEXT.TERTIARY}`}>
              Stripe purchase data will map into a cohort chart, helping you track LTV by signup month.
            </CardContent>
          </Card>

          <Card className={`${SEMANTIC_COLORS.BACKGROUND.PRIMARY}`}>
            <CardHeader>
              <CardTitle>Conversion Funnel</CardTitle>
            </CardHeader>
            <CardContent className={`text-sm ${SEMANTIC_COLORS.TEXT.TERTIARY}`}>
              Once API analytics are implemented, this card will show drop-off from signup → first panel → purchase.
            </CardContent>
          </Card>

          <Card className={`${SEMANTIC_COLORS.BACKGROUND.PRIMARY}`}>
            <CardHeader>
              <CardTitle>Top Purchasers</CardTitle>
            </CardHeader>
            <CardContent className={`text-sm ${SEMANTIC_COLORS.TEXT.TERTIARY}`}>
              A leaderboard of high-value users will appear here alongside quick links to manage their accounts.
            </CardContent>
          </Card>

          <Card className={`${SEMANTIC_COLORS.BACKGROUND.PRIMARY}`}>
            <CardHeader>
              <CardTitle>Panel Usage Heatmap</CardTitle>
            </CardHeader>
            <CardContent className={`text-sm ${SEMANTIC_COLORS.TEXT.TERTIARY}`}>
              Panel usage data will fuel a heatmap to highlight your busiest days and content spikes.
            </CardContent>
          </Card>
        </div>

        <Card className={`${SEMANTIC_COLORS.BACKGROUND.PRIMARY}`}>
          <CardHeader>
            <CardTitle>Implementation Notes</CardTitle>
          </CardHeader>
          <CardContent className={`text-sm ${SEMANTIC_COLORS.TEXT.TERTIARY}`}>
            <ul className="list-disc space-y-1 pl-5">
              <li>Build analytics endpoints that aggregate credit purchases and panel usage.</li>
              <li>Feed those endpoints into a charting library (e.g., Recharts) to replace the placeholder cards.</li>
              <li>Add advanced filters (segments, cohorts) once the backend query layer is complete.</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </AdminShell>
  );
}
