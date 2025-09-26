import { NextRequest, NextResponse } from "next/server";
import { API_ENDPOINTS } from "@repo/common-types";
import { fetchAdminJson } from "@/lib/api-client";

export async function POST(
  _request: NextRequest,
  { params }: { params: { userId: string } }
) {
  const userId = params.userId;
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
