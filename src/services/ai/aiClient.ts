// Shared HTTP client for the Python AI backend.
//
// Auth tokens live in localStorage (same store used by the Node auth axios
// instance). We deliberately use plain `fetch` rather than reusing the auth
// axios instance because its 401 refresh interceptor + cookie behavior is
// scoped to the auth service. AI endpoints just need the Bearer header.
//
// 401 handling here mirrors what axiosInstance does for the auth API:
//   1. Try /auth/refresh once (uses the httpOnly refresh cookie).
//   2. If refresh succeeds, retry the original request with the new token.
//   3. If refresh fails, clear local auth and bounce to /login.

import { getToken } from "../auth/authHelpers";
import { refreshAccessToken } from "../auth/refreshService";
import { logoutUser, navigateTo } from "../auth/authHelpers";
import { normalizeApiError, type NormalizedApiError } from "../apiError";

export const AI_API_URL =
  (import.meta.env.VITE_AI_API_URL as string | undefined) ||
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ||
  "http://localhost:8000";

export class ApiError extends Error {
  status: number;
  code?: string;
  requestId: string | null;
  retryAfter: number | null;
  constructor(
    message: string,
    status: number,
    code?: string,
    opts?: { requestId?: string | null; retryAfter?: number | null },
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.requestId = opts?.requestId ?? null;
    this.retryAfter = opts?.retryAfter ?? null;
  }
}

// Side effects shared by every AI error path: a verified-only endpoint that
// rejects an unverified-but-logged-in user routes them to the verify-email
// prompt instead of surfacing a raw error.
export function handleApiErrorSideEffects(e: NormalizedApiError): void {
  if (
    e.status === 403 &&
    e.code === "EMAIL_NOT_VERIFIED" &&
    window.location.pathname !== "/verify-email"
  ) {
    navigateTo("/verify-email");
  }
}

type RequestInitNoBody = Omit<RequestInit, "body"> & { body?: BodyInit | null };

// Coalesce concurrent refresh attempts — if /generate and /user/brands both
// get 401 simultaneously, we want one refresh, not two. mirrors axios pattern.
let inflightRefresh: Promise<string | null> | null = null;

const refreshOnce = (): Promise<string | null> => {
  if (!inflightRefresh) {
    inflightRefresh = refreshAccessToken()
      .then((r) => (r.ok ? r.accessToken ?? null : null))
      .finally(() => { inflightRefresh = null; });
  }
  return inflightRefresh;
};

const PUBLIC_PATHS = new Set([
  "/", "/login", "/get-started", "/forgot-password", "/reset-password", "/verify-email",
]);

const bounceToLogin = () => {
  logoutUser();
  if (!PUBLIC_PATHS.has(window.location.pathname)) {
    navigateTo("/login");
  }
};

const doFetch = async (path: string, init: RequestInitNoBody, token: string | null) => {
  const headers = new Headers(init.headers || {});
  if (token) headers.set("Authorization", `Bearer ${token}`);
  // Only set Content-Type for JSON bodies; multipart uploads must let the
  // browser set its own boundary, so callers passing FormData should not
  // include Content-Type and we leave it alone.
  if (init.body && !(init.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  return fetch(`${AI_API_URL}${path}`, { ...init, headers });
};

export async function aiFetch<T>(path: string, init: RequestInitNoBody = {}): Promise<T> {
  let res = await doFetch(path, init, getToken());

  // Try one refresh + retry cycle on 401. The cookie-based /auth/refresh is
  // independent of the access token in localStorage, so this works even if
  // localStorage was nuked (e.g. browser tab reopened).
  if (res.status === 401) {
    const fresh = await refreshOnce();
    if (fresh) {
      res = await doFetch(path, init, fresh);
    }
    if (res.status === 401) {
      bounceToLogin();
      throw new ApiError("Session expired. Please sign in again.", 401, "SESSION_EXPIRED");
    }
  }

  if (res.status === 204) return undefined as unknown as T;

  const contentType = res.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");
  const payload = isJson ? await res.json().catch(() => null) : await res.text();

  if (!res.ok) {
    const normalized = normalizeApiError(payload, res.status, {
      retryAfterHeader: res.headers.get("Retry-After"),
    });
    handleApiErrorSideEffects(normalized);
    throw new ApiError(normalized.message, normalized.status, normalized.code, {
      requestId: normalized.requestId,
      retryAfter: normalized.retryAfter,
    });
  }

  return payload as T;
}

// Convenience for callers (like GeneratorForm) that need to drive the request
// themselves but still want one-shot refresh-then-retry. Use when aiFetch's
// JSON-only signature doesn't fit — e.g. when you want to stream or handle
// non-200 codes specifically.
export async function aiFetchRaw(path: string, init: RequestInit = {}): Promise<Response> {
  let res = await doFetch(path, init as RequestInitNoBody, getToken());
  if (res.status === 401) {
    const fresh = await refreshOnce();
    if (fresh) {
      res = await doFetch(path, init as RequestInitNoBody, fresh);
    }
    if (res.status === 401) {
      bounceToLogin();
    }
  }
  return res;
}
