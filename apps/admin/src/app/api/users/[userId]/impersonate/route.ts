import { NextRequest, NextResponse } from "next/server";
import { API_ENDPOINTS } from "@repo/common-types";
import { fetchAdminJson } from "@/lib/api-client";

type RouteParams = Record<string, string | string[] | undefined>;

export async function POST(
  _request: NextRequest,
  context: { params?: Promise<RouteParams> }
) {
  const params = context.params ? await context.params : undefined;
  const userIdParam = params?.userId;
  const userId = Array.isArray(userIdParam) ? userIdParam[0] : userIdParam;
  if (!userId) {
    return NextResponse.json({ error: "User id is required" }, { status: 400 });
  }

  try {
    const result = await fetchAdminJson(API_ENDPOINTS.ADMIN_IMPERSONATE(userId), {
      method: "POST",
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("Failed to create impersonation token", error);
    return NextResponse.json({ error: "Failed to create impersonation token" }, { status: 500 });
  }
}
