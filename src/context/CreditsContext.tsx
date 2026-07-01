/* Global credit balance state.
   Fetches /user/plan once on mount (when authenticated) and exposes
   { balance, planName, planId, unlimited, loading, refresh } to any
   component. Components that affect the balance (GeneratorForm,
   Billing checkout) call refresh() to keep the navbar pill in sync. */

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { billingService, type UserPlanSnapshot } from "../services/ai/billingService";
import { formatErrorMessage } from "../services/apiError";
import { useAuth } from "./AuthContext";

type CreditsValue = {
  balance: number | null;       // null = not loaded yet
  planId: string | null;
  planName: string | null;
  unlimited: boolean;
  lastPurchasedPlanId: string | null;
  loading: boolean;
  error: string | null;
  /** Re-fetch /user/plan. Call after generate / purchase / refund. */
  refresh: () => Promise<void>;
};

const CreditsContext = createContext<CreditsValue | null>(null);

export function CreditsProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [snap, setSnap] = useState<UserPlanSnapshot | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Coalesce concurrent refresh() calls — if generate succeeds and the user
  // also clicks "Sync" at the same moment, we want one fetch, not two.
  const inflight = useRef<Promise<void> | null>(null);

  const doFetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await billingService.getMyPlan();
      setSnap(data);
    } catch (e) {
      const msg = formatErrorMessage(e, "Failed to load credits.");
      // Surface the actual reason in the browser console so the user can
      // see if it's a network/CORS/auth issue. The pill silently falls
      // back to "0 credits" otherwise — easy to miss.
      console.error("[credits] /user/plan fetch failed:", e);
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    if (!isAuthenticated) return;
    if (inflight.current) return inflight.current;
    inflight.current = doFetch().finally(() => {
      inflight.current = null;
    });
    return inflight.current;
  }, [isAuthenticated, doFetch]);

  // Auto-fetch on auth state change. We don't fetch for anonymous users —
  // /user/plan requires Bearer and would 401 noisily.
  useEffect(() => {
    if (isAuthenticated) {
      refresh();
    } else {
      setSnap(null);
    }
  }, [isAuthenticated, refresh]);

  const value = useMemo<CreditsValue>(
    () => ({
      balance: snap ? snap.balance : null,
      planId: snap ? snap.plan_id : null,
      planName: snap ? snap.plan_name : null,
      unlimited: snap ? snap.unlimited : false,
      lastPurchasedPlanId: snap ? snap.last_purchased_plan_id : null,
      loading,
      error,
      refresh,
    }),
    [snap, loading, error, refresh],
  );

  return <CreditsContext.Provider value={value}>{children}</CreditsContext.Provider>;
}

export function useCredits(): CreditsValue {
  const ctx = useContext(CreditsContext);
  if (!ctx) throw new Error("useCredits must be used within a CreditsProvider");
  return ctx;
}
