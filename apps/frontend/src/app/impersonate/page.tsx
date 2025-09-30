"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { API_CONFIG, API_ENDPOINTS, SEMANTIC_COLORS } from "@repo/common-types";
import { Button } from "@repo/ui/button";
import { clearImpersonationToken, storeImpersonationToken } from "@/lib/impersonation";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || API_CONFIG.DEFAULT_BACKEND_URL;

type StatusState = {
  status: "loading" | "success" | "error" | "idle";
  message: string;
};

function ImpersonatePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [state, setState] = useState<StatusState>({
    status: "loading",
    message: "Validating impersonation token...",
  });

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      setState({ status: "error", message: "Missing impersonation token." });
      return;
    }

    const controller = new AbortController();
    let redirectTimeout: ReturnType<typeof setTimeout> | null = null;

    const exchange = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.ADMIN_IMPERSONATION_EXCHANGE}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Exchange failed with status ${response.status}`);
        }

        const data = (await response.json()) as {
          impersonationToken?: string;
          expiresAt?: string | null;
        };

        if (!data.impersonationToken) {
          throw new Error("Response missing impersonation token");
        }

        clearImpersonationToken();
        storeImpersonationToken(data.impersonationToken, data.expiresAt ?? null);

        setState({
          status: "success",
          message: "Impersonation session is active. Redirecting you to the dashboard...",
        });

        redirectTimeout = setTimeout(() => {
          router.push("/");
        }, 1200);
      } catch (error) {
        console.error("Failed to exchange impersonation token", error);
        setState({
          status: "error",
          message: "Unable to activate impersonation. Please request a fresh link.",
        });
      }
    };

    void exchange();

    return () => {
      controller.abort();
      if (redirectTimeout) {
        clearTimeout(redirectTimeout);
      }
    };
  }, [searchParams, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className={`max-w-md space-y-4 rounded-lg border bg-white px-6 py-8 ${SEMANTIC_COLORS.BORDER.DEFAULT}`}>
        <h1 className="text-xl font-semibold">Admin Impersonation</h1>
        <p
          className={`text-sm ${
            state.status === "error"
              ? SEMANTIC_COLORS.ERROR.TEXT
              : state.status === "success"
              ? SEMANTIC_COLORS.SUCCESS.TEXT
              : SEMANTIC_COLORS.TEXT.TERTIARY
          }`}
        >
          {state.message}
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="default"
            onClick={() => router.push("/")}
            disabled={state.status === "loading"}
          >
            Go to Dashboard
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              clearImpersonationToken();
              setState({ status: "idle", message: "Impersonation cleared." });
            }}
          >
            Clear Impersonation
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function ImpersonatePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ImpersonatePageContent />
    </Suspense>
  );
}
