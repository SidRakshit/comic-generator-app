const STORAGE_KEY = "comic-admin-impersonation";

interface StoredImpersonation {
  token: string;
  expiresAt?: string | null;
}

function readStorage(): StoredImpersonation | null {
  if (typeof window === "undefined") {
    return null;
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredImpersonation;
    if (!parsed?.token) {
      window.localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    if (parsed.expiresAt) {
      const expires = new Date(parsed.expiresAt);
      if (!Number.isFinite(expires.getTime()) || expires.getTime() < Date.now()) {
        window.localStorage.removeItem(STORAGE_KEY);
        return null;
      }
    }
    return parsed;
  } catch (error) {
    console.warn("Failed to parse impersonation storage", error);
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(STORAGE_KEY);
    }
    return null;
  }
}

export function getImpersonationToken(): StoredImpersonation | null {
  return readStorage();
}

export function storeImpersonationToken(token: string, expiresAt?: string | null): void {
  if (typeof window === "undefined") {
    return;
  }
  const payload: StoredImpersonation = { token, expiresAt: expiresAt ?? null };
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

export function clearImpersonationToken(): void {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.removeItem(STORAGE_KEY);
}

export function isImpersonationActive(): boolean {
  return readStorage() !== null;
}
