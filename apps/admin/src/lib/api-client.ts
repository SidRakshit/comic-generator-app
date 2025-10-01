const DEFAULT_BASE_URL = process.env.ADMIN_API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL;

export const ADMIN_API_BASE_URL = DEFAULT_BASE_URL;

if (!DEFAULT_BASE_URL) {
  console.warn("ADMIN_API_BASE_URL or NEXT_PUBLIC_API_BASE_URL should be configured for the admin app.");
}

const SERVICE_TOKEN = process.env.ADMIN_SERVICE_TOKEN;
const SERVICE_USER_ID = process.env.ADMIN_SERVICE_USER_ID;

export function getAdminApiHeaders(): HeadersInit {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (SERVICE_TOKEN) {
    headers["x-admin-service-token"] = SERVICE_TOKEN;
  }
  if (SERVICE_USER_ID) {
    headers["x-admin-service-user"] = SERVICE_USER_ID;
  }
  return headers;
}

export async function fetchAdminJson<T>(path: string, init?: RequestInit): Promise<T> {
  if (!DEFAULT_BASE_URL) {
    throw new Error("Admin API base URL is not configured");
  }

  const base = DEFAULT_BASE_URL.replace(/\/$/, "");
  const response = await fetch(`${base}${path}`, {
    cache: "no-store",
    headers: {
      ...getAdminApiHeaders(),
      ...(init?.headers ?? {}),
    },
    ...init,
  });

  if (!response.ok) {
    throw new Error(`Admin API request failed with status ${response.status}`);
  }

  return (await response.json()) as T;
}
