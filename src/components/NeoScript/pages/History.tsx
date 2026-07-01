import { useEffect, useState } from "react";
import {
  Loader2, RefreshCw, FileText, ChevronRight, RotateCw, X,
} from "lucide-react";
import Navbar from "../Navbar";
import Footer from "../Footer";
import {
  listGenerations,
  deleteGeneration,
  type GenerationHistoryItem,
} from "../../../services/ai/generationsService";
import { formatErrorMessage } from "../../../services/apiError";

const navigateTo = (path: string) => {
  window.history.pushState({}, "", path);
  window.dispatchEvent(new PopStateEvent("popstate"));
};

const formatWhen = (iso: string | null): string => {
  if (!iso) return "—";
  const then = new Date(iso);
  const diffMs = Date.now() - then.getTime();
  const sec = Math.round(diffMs / 1000);
  if (sec < 60) return `${sec}s ago`;
  if (sec < 3600) return `${Math.round(sec / 60)}m ago`;
  if (sec < 86400) return `${Math.round(sec / 3600)}h ago`;
  return then.toLocaleDateString();
};

const formatDuration = (ms: number | null): string => {
  if (ms == null) return "—";
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
};

const StatusPill = ({ status }: { status: GenerationHistoryItem["status"] }) => {
  const styles: Record<string, string> = {
    success:   "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
    running:   "bg-violet-500/15  text-violet-300  border-violet-500/30",
    pending:   "bg-white/10       text-white/70    border-white/15",
    failed:    "bg-red-500/15     text-red-300     border-red-500/30",
    cancelled: "bg-amber-500/15   text-amber-300   border-amber-500/30",
  };
  return (
    <span
      className={[
        "inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium border",
        styles[status] || styles.pending,
      ].join(" ")}
    >
      {status}
    </span>
  );
};

export default function History() {
  const [items, setItems]   = useState<GenerationHistoryItem[]>([]);
  const [loading, setLoad]  = useState(true);
  const [error, setError]   = useState<string | null>(null);

  const [busyId, setBusyId] = useState<string | null>(null);

  const load = async () => {
    setLoad(true);
    setError(null);
    try {
      const rows = await listGenerations(50);
      setItems(rows);
    } catch (err) {
      setError(formatErrorMessage(err, "Failed to load history"));
    } finally {
      setLoad(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleRetry = (it: GenerationHistoryItem) => {
    // Sends the user to /home with a query param BriefForm reads to prefill
    // the brief from the original request. User reviews + clicks Generate.
    navigateTo(`/home?retry=${it.request_id}`);
  };

  const handleDismiss = async (it: GenerationHistoryItem) => {
    if (busyId) return;
    if (!confirm("Dismiss this generation? It will be deleted from the database.")) return;
    setBusyId(it.request_id);
    try {
      await deleteGeneration(it.request_id);
      setItems((prev) => prev.filter((x) => x.request_id !== it.request_id));
    } catch (err) {
      setError(formatErrorMessage(err, "Delete failed"));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-bg-base pt-10">
      <Navbar />

      <main className="flex-1 px-4 sm:px-6 pt-8 pb-12">
        <div className="max-w-[1180px] mx-auto">
          <div className="flex items-center justify-between mb-7">
            <div>
              <h1 className="text-[26px] font-semibold tracking-tight text-white">
                Generations
              </h1>
              <p className="text-[13px] text-white/45 mt-1">
                Every blog and social post you've generated.
              </p>
            </div>
            <button
              onClick={load}
              disabled={loading}
              className="flex items-center gap-1.5 px-3.5 py-2 text-[13px] font-medium text-white/70 hover:text-white border border-white/[0.1] rounded-lg hover:bg-white/[0.04] transition-colors disabled:opacity-50"
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>

          {error && (
            <div className="mb-5 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/25 text-red-400 text-[13px]">
              {error}
            </div>
          )}

          <div
            className="rounded-2xl border border-white/[0.06] overflow-hidden"
            style={{ background: "rgba(255,255,255,0.015)" }}
          >
            {loading && items.length === 0 ? (
              <div className="py-16 flex items-center justify-center text-white/40">
                <Loader2 size={20} className="animate-spin mr-2" />
                Loading…
              </div>
            ) : items.length === 0 ? (
              <div className="py-16 flex flex-col items-center text-white/45">
                <FileText size={28} className="mb-3 text-white/30" />
                <p className="text-[14px]">No generations yet.</p>
                <a
                  href="/home"
                  className="mt-3 text-[13px] text-violet-300 hover:text-violet-200"
                >
                  Generate your first one →
                </a>
              </div>
            ) : (
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[11px] uppercase tracking-wider text-white/40 border-b border-white/[0.06]">
                    <th className="px-5 py-3 font-medium">Topic / Prompt</th>
                    <th className="px-5 py-3 font-medium">Type</th>
                    <th className="px-5 py-3 font-medium">Brand</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                    <th className="px-5 py-3 font-medium">When</th>
                    <th className="px-5 py-3 font-medium">Duration</th>
                    <th className="px-3 py-3 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((it) => {
                    const isClickable = it.status === "success";
                    const platforms = Array.isArray(it.platforms) ? it.platforms : [];
                    const isBlog = platforms.length === 0;
                    const typeLabel = isBlog
                      ? "Long-form"
                      : `Short-form · ${platforms
                          .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
                          .join(", ")}`;
                    return (
                      <tr
                        key={it.request_id}
                        onClick={() => {
                          if (isClickable) navigateTo(`/result?req=${it.request_id}`);
                        }}
                        className={[
                          "border-b border-white/[0.04] last:border-b-0",
                          isClickable
                            ? "cursor-pointer hover:bg-white/[0.03]"
                            : "cursor-default opacity-70",
                        ].join(" ")}
                      >
                        <td className="px-5 py-3.5 max-w-[420px]">
                          <div className="text-[14px] font-medium text-white truncate">
                            {it.generated_topic || it.prompt}
                          </div>
                          {it.error_message && (
                            <div className="text-[12px] text-red-400/80 truncate mt-0.5">
                              {it.error_message}
                            </div>
                          )}
                        </td>
                        <td className="px-5 py-3.5 text-[12px] text-white/65">
                          {typeLabel}
                        </td>
                        <td className="px-5 py-3.5 text-[12px] text-white/65 truncate max-w-[160px]">
                          {it.brand_name}
                        </td>
                        <td className="px-5 py-3.5">
                          <StatusPill status={it.status} />
                        </td>
                        <td className="px-5 py-3.5 text-[12px] text-white/55">
                          {formatWhen(it.requested_at)}
                        </td>
                        <td className="px-5 py-3.5 text-[12px] text-white/55 font-mono">
                          {formatDuration(it.duration_ms)}
                        </td>
                        <td className="px-3 py-3.5">
                          <div
                            className="flex items-center justify-end gap-1"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {!isClickable && it.status !== "running" && (
                              <button
                                aria-label="Retry generation"
                                title="Retry"
                                onClick={() => handleRetry(it)}
                                className="p-1.5 rounded-md text-white/55 hover:text-violet-300 hover:bg-violet-500/10 transition-colors"
                              >
                                <RotateCw size={14} />
                              </button>
                            )}
                            {isClickable && (
                              <ChevronRight size={14} className="text-white/30" />
                            )}
                            <button
                              aria-label="Dismiss generation"
                              title="Dismiss (delete)"
                              onClick={() => handleDismiss(it)}
                              disabled={busyId === it.request_id}
                              className="p-1.5 rounded-md text-white/45 hover:text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
                            >
                              {busyId === it.request_id
                                ? <Loader2 size={14} className="animate-spin" />
                                : <X size={14} />}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
