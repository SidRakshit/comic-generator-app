import { AdminShell } from "@/components/layout/admin-shell";
import { UserManagementClient } from "@/components/users/user-management-client";
import { SEMANTIC_COLORS } from "@repo/common-types";
import { fetchAdminJson } from "@/lib/api-client";
import { UserTableRow } from "@/components/users/user-table";

async function fetchUsers(search?: string): Promise<UserTableRow[]> {
  try {
    const query = search ? `?search=${encodeURIComponent(search)}` : "";
    return await fetchAdminJson<UserTableRow[]>(`/admin/users${query}`);
  } catch (error) {
    console.warn("Failed to fetch admin users", error);
    return [];
  }
}

type RouteSearchParams = {
  [key: string]: string | string[] | undefined;
};

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<RouteSearchParams>;
}) {
  const resolvedSearchParams = await searchParams;
  const searchParam = resolvedSearchParams?.search;
  const search = Array.isArray(searchParam) ? searchParam[0] : searchParam;
  const users = await fetchUsers(search);

  return (
    <AdminShell title="Users">
      <div className={`rounded-lg border bg-white p-6 ${SEMANTIC_COLORS.BORDER.DEFAULT}`}>
        <h1 className="text-xl font-semibold">User Management</h1>
        <p className={`mt-2 text-sm ${SEMANTIC_COLORS.TEXT.TERTIARY}`}>
          Search, filter, and act on your user base. Data is retrieved directly from the admin API using the service token.
        </p>
      </div>
      <div className="mt-6">
        <UserManagementClient initialRows={users} initialQuery={search} />
      </div>
    </AdminShell>
  );
}
