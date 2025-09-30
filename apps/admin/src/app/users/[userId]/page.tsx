import { notFound } from "next/navigation";
import { AdminShell } from "@/components/layout/admin-shell";
import { fetchAdminJson } from "@/lib/api-client";
import { API_ENDPOINTS, SEMANTIC_COLORS } from "@repo/common-types";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";

interface AdminUserDetail {
  user_id: string;
  email: string | null;
  username: string | null;
  panel_balance: number;
  total_spent: number;
  last_purchase: string | null;
  roles: string[];
  permissions: string[];
}

interface UserCreditsSummary {
  user_id: string;
  panel_balance: number;
  last_purchased_at: string | null;
}

async function loadUser(userId: string): Promise<AdminUserDetail | null> {
  try {
    return await fetchAdminJson<AdminUserDetail>(API_ENDPOINTS.ADMIN_USER_BY_ID(userId));
  } catch (error) {
    console.error("Failed to fetch admin user", error);
    return null;
  }
}

async function loadCredits(userId: string): Promise<UserCreditsSummary | null> {
  try {
    return await fetchAdminJson<UserCreditsSummary>(API_ENDPOINTS.ADMIN_USER_CREDITS(userId));
  } catch (error) {
    console.warn("Failed to load user credits", error);
    return null;
  }
}

export default async function AdminUserDetailPage({ params }: { params: { userId: string } }) {
  const user = await loadUser(params.userId);
  if (!user) {
    notFound();
  }

  const credits = await loadCredits(params.userId);

  return (
    <AdminShell title="User Details">
      <div className={`space-y-6`}>
        <Card className={`${SEMANTIC_COLORS.BACKGROUND.PRIMARY}`}>
          <CardHeader>
            <CardTitle>Account Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <div>
                <p className={`${SEMANTIC_COLORS.TEXT.TERTIARY}`}>User ID</p>
                <p className="font-medium">{user.user_id}</p>
              </div>
              <div>
                <p className={`${SEMANTIC_COLORS.TEXT.TERTIARY}`}>Email</p>
                <p className="font-medium">{user.email ?? "—"}</p>
              </div>
              <div>
                <p className={`${SEMANTIC_COLORS.TEXT.TERTIARY}`}>Username</p>
                <p className="font-medium">{user.username ?? "—"}</p>
              </div>
              <div>
                <p className={`${SEMANTIC_COLORS.TEXT.TERTIARY}`}>Last Purchase</p>
                <p className="font-medium">{user.last_purchase ?? "No purchases"}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <div>
                <p className={`${SEMANTIC_COLORS.TEXT.TERTIARY}`}>Panel Balance</p>
                <p className="font-medium">{(credits?.panel_balance ?? user.panel_balance).toLocaleString()}</p>
              </div>
              <div>
                <p className={`${SEMANTIC_COLORS.TEXT.TERTIARY}`}>Lifetime Spend</p>
                <p className="font-medium">${user.total_spent.toFixed(2)}</p>
              </div>
            </div>
            <div>
              <p className={`${SEMANTIC_COLORS.TEXT.TERTIARY}`}>Roles</p>
              <p className="font-medium">{user.roles.length ? user.roles.join(", ") : "No roles assigned"}</p>
            </div>
            <div>
              <p className={`${SEMANTIC_COLORS.TEXT.TERTIARY}`}>Permissions</p>
              <p className="font-medium">
                {user.permissions.length ? user.permissions.join(", ") : "No explicit permissions"}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className={`${SEMANTIC_COLORS.BACKGROUND.PRIMARY}`}>
          <CardHeader>
            <CardTitle>Credit History</CardTitle>
          </CardHeader>
          <CardContent className="text-sm">
            {credits ? (
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <div>
                  <p className={`${SEMANTIC_COLORS.TEXT.TERTIARY}`}>Balance</p>
                  <p className="font-medium">{credits.panel_balance.toLocaleString()} panels</p>
                </div>
                <div>
                  <p className={`${SEMANTIC_COLORS.TEXT.TERTIARY}`}>Last Purchase</p>
                  <p className="font-medium">{credits.last_purchased_at ?? "N/A"}</p>
                </div>
              </div>
            ) : (
              <p className={`${SEMANTIC_COLORS.TEXT.TERTIARY}`}>
                No credit summary available for this user.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminShell>
  );
}
