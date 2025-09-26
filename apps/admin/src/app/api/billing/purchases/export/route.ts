import { NextRequest, NextResponse } from "next/server";
import { API_ENDPOINTS } from "@repo/common-types";
import { ADMIN_API_BASE_URL, getAdminApiHeaders } from "@/lib/api-client";

export async function GET(request: NextRequest) {
  if (!ADMIN_API_BASE_URL) {
    return NextResponse.json({ error: "Admin API base URL is not configured" }, { status: 500 });
  }

  const searchParams = request.nextUrl.searchParams;
  const limitParam = searchParams.get("limit");
  const query = limitParam ? `?limit=${encodeURIComponent(limitParam)}` : "";
  const base = ADMIN_API_BASE_URL.replace(/\/$/, "");

  try {
    const response = await fetch(`${base}${API_ENDPOINTS.ADMIN_BILLING_EXPORT}${query}`, {
      headers: {
        ...getAdminApiHeaders(),
      },
    });

    if (!response.ok) {
      return NextResponse.json({ error: "Failed to export purchase history" }, { status: response.status });
    }

    const headers = new Headers(response.headers);
    headers.set("Cache-Control", "no-store");

    return new NextResponse(response.body, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error("Failed to proxy purchase export", error);
    return NextResponse.json({ error: "Failed to export purchase history" }, { status: 500 });
  }
}
