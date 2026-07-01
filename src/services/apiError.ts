// Central error normalizer for the standardized backend error contract.
//
// Every non-2xx response now has this top-level shape:
//   { success: false, code: "STABLE_CODE", message: "safe to show", request_id }
//
// Previously the two backends disagreed: FastAPI nested errors under
//   { detail: { code, message } }  or  { detail: "a plain string" }
// and the Node auth API used  { error: { code, message } }.
// We read `data.detail ?? data` (and fall back through the old `error`
// envelope + bare strings) so a stray legacy response still parses cleanly.

export type NormalizedApiError = {
  code: string;
  message: string;
  requestId: string | null;
  status: number;
  /** Seconds to wait, parsed from the `Retry-After` header (429s). */
  retryAfter: number | null;
};

const FALLBACK_CODE = "UNKNOWN_ERROR";

const asRecord = (v: unknown): Record<string, unknown> | null =>
  v && typeof v === "object" ? (v as Record<string, unknown>) : null;

const str = (v: unknown): string | null =>
  typeof v === "string" && v.length > 0 ? v : null;

// `Retry-After` is either delta-seconds or an HTTP-date.
const parseRetryAfter = (raw: string | null | undefined): number | null => {
  if (!raw) return null;
  const secs = Number(raw);
  if (Number.isFinite(secs)) return Math.max(0, Math.round(secs));
  const when = Date.parse(raw);
  if (!Number.isNaN(when)) return Math.max(0, Math.round((when - Date.now()) / 1000));
  return null;
};

export function normalizeApiError(
  data: unknown,
  status: number,
  opts: { retryAfterHeader?: string | null; fallbackMessage?: string } = {},
): NormalizedApiError {
  const body = asRecord(data);

  // Resilient to a legacy `{ detail: {...} }` envelope slipping through, and
  // to the old auth-API `{ error: {...} }` envelope.
  const detail = body?.detail;
  const src =
    asRecord(detail) ?? asRecord(body?.error) ?? body;

  // Legacy FastAPI sometimes sent `{ detail: "a plain string" }`.
  const detailString = typeof detail === "string" ? detail : null;

  const code = str(src?.code) ?? FALLBACK_CODE;

  const message =
    str(src?.message) ??
    detailString ??
    (typeof data === "string" ? str(data) : null) ??
    opts.fallbackMessage ??
    `Request failed with status ${status}`;

  const requestId = str(src?.request_id) ?? str(body?.request_id) ?? null;

  return {
    code,
    message,
    requestId,
    status,
    retryAfter: parseRetryAfter(opts.retryAfterHeader),
  };
}

// Build a single user-facing string from any thrown error / normalized error.
// A `Retry-After` hint is shown for rate limits, and the support reference id
// is appended ONLY for server-side failures (5xx) — those are the ones the user
// can't fix and may need to quote to support. For ordinary user-actionable
// errors (4xx: invalid credentials, validation, rate limit, …) the message
// shows clean, since a reference id there is just noise. The `requestId` is
// still on the error object for client-side logging regardless.
export function formatErrorMessage(err: unknown, fallback = "Something went wrong"): string {
  const e = asRecord(err);
  if (!e) return fallback;

  const base = str(e.message) ?? fallback;
  const ref = str(e.requestId);
  const retry = typeof e.retryAfter === "number" ? e.retryAfter : null;
  const status = typeof e.status === "number" ? e.status : 0;
  const isServerError = status >= 500;

  let out = base;
  if (retry != null && !/try again|second/i.test(base)) {
    out = `${out} Try again in ${retry}s.`;
  }
  if (ref && isServerError) out = `${out} (ref: ${ref})`;
  return out;
}
