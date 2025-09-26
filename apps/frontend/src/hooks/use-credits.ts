"use client";

import { useEffect, useState, useCallback } from "react";
import { UserCredits, API_ENDPOINTS } from "@repo/common-types";
import { apiRequest } from "@/lib/api";
import { isImpersonationActive } from "@/lib/impersonation";
import { useAuth } from "@/hooks/use-auth";

interface UseCreditsResult {
  credits: UserCredits | null;
  isLoading: boolean;
  error: string | null;
  refreshCredits: () => Promise<void>;
  canCreatePanel: boolean;
}

const ENDPOINT = API_ENDPOINTS.USER_CREDITS_ME;

export function useCredits(): UseCreditsResult {
  const { user } = useAuth();
  const [credits, setCredits] = useState<UserCredits | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const refreshCredits = useCallback(async () => {
    if (!user && !isImpersonationActive()) {
      setCredits(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await apiRequest<UserCredits>(ENDPOINT, "GET");
      setCredits(response);
    } catch (err: unknown) {
      console.warn("Failed to load credits", err);
      setError(err instanceof Error ? err.message : "Unable to load credits");
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    void refreshCredits();
  }, [refreshCredits]);

  return {
    credits,
    isLoading,
    error,
    refreshCredits,
    canCreatePanel: (credits?.panel_balance ?? 0) > 0,
  };
}
