import { useState, useEffect, useRef } from "react";
import { Check, Loader2, ArrowDown } from "lucide-react";
import type { BriefData } from "./pages/Home";
import { aiFetchRaw } from "../../services/ai/aiClient";
import { useCredits } from "../../context/CreditsContext";

/** Error variant — used to switch the inline error card into "out of credits" UX. */
type GenError = {
  kind: "generic" | "auth" | "insufficient_credits" | "plan_gated";
  message: string;
};

const navigateTo = (path: string, state?: unknown) => {
  window.history.pushState(state ?? {}, "", path);
  window.dispatchEvent(new PopStateEvent("popstate"));
};

/* ─── Pipeline definition ────────────────────────────────────────────── */
type Status = "queued" | "working" | "done";

const STEPS: {
  id: string;
  title: string;
  duration: number; // seconds
  queuedMsg: string;
  workingMsg: string;
  doneMsg: string;
}[] = [
  {
    id: "researcher",
    title: "Researcher",
    duration: 8,
    queuedMsg: "Searching industry reports and recent papers",
    workingMsg: "Scanning industry reports and recent papers…",
    doneMsg: "Found 12 sources across industry reports and recent papers",
  },
  {
    id: "outliner",
    title: "Outliner",
    duration: 11,
    queuedMsg: "Planning content structure",
    workingMsg: "Planning sections and flow…",
    doneMsg: "5 sections planned · intro, market, tech, case study, outlook",
  },
  {
    id: "writer",
    title: "Writer",
    duration: 25,
    queuedMsg: "Drafts each section with citations",
    workingMsg: 'Drafting section 3 of 5 · "The technology stack"',
    doneMsg: "5 sections written · 1,247 words",
  },
  {
    id: "refiner",
    title: "Refiner",
    duration: 7,
    queuedMsg: "Tightening structure and clarity",
    workingMsg: "Tightening structure and clarity…",
    doneMsg: "Structure refined · citations preserved",
  },
  {
    id: "social",
    title: "Short-form spinner",
    duration: 9,
    queuedMsg: "Spin short-form variants for selected platforms",
    workingMsg: "Spinning short-form variants…",
    doneMsg: "Short-form variants ready",
  },
];

const TOTAL_EST = STEPS.reduce((s, x) => s + x.duration, 0);

interface Props {
  brief: BriefData;
  onDone: () => void;
}

export default function GeneratorForm({ brief, onDone }: Props) {
  const [elapsed, setElapsed] = useState(0);
  const [statuses, setStatuses] = useState<Status[]>([
    "working",
    "queued",
    "queued",
    "queued",
    "queued",
  ]);
  const [stepDurations, setStepDurations] = useState<number[]>(STEPS.map(() => 0));
  const [error, setError] = useState<GenError | null>(null);
  const credits = useCredits();

  const controllerRef = useRef<AbortController | null>(null);
  const keepAliveRef = useRef(false);
  // Guard against React StrictMode firing the effect twice in dev — without
  // this, every /generate call would run the pipeline in parallel.
  const startedRef = useRef(false);

  /* ─── Original API call logic preserved ─────────────────────────────── */
  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    const ac = new AbortController();
    controllerRef.current = ac;
    let mounted = true;
    const startedAt = Date.now();

    // Animate pipeline progress
    const tickInterval = setInterval(() => {
      if (!mounted) return;
      const e = Math.floor((Date.now() - startedAt) / 1000);
      setElapsed(e);

      let cumulative = 0;
      const nextStatuses: Status[] = [];
      const nextDurations: number[] = [];
      let activeFound = false;
      for (let i = 0; i < STEPS.length; i++) {
        const dur = STEPS[i].duration;
        if (e >= cumulative + dur) {
          nextStatuses.push("done");
          nextDurations.push(dur);
        } else if (e >= cumulative && !activeFound) {
          nextStatuses.push("working");
          nextDurations.push(e - cumulative);
          activeFound = true;
        } else {
          nextStatuses.push("queued");
          nextDurations.push(0);
        }
        cumulative += dur;
      }
      setStatuses(nextStatuses);
      setStepDurations(nextDurations);
    }, 500);

    // API call (preserved from original)
    sessionStorage.removeItem("neo_script_last_result");
    // 4-minute ceiling. The full pipeline (5 LLM agents + citation pass) can
    // reliably run 90-180s on busy days; 120s was clipping legitimate runs.
    // Even when we abort, the backend keeps going and saves the result —
    // user can find it in /history. The abort message tells them so.
    const timeoutId = setTimeout(() => ac.abort(), 240_000);

    (async () => {
      try {
        const url = brief.companyUrl.startsWith("http")
          ? brief.companyUrl
          : `https://${brief.companyUrl}`;

        // aiFetchRaw transparently handles 401 -> /auth/refresh -> retry, and
        // bounces to /login when refresh ultimately fails. So a 401 we see
        // here means the refresh failed AND we've already navigated away.
        const response = await aiFetchRaw("/generate", {
          method: "POST",
          body: JSON.stringify({
            prompt: brief.topic,
            brand_name: brief.brand,
            company_url: url,
            mode: brief.mode,
            // Backend rejects multi-platform in social mode; blog mode ignores.
            platforms: brief.mode === "social" && brief.platform
              ? [brief.platform]
              : [],
            // When true, Python retrieves this user+brand's uploaded docs via
            // Qdrant and injects them into the Researcher + Writer prompts.
            use_user_docs: brief.useUserDocs,
            // Optional must-include keywords. Backend caps count + length;
            // sending more than the cap returns a 422 with a clear message.
            keywords: brief.keywords,
          }),
          signal: ac.signal,
        });

        if (response.status === 401) {
          // Refresh failed; user is being redirected to /login by aiFetchRaw.
          throw new Error("AUTH_REQUIRED");
        }

        // 402 (INSUFFICIENT_CREDITS) and 403 (PLAN_GATED) get special UX:
        // the inline error card switches into a "top up" / "upgrade" call-to-action.
        if (response.status === 402 || response.status === 403) {
          const payload = await response.json().catch(() => null);
          const code = (payload?.detail?.code ?? payload?.code) as string | undefined;
          const message =
            (payload?.detail?.message as string | undefined) ||
            (typeof payload?.detail === "string" ? payload.detail : null) ||
            (response.status === 402
              ? "You're out of credits. Top up to keep generating."
              : "This action requires a higher plan.");
          // Bring the navbar pill in sync (server may have refunded if it
          // pre-deducted then bailed; either way the truth is now refetched).
          credits.refresh();
          if (mounted) {
            if (code === "INSUFFICIENT_CREDITS" || response.status === 402) {
              setError({ kind: "insufficient_credits", message });
            } else {
              setError({ kind: "plan_gated", message });
            }
          }
          return;
        }

        if (!response.ok) {
          throw new Error(`Server returned ${response.status}`);
        }

        const data = await response.json();
        // /generate deducted a credit on success — sync the navbar pill.
        credits.refresh();
        // Route through /result?req=<id> so the page always fetches the full
        // detail (markdown + citations + social citations). One source of
        // truth, no diverging shapes between fresh and from-history flows.
        const reqId: string | undefined = data?.request_id;
        if (!reqId) {
          throw new Error("Server returned no request_id — cannot open result");
        }
        const target = `/result?req=${encodeURIComponent(reqId)}`;

        if (mounted) {
          setStatuses(["done", "done", "done", "done", "done"]);
          setTimeout(() => navigateTo(target), 600);
        } else {
          // background completion
          navigateTo(target);
        }
      } catch (err) {
        if (!mounted) return;
        const e = err as Error;
        if (e.name === "AbortError") {
          setError({
            kind: "generic",
            message:
              "This is taking longer than expected — but your generation is likely still running on the server. " +
              "Check History in a minute, the finished post should appear there.",
          });
        } else if (e.message === "AUTH_REQUIRED") {
          setError({ kind: "auth", message: "You're signed out. Please log in again to generate." });
        } else {
          setError({ kind: "generic", message: "Generation failed. Check your inputs or try again." });
        }
      } finally {
        clearTimeout(timeoutId);
      }
    })();

    return () => {
      mounted = false;
      clearInterval(tickInterval);
      clearTimeout(timeoutId);
      // NOTE: do NOT abort the fetch here. React StrictMode fires this
      // cleanup synthetically right after the first mount; aborting would
      // kill the request before fetch() has a chance to send it. Explicit
      // cancellation goes through handleCancel (controllerRef.current.abort).
    };
  }, [brief]);
  /* ─────────────────────────────────────────────────────────────────────── */

  const handleCancel = () => {
    if (controllerRef.current) controllerRef.current.abort();
    onDone();
  };

  const handleBackground = () => {
    keepAliveRef.current = true;
    onDone();
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  const remaining = Math.max(0, TOTAL_EST - elapsed);
  const progressPct = Math.min(100, (elapsed / TOTAL_EST) * 100);

  // Word count estimate (grows during writer step)
  const writerStart = STEPS[0].duration + STEPS[1].duration;
  const writerEnd = writerStart + STEPS[2].duration;
  let wordCount = 0;
  if (elapsed > writerStart) {
    const t = Math.min(1, (elapsed - writerStart) / (writerEnd - writerStart));
    wordCount = Math.round(t * 1500);
  } else if (elapsed > writerEnd) {
    wordCount = 1500;
  }

  return (
    <section className="relative pt-8 pb-12 px-4 sm:px-6 overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 flex items-start justify-center"
        style={{ paddingTop: "60px" }}
      >
        <div
          style={{
            width: "900px",
            height: "500px",
            background:
              "radial-gradient(ellipse at center, rgba(124,58,237,0.15) 0%, rgba(124,58,237,0.05) 45%, transparent 70%)",
            filter: "blur(8px)",
          }}
        />
      </div>

      <div className="relative max-w-[1180px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5">
          {/* ─── MAIN PIPELINE CARD ──────────────────────────────────── */}
          <div
            className="rounded-2xl border border-white/[0.06] p-7 shadow-[0_1px_0_rgba(255,255,255,0.02)_inset]"
            style={{ background: "rgba(255,255,255,0.015)" }}
          >
            <div className="flex items-start justify-between mb-1">
              <h2 className="text-[22px] font-semibold tracking-tight text-white">
                Running your script
              </h2>
              <span className="text-[12px] text-white/40 mt-2 font-mono whitespace-nowrap">
                {formatTime(elapsed)} elapsed · ~{remaining}s left
              </span>
            </div>
            <p className="text-[14px] text-white/45 italic mb-5">
              &ldquo;{brief.topic}&rdquo;
            </p>

            {/* Progress bar */}
            <div className="h-[3px] w-full bg-white/[0.05] rounded-full overflow-hidden mb-7">
              <div
                className="h-full bg-violet-500 rounded-full transition-all duration-500 ease-out"
                style={{
                  width: `${progressPct}%`,
                  boxShadow: "0 0 12px rgba(124,58,237,0.6)",
                }}
              />
            </div>

            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/40 mb-4">
              Pipeline
            </p>

            <ul className="space-y-0">
              {STEPS.map((step, i) => {
                const status = statuses[i];
                const stepDur = stepDurations[i];
                const isLast = i === STEPS.length - 1;
                const isWorking = status === "working";

                return (
                  <li key={step.id}>
                    <div
                      className={[
                        "flex items-start gap-3.5 px-4 py-3.5 rounded-xl transition-all duration-300",
                        isWorking
                          ? "border border-violet-500/50 bg-violet-500/[0.06]"
                          : "border border-transparent",
                      ].join(" ")}
                    >
                      <StepIcon status={status} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span
                            className={[
                              "text-[14px] font-semibold",
                              status === "queued"
                                ? "text-white/40"
                                : "text-white",
                            ].join(" ")}
                          >
                            {step.title}
                          </span>
                          {isWorking && (
                            <span className="text-[10px] font-medium uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-violet-500/20 text-violet-300 border border-violet-500/30">
                              working
                            </span>
                          )}
                        </div>
                        <p
                          className={[
                            "text-[13px] leading-snug",
                            status === "done"
                              ? "text-white/55"
                              : status === "working"
                                ? "text-violet-300/90"
                                : "text-white/35",
                          ].join(" ")}
                        >
                          {status === "done"
                            ? step.doneMsg
                            : status === "working"
                              ? step.workingMsg
                              : step.queuedMsg}
                        </p>
                      </div>
                      <span
                        className={[
                          "text-[12px] font-mono shrink-0 mt-0.5",
                          status === "queued"
                            ? "text-white/30"
                            : "text-white/55",
                        ].join(" ")}
                      >
                        {status === "queued"
                          ? "queued"
                          : formatTime(stepDur)}
                      </span>
                    </div>
                    {!isLast && (
                      <div className="h-px bg-white/[0.05] mx-4" />
                    )}
                  </li>
                );
              })}
            </ul>

            {error && (
              <div
                className={[
                  "mt-5 px-4 py-3 rounded-lg border text-[13px]",
                  error.kind === "insufficient_credits" || error.kind === "plan_gated"
                    ? "bg-amber-500/10 border-amber-500/30 text-amber-200"
                    : "bg-red-500/10 border-red-500/25 text-red-400",
                ].join(" ")}
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="leading-relaxed">{error.message}</p>
                  {(error.kind === "insufficient_credits" || error.kind === "plan_gated") && (
                    <a
                      href="/billing"
                      className="shrink-0 text-[12px] font-semibold px-3 py-1.5 rounded-lg bg-amber-400/20 hover:bg-amber-400/30 text-amber-100 border border-amber-400/40 transition-colors"
                    >
                      {error.kind === "insufficient_credits" ? "Top up credits" : "Upgrade plan"}
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Bottom actions */}
            <div className="flex items-center gap-3 pt-7 mt-2">
              <button
                onClick={handleCancel}
                className="px-5 py-2.5 rounded-xl text-[13px] font-medium border border-white/[0.12] text-white/70 hover:text-white hover:border-white/25 hover:bg-white/[0.03] transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleBackground}
                className="px-5 py-2.5 rounded-xl text-[13px] font-medium border border-white/[0.12] text-white/70 hover:text-white hover:border-white/25 hover:bg-white/[0.03] transition-all leading-tight"
              >
                Run in
                <br />
                background
              </button>
              <p className="text-[12px] text-white/35 ml-2 leading-snug flex-1">
                You can close this tab — we&apos;ll save the draft.
              </p>
              <button
                aria-label="Download"
                className="w-10 h-10 rounded-full bg-white/[0.06] border border-white/[0.08] flex items-center justify-center hover:bg-white/[0.1] transition-colors flex-shrink-0"
              >
                <ArrowDown size={14} className="text-white/60" />
              </button>
            </div>
          </div>

          {/* ─── SIDEBAR ─────────────────────────────────────────────── */}
          <aside className="flex flex-col gap-5">
            {/* Live preview */}
            <div
              className="rounded-2xl border border-white/[0.06] p-5"
              style={{ background: "rgba(255,255,255,0.015)" }}
            >
              <h3 className="text-[15px] font-semibold text-white mb-4">
                Live preview
              </h3>
              <div className="rounded-xl bg-black/40 border border-white/[0.05] p-4 mb-3">
                <ShimmerLines wordCount={wordCount} />
              </div>
              <p className="text-[12px] text-white/45 text-center">
                ~{wordCount} words so far
              </p>
            </div>

            {/* What happens next */}
            <div
              className="rounded-2xl border border-white/[0.06] p-5"
              style={{ background: "rgba(255,255,255,0.015)" }}
            >
              <h3 className="text-[15px] font-semibold text-white mb-3">
                What happens next
              </h3>
              <p className="text-[13px] text-white/55 leading-relaxed">
                When the writer finishes, the optimiser rewrites for answer
                engines, then the social spinner produces LinkedIn and
                Twitter posts. You&apos;ll land in the editor.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   STEP ICON — check / spinner / empty circle
   ═══════════════════════════════════════════════════════════════════════ */
function StepIcon({ status }: { status: Status }) {
  if (status === "done") {
    return (
      <div className="w-5 h-5 rounded-full bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center flex-shrink-0 mt-0.5">
        <Check size={11} strokeWidth={3.5} className="text-emerald-400" />
      </div>
    );
  }
  if (status === "working") {
    return (
      <div className="w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5">
        <Loader2 size={16} className="text-violet-400 animate-spin" />
      </div>
    );
  }
  return (
    <div className="w-5 h-5 rounded-full border border-dashed border-white/20 flex-shrink-0 mt-0.5" />
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   SHIMMER LINES — live preview skeleton
   ═══════════════════════════════════════════════════════════════════════ */
function ShimmerLines({ wordCount }: { wordCount: number }) {
  // Lines get filled in progressively as word count grows
  const lines = [
    { width: "85%", delay: 0 },
    { width: "55%", delay: 0.15 },
    { width: "92%", delay: 0.3 },
    { width: "78%", delay: 0.45 },
    { width: "60%", delay: 0.6, violet: true },
    { width: "88%", delay: 0.75, violet: true },
    { width: "45%", delay: 0.9 },
  ];

  return (
    <div className="space-y-2.5">
      {lines.map((l, i) => {
        const visible = wordCount > i * 200; // show progressively
        return (
          <div
            key={i}
            className={[
              "h-2 rounded-full transition-all duration-700",
              l.violet ? "bg-violet-500/40" : "bg-white/[0.08]",
              visible ? "opacity-100" : "opacity-30",
            ].join(" ")}
            style={{
              width: l.width,
              animation: visible
                ? `shimmer 2s ease-in-out ${l.delay}s infinite`
                : "none",
            }}
          />
        );
      })}
      <style>{`
        @keyframes shimmer {
          0%, 100% { opacity: 0.7; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}