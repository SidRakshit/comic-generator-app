import { NextRequest, NextResponse } from "next/server";
import { API_ENDPOINTS } from "@repo/common-types";
import { fetchAdminJson } from "@/lib/api-client";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const stripeChargeId = body?.stripeChargeId as string | undefined;
    const reason = body?.reason as string | undefined;

    if (!stripeChargeId) {
      return NextResponse.json({ error: "stripeChargeId is required" }, { status: 400 });
    }

    const refund = await fetchAdminJson(API_ENDPOINTS.BILLING_REFUND, {
      method: "POST",
      body: JSON.stringify({ stripeChargeId, reason }),
    });

    return NextResponse.json(refund, { status: 202 });
  } catch (error) {
    console.error("Failed to process refund proxy request", error);
    return NextResponse.json({ error: "Failed to process refund" }, { status: 500 });
  }
}
