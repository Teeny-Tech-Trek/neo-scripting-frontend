import { useEffect, useRef, useState } from "react";
import { Check, Copy, Activity, Loader2, AlertTriangle, History } from "lucide-react";
import {
  getMcpUsage,
  getMcpServerStatus,
  type McpUsage,
  type McpServerStatus,
} from "../../services/ai/mcpService";
import ApiKeysPanel from "./ApiKeysPanel";
import type { ApiKey } from "../../services/ai/apiKeysService";
import { formatErrorMessage } from "../../services/apiError";

// MCP server URL. Falls back to localhost when no deployment URL is provided
// at build time — set VITE_MCP_URL in the frontend env once the MCP server
// has a live URL again (Render, Railway, Fly, wherever you redeploy).
const MCP_URL =
  (import.meta.env.VITE_MCP_URL as string | undefined) ||
  "http://localhost:8080/sse";

const EXAMPLE_PROMPTS = [
  "Script a long-form piece on AI in logistics for my brand",
  "Spin short-form variants of what we just shipped for LinkedIn and Twitter",
  "Ingest this document into the Neo Script knowledge base",
];
// ─────────────────────────────────────────────────────────────────────────

const CLIENTS = ["Claude Desktop", "Claude Code", "Cursor", "Windsurf"];

// Tool names exactly as the MCP server exposes them — these are what your
// agent will call. Renaming here is meaningless; rename in tools.py if you
// need to change the wire-level names.
const AVAILABLE_TOOLS = [
  "generate_blog",
  "ingest_document",
  "upload_user_document",
  "list_user_documents",
  "check_backend_health",
];

const CLIENT_FILENAMES: Record<string, string> = {
  "Claude Desktop": "claude_desktop_config.json",
  "Claude Code": "~/.claude/config.json",
  Cursor: ".cursor/mcp.json",
  Windsurf: "windsurf.config.json",
};

// ─── MCP usage panel helpers ─────────────────────────────────────────────

type ConnectionState = {
  /** Visual badge level — drives color + label */
  level: "live" | "connected" | "online" | "idle" | "unreachable" | "checking";
  label: string;
};

/**
 * Connection-state decision tree, in priority order:
 *   • Still loading the /status ping for the first time → "checking"
 *   • Status ping failed → server is unreachable
 *   • Status ping succeeded AND at least one active SSE session:
 *       → "live" if a tool call landed in the last 5 min, else "connected"
 *   • Status ping succeeded but no sessions:
 *       → "idle" if there was any historical activity, else "online"
 */
const computeConnection = (
  serverStatus: McpServerStatus | null,
  serverPingFailed: boolean,
  lastCallAt: string | null,
): ConnectionState => {
  if (serverStatus === null && !serverPingFailed) {
    return { level: "checking", label: "Checking…" };
  }
  if (serverPingFailed || serverStatus === null) {
    return { level: "unreachable", label: "Server unreachable" };
  }

  const sessions = serverStatus.active_sessions ?? 0;
  const recentMs = lastCallAt ? Date.now() - new Date(lastCallAt).getTime() : Number.POSITIVE_INFINITY;
  const recent = recentMs < 5 * 60_000;

  if (sessions > 0 && recent) {
    return { level: "live", label: `Live now · ${sessions} client${sessions === 1 ? "" : "s"}` };
  }
  if (sessions > 0) {
    return { level: "connected", label: `Connected · ${sessions} client${sessions === 1 ? "" : "s"}` };
  }
  if (lastCallAt) {
    return { level: "idle", label: "Server online · no clients connected" };
  }
  return { level: "online", label: "Server online · waiting for first client" };
};

const CONNECTION_STYLE: Record<ConnectionState["level"], { dot: string; text: string }> = {
  live:        { dot: "bg-emerald-400", text: "text-emerald-400" },
  connected:   { dot: "bg-emerald-400", text: "text-emerald-300" },
  online:      { dot: "bg-violet-400",  text: "text-violet-300"  },
  idle:        { dot: "bg-amber-400",   text: "text-amber-300"   },
  unreachable: { dot: "bg-red-400",     text: "text-red-300"     },
  checking:    { dot: "bg-white/40",    text: "text-white/55"    },
};

const relativeWhen = (iso: string | null): string => {
  if (!iso) return "—";
  const sec = Math.round((Date.now() - new Date(iso).getTime()) / 1000);
  if (sec < 60)    return `${sec}s ago`;
  if (sec < 3600)  return `${Math.round(sec / 60)}m ago`;
  if (sec < 86400) return `${Math.round(sec / 3600)}h ago`;
  if (sec < 604800) return `${Math.round(sec / 86400)}d ago`;
  return new Date(iso).toLocaleDateString();
};

export default function MCPSection() {
  const [copied, setCopied] = useState(false);
  const [client, setClient] = useState("Claude Desktop");

  // Live MCP usage — polled every 30s while the page is open so the
  // "connection" badge degrades from Live → Recent → Idle without a manual
  // refresh. setInterval cleaned up on unmount.
  const [usage, setUsage] = useState<McpUsage | null>(null);
  const [usageLoading, setUsageLoading] = useState(true);
  const [usageError, setUsageError] = useState<string | null>(null);
  const usageTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  // MCP server reachability — independent of any user activity. Polled every
  // 15s so the badge flips to "Server online · waiting for first client" as
  // soon as the MCP bridge is up.
  const [serverStatus, setServerStatus] = useState<McpServerStatus | null>(null);
  const [serverPingFailed, setServerPingFailed] = useState(false);
  const statusTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const u = await getMcpUsage(10);
        if (!cancelled) {
          setUsage(u);
          setUsageError(null);
        }
      } catch (err) {
        if (!cancelled) setUsageError(formatErrorMessage(err, "Failed to load usage"));
      } finally {
        if (!cancelled) setUsageLoading(false);
      }
    };
    load();
    usageTimer.current = setInterval(load, 30_000);
    return () => {
      cancelled = true;
      if (usageTimer.current) clearInterval(usageTimer.current);
    };
  }, []);

  // Ping MCP /status — separate from FastAPI usage. Lets the badge flip to
  // "online" before any tool call has been made.
  useEffect(() => {
    let cancelled = false;
    const ping = async () => {
      try {
        const s = await getMcpServerStatus(MCP_URL);
        if (!cancelled) {
          setServerStatus(s);
          setServerPingFailed(false);
        }
      } catch {
        if (!cancelled) {
          setServerStatus(null);
          setServerPingFailed(true);
        }
      }
    };
    ping();
    statusTimer.current = setInterval(ping, 15_000);
    return () => {
      cancelled = true;
      if (statusTimer.current) clearInterval(statusTimer.current);
    };
  }, []);

  const connection = computeConnection(
    serverStatus,
    serverPingFailed,
    usage?.last_call_at ?? null,
  );
  const connStyle  = CONNECTION_STYLE[connection.level];
  const callsToday = usage?.calls_today ?? 0;
  const dailyLimit = usage?.daily_limit ?? 25;
  const usagePct   = Math.min(100, Math.round((callsToday / Math.max(1, dailyLimit)) * 100));

  // The user's most-recently-created active API key prefix. We surface only
  // the prefix in the config snippet — the full secret is shown once at
  // creation and we never read it back. Falls through to a placeholder so
  // the user sees the shape of the header even before they mint a key.
  const [activeKeyPrefix, setActiveKeyPrefix] = useState<string | null>(null);
  const handleKeysChanged = (keys: ApiKey[]) => {
    const active = keys.find((k) => !k.revoked_at) ?? null;
    setActiveKeyPrefix(active?.key_prefix ?? null);
  };

  // ── Per-client config snippet ─────────────────────────────────────────────
  // Claude Desktop + Claude Code only support STDIO MCP servers in their
  // config file — they spawn a local command and talk over stdin/stdout.
  // We use the `mcp-remote` bridge to turn our remote SSE endpoint into a
  // local stdio server those clients can launch. Cursor and Windsurf both
  // accept a direct SSE URL config, so we emit the simpler shape there.
  //
  // Windows quirk: on Windows, Claude Desktop wraps the command in
  // `cmd.exe /C ...`. If we use "command": "npx", Claude resolves it to
  // `C:\Program Files\nodejs\npx.cmd` — the space in "Program Files"
  // then breaks cmd.exe's argument parsing. Workaround: use "command": "cmd"
  // and let cmd resolve npx itself via PATH.
  const bearerToken = activeKeyPrefix ? `${activeKeyPrefix}…` : "<your-api-key>";
  const needsBridge = client === "Claude Desktop" || client === "Claude Code";
  const isWindows =
    typeof navigator !== "undefined" &&
    /win/i.test(navigator.platform || navigator.userAgent || "");

  const bridgeBaseArgs = [
    "-y",
    "mcp-remote",
    MCP_URL,
    "--header",
    `Authorization: Bearer ${bearerToken}`,
  ];

  const bridgeEntry = isWindows
    ? { command: "cmd", args: ["/c", "npx", ...bridgeBaseArgs] }
    : { command: "npx", args: bridgeBaseArgs };

  const configSnippet = needsBridge
    ? JSON.stringify({ mcpServers: { "neo-script": bridgeEntry } }, null, 2)
    : JSON.stringify(
        {
          mcpServers: {
            "neo-script": {
              type: "sse",
              url: MCP_URL,
              headers: {
                Authorization: `Bearer ${bearerToken}`,
              },
            },
          },
        },
        null,
        2,
      );

  const [snippetCopied, setSnippetCopied] = useState(false);
  const handleCopySnippet = async () => {
    try {
      await navigator.clipboard.writeText(configSnippet);
      setSnippetCopied(true);
      setTimeout(() => setSnippetCopied(false), 1800);
    } catch {}
  };

  // Original handler — UNCHANGED
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(MCP_URL);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5">
      {/* MAIN COLUMN */}
      <div>
      {/* ─── API keys card ─── */}
      <ApiKeysPanel onKeysChanged={handleKeysChanged} />

      {/* ─── Connect card ─── */}
      <div
        className="rounded-2xl border border-white/[0.06] p-7 shadow-[0_1px_0_rgba(255,255,255,0.02)_inset]"
        style={{ background: "rgba(255,255,255,0.015)" }}
      >
        <div className="flex items-start justify-between mb-2">
          <h2 className="text-[22px] font-semibold tracking-tight text-white">
            Connect Neo Script to your agent
          </h2>
          <div className="flex items-center gap-2 mt-1.5">
            <span className="relative flex h-2 w-2">
              {(connection.level === "live" || connection.level === "connected") && (
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${connStyle.dot} opacity-60`} />
              )}
              <span className={`relative inline-flex rounded-full h-2 w-2 ${connStyle.dot}`} />
            </span>
            <span className={`text-[13px] font-medium ${connStyle.text}`}>
              {connection.label}
            </span>
          </div>
        </div>
        <p className="text-[14px] text-white/50 leading-relaxed mb-8 max-w-lg">
          Point any compatible client at the URL below to call Neo Script from
          inside your agent workflow.
        </p>

        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/45 mb-3">
          Server URL
        </p>
        <div
          className="flex items-center gap-3 rounded-xl px-4 py-3.5 border border-white/[0.08] mb-8"
          style={{ background: "rgba(0,0,0,0.4)" }}
        >
          <code className="flex-1 font-mono text-[14px] text-white/85 tracking-tight truncate">
            {MCP_URL}
          </code>
          <button
            onClick={handleCopy}
            className={[
              "flex items-center gap-1.5 text-[12px] px-2.5 py-1 rounded-md border transition-all",
              copied
                ? "text-emerald-400 border-emerald-500/30 bg-emerald-500/10"
                : "text-white/55 border-white/[0.08] hover:text-white hover:border-white/20",
            ].join(" ")}
            aria-label="Copy MCP URL"
          >
            {copied ? (
              <>
                <Check size={12} /> Copied
              </>
            ) : (
              <>
                <Copy size={12} /> Copy
              </>
            )}
          </button>
        </div>

        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/45 mb-3">
          Choose your client
        </p>
        <div className="flex flex-wrap gap-2 mb-5">
          {CLIENTS.map((c) => (
            <button
              key={c}
              onClick={() => setClient(c)}
              className={[
                "px-4 py-1.5 rounded-full text-[13px] font-medium transition-all duration-200 border",
                c === client
                  ? "bg-violet-600/90 border-violet-500 text-white shadow-[0_4px_20px_-6px_rgba(124,58,237,0.5)]"
                  : "bg-transparent border-white/[0.1] text-white/65 hover:border-white/25 hover:text-white",
              ].join(" ")}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="rounded-xl border border-white/[0.08] bg-black/40 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2 border-b border-white/[0.06] bg-white/[0.02]">
            <span className="text-[12px] font-mono text-white/45">
              {CLIENT_FILENAMES[client]}
            </span>
            <button
              onClick={handleCopySnippet}
              className={[
                "text-[12px] inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md transition-colors",
                snippetCopied
                  ? "text-emerald-300"
                  : "text-white/45 hover:text-white",
              ].join(" ")}
            >
              {snippetCopied ? <Check size={12} /> : <Copy size={12} />}
              {snippetCopied ? "Copied" : "Copy"}
            </button>
          </div>
          <pre className="px-5 py-4 text-[13px] font-mono leading-relaxed overflow-x-auto text-white/85">
            <code>{configSnippet}</code>
          </pre>
          {needsBridge && (
            <div className="px-5 py-2.5 border-t border-white/[0.06] text-[11.5px] text-white/55 bg-white/[0.02] leading-relaxed">
              {client} only launches MCP servers as local commands, so we wrap
              the remote endpoint with{" "}
              <code className="font-mono text-violet-300">mcp-remote</code> (an
              npm bridge that proxies stdio ↔ SSE). Requires Node.js installed
              on your machine — <code className="font-mono text-violet-300">npx</code>{" "}
              fetches the bridge on first launch.
            </div>
          )}
          {!activeKeyPrefix ? (
            <div className="px-5 py-2.5 border-t border-white/[0.06] text-[11.5px] text-amber-300/85 bg-amber-500/[0.04]">
              ⚠ Mint an API key above first — replace{" "}
              <code className="font-mono text-amber-200">&lt;your-api-key&gt;</code>{" "}
              with the secret shown in the reveal dialog.
            </div>
          ) : (
            <div className="px-5 py-2.5 border-t border-white/[0.06] text-[11.5px] text-white/45">
              Replace{" "}
              <code className="font-mono text-white/65">{activeKeyPrefix}…</code>{" "}
              with the full key you copied when you created it.
            </div>
          )}
        </div>

        <div className="flex items-center gap-4 pt-7 mt-7 border-t border-white/[0.06]">
          <button className="bg-violet-600 hover:bg-violet-500 text-white font-semibold text-[14px] py-2.5 px-5 rounded-xl transition-all duration-200 shadow-[0_8px_30px_-8px_rgba(124,58,237,0.6)] inline-flex items-center gap-2">
            <Check size={15} strokeWidth={3} />
            Test connection
          </button>
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${connStyle.dot}`} />
            <span className="text-[13px] text-white/55">
              <span className={connStyle.text}>{connection.label}</span>
              {" · "}
              <span className="text-white/80">{callsToday}/{dailyLimit} calls today</span>
              {" · "}
              <span className="text-white/60">{AVAILABLE_TOOLS.length} tools</span>
            </span>
          </div>
        </div>
      </div>
      </div>{/* /MAIN COLUMN */}

      {/* SIDEBAR */}
      <aside className="flex flex-col gap-5">
        {/* ─── USAGE PANEL ─── */}
        <div
          className="rounded-2xl border border-white/[0.06] p-5"
          style={{ background: "rgba(255,255,255,0.015)" }}
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[15px] font-semibold text-white inline-flex items-center gap-1.5">
              <Activity size={14} className="text-violet-300" />
              Your usage
            </h3>
            {usage && (
              <span className="text-[11px] uppercase tracking-wider text-white/40 font-semibold">
                {usage.plan_name}
              </span>
            )}
          </div>

          {usageLoading && !usage ? (
            <div className="py-5 flex items-center justify-center text-white/40 text-[13px]">
              <Loader2 size={14} className="animate-spin mr-2" />
              Loading usage…
            </div>
          ) : usageError ? (
            <div className="flex items-start gap-2 text-[12px] text-red-400/90">
              <AlertTriangle size={13} className="mt-0.5 shrink-0" />
              <span>{usageError}</span>
            </div>
          ) : (
            <>
              {/* Connection state */}
              <div className="flex items-center gap-2 mb-3">
                <span className={`w-2 h-2 rounded-full ${connStyle.dot}`} />
                <span className={`text-[13px] font-medium ${connStyle.text}`}>
                  {connection.label}
                </span>
                {usage?.last_call_at && (
                  <span className="text-[11.5px] text-white/40 ml-auto">
                    last: {relativeWhen(usage.last_call_at)}
                  </span>
                )}
              </div>

              {/* Calls today bar */}
              <div className="mb-1.5 flex items-baseline justify-between">
                <span className="text-[12px] text-white/55">Calls today</span>
                <span className="text-[13px] font-bold text-white font-mono">
                  {callsToday} <span className="text-white/40">/ {dailyLimit}</span>
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${usagePct}%`,
                    background: callsToday >= dailyLimit
                      ? "linear-gradient(90deg,#ef4444,#f87171)"
                      : "linear-gradient(90deg,#7c3aed,#a855f7)",
                    boxShadow: "0 0 12px rgba(124,58,237,0.5)",
                  }}
                />
              </div>
              <p className="text-[11px] text-white/35 mt-2">
                Resets at 00:00 UTC. This month: {usage?.calls_this_month ?? 0} calls.
              </p>
            </>
          )}
        </div>

        {/* ─── RECENT CALLS ─── */}
        <div
          className="rounded-2xl border border-white/[0.06] p-5"
          style={{ background: "rgba(255,255,255,0.015)" }}
        >
          <h3 className="text-[15px] font-semibold text-white mb-3 inline-flex items-center gap-1.5">
            <History size={14} className="text-violet-300" />
            Recent calls
          </h3>

          {usageLoading && !usage ? (
            <div className="py-4 flex items-center justify-center text-white/40 text-[12px]">
              <Loader2 size={12} className="animate-spin mr-2" />
              Loading…
            </div>
          ) : !usage || usage.recent_calls.length === 0 ? (
            <p className="text-[12.5px] text-white/45 leading-snug">
              No MCP calls yet. Configure your client below and ask your agent
              to generate something — calls will show up here with their title
              and timestamp (not the generated content).
            </p>
          ) : (
            <ul className="space-y-2.5">
              {usage.recent_calls.map((c) => (
                <li
                  key={c.request_id}
                  className="rounded-lg border border-white/[0.05] px-3 py-2 hover:border-white/15 transition-colors"
                >
                  <p className="text-[13px] text-white/90 truncate" title={c.title}>
                    {c.title}
                  </p>
                  <div className="flex items-center gap-1.5 mt-1 text-[11.5px] text-white/45">
                    <span>{relativeWhen(c.requested_at)}</span>
                    <span aria-hidden>·</span>
                    <span className={
                      c.status === "success"   ? "text-emerald-400" :
                      c.status === "failed"    ? "text-red-400"     :
                      c.status === "running"   ? "text-violet-300"  :
                      c.status === "cancelled" ? "text-amber-300"   :
                      "text-white/55"
                    }>
                      {c.status}
                    </span>
                    {c.duration_ms != null && (
                      <>
                        <span aria-hidden>·</span>
                        <span className="font-mono">{(c.duration_ms / 1000).toFixed(1)}s</span>
                      </>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div
          className="rounded-2xl border border-white/[0.06] p-5"
          style={{ background: "rgba(255,255,255,0.015)" }}
        >
          <h3 className="text-[15px] font-semibold text-white mb-1">
            Try saying
          </h3>
          <p className="text-[12px] text-white/40 mb-5">
            Once connected, ask your agent:
          </p>
          <div className="space-y-2.5">
            {EXAMPLE_PROMPTS.map((prompt) => (
              <div
                key={prompt}
                className="group flex items-start gap-2.5 px-3.5 py-3 rounded-xl border border-white/[0.07] hover:border-violet-500/30 hover:bg-violet-500/[0.05] transition-all duration-200 cursor-pointer"
              >
                <span className="mt-0.5 text-violet-400 flex-shrink-0 text-sm group-hover:translate-x-0.5 transition-transform">
                  →
                </span>
                <p className="text-[13px] text-white/55 italic leading-snug group-hover:text-white/85 transition-colors">
                  {prompt}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div
          className="rounded-2xl border border-white/[0.06] p-5"
          style={{ background: "rgba(255,255,255,0.015)" }}
        >
          <h3 className="text-[15px] font-semibold text-white mb-4">
            Available tools
          </h3>
          <ul className="space-y-2.5">
            {AVAILABLE_TOOLS.map((t) => (
              <li
                key={t}
                className="flex items-center gap-2.5 text-[13px] font-mono text-white/65"
              >
                <span className="w-1 h-1 rounded-full bg-violet-400 flex-shrink-0" />
                {t}
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </div>
  );
}