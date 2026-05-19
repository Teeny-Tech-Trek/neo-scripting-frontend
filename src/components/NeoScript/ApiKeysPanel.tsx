import { useCallback, useEffect, useState } from "react";
import {
  KeyRound, Plus, Loader2, Copy, Check, AlertTriangle, X as XIcon, Trash2,
} from "lucide-react";
import {
  listApiKeys, createApiKey, revokeApiKey,
  type ApiKey, type ApiKeyCreated,
} from "../../services/ai/apiKeysService";

/* ════════════════════════════════════════════════════════════════════════
   API KEYS PANEL — lives inside the MCP server tab.
   Users mint long-lived `neo_…` keys here. The raw secret is only ever
   returned by POST /user/api-keys and we show it once in a modal — after
   the modal closes, neither the backend nor we can recover it.
   ════════════════════════════════════════════════════════════════════════ */

const fmtWhen = (iso: string | null): string => {
  if (!iso) return "—";
  const sec = Math.round((Date.now() - new Date(iso).getTime()) / 1000);
  if (sec < 60)    return `${sec}s ago`;
  if (sec < 3600)  return `${Math.round(sec / 60)}m ago`;
  if (sec < 86400) return `${Math.round(sec / 3600)}h ago`;
  if (sec < 604800) return `${Math.round(sec / 86400)}d ago`;
  return new Date(iso).toLocaleDateString();
};

type Props = {
  /** Called whenever the key list changes so the parent can update the
      auto-filled config snippet. Optional. */
  onKeysChanged?: (keys: ApiKey[]) => void;
};

export default function ApiKeysPanel({ onKeysChanged }: Props) {
  const [keys, setKeys]       = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  // Create flow
  const [showCreate, setShowCreate] = useState(false);
  const [draftName, setDraftName]   = useState("");
  const [creating, setCreating]     = useState(false);

  // Reveal modal — only present right after creation.
  const [reveal, setReveal]   = useState<ApiKeyCreated | null>(null);
  const [revealCopied, setRevealCopied] = useState(false);

  // Per-row busy state for revoke buttons.
  const [revoking, setRevoking] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const rows = await listApiKeys();
      setKeys(rows);
      onKeysChanged?.(rows);
    } catch (err) {
      setError((err as Error).message || "Couldn't load API keys");
    } finally {
      setLoading(false);
    }
  }, [onKeysChanged]);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async () => {
    const name = draftName.trim();
    if (!name) return;
    setCreating(true);
    try {
      const fresh = await createApiKey(name);
      setReveal(fresh);             // open reveal modal
      setRevealCopied(false);
      setDraftName("");
      setShowCreate(false);
      await load();                 // refresh list (now contains the new key, no secret)
    } catch (err) {
      setError((err as Error).message || "Failed to create key");
    } finally {
      setCreating(false);
    }
  };

  const handleRevoke = async (k: ApiKey) => {
    if (!confirm(`Revoke key "${k.name}"? Any clients using it will stop working immediately.`)) return;
    setRevoking(k.id);
    try {
      await revokeApiKey(k.id);
      await load();
    } catch (err) {
      setError((err as Error).message || "Failed to revoke key");
    } finally {
      setRevoking(null);
    }
  };

  const handleCopyRevealed = async () => {
    if (!reveal) return;
    try {
      await navigator.clipboard.writeText(reveal.secret);
      setRevealCopied(true);
      setTimeout(() => setRevealCopied(false), 2000);
    } catch {}
  };

  return (
    <div
      className="rounded-2xl border border-white/[0.06] p-6 mb-5"
      style={{ background: "rgba(255,255,255,0.015)" }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <KeyRound size={16} className="text-violet-300" />
          <h3 className="text-[15px] font-semibold text-white">Your MCP API keys</h3>
        </div>
        {!showCreate && (
          <button
            onClick={() => setShowCreate(true)}
            className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-white bg-violet-600 hover:bg-violet-500 px-3 py-1.5 rounded-lg shadow-[0_4px_20px_-8px_rgba(124,58,237,0.7)] transition-colors"
          >
            <Plus size={13} />
            New key
          </button>
        )}
      </div>

      <p className="text-[13px] text-white/55 leading-relaxed mb-4">
        Generate a personal key, paste it into your MCP client's config under{" "}
        <code className="text-violet-300 font-mono">Authorization: Bearer …</code>.
        Every tool call from that client is attributed to you — visible in the
        usage panel on the right.
      </p>

      {/* Create form */}
      {showCreate && (
        <div className="rounded-xl border border-violet-500/30 bg-violet-500/[0.04] p-4 mb-4">
          <label className="text-[11px] font-semibold uppercase tracking-[0.1em] text-white/45 mb-2 block">
            Key label
          </label>
          <div className="flex gap-2">
            <input
              autoFocus
              value={draftName}
              onChange={(e) => setDraftName(e.target.value.slice(0, 60))}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCreate();
                if (e.key === "Escape") setShowCreate(false);
              }}
              placeholder="e.g. Claude Desktop · home laptop"
              className="flex-1 bg-transparent border border-white/[0.1] rounded-lg px-3 py-2 text-[13.5px] text-white placeholder:text-white/30 outline-none focus:border-violet-500/50"
            />
            <button
              onClick={handleCreate}
              disabled={creating || !draftName.trim()}
              className={[
                "px-4 py-2 rounded-lg text-[13px] font-semibold flex items-center gap-1.5 transition-colors",
                creating || !draftName.trim()
                  ? "bg-violet-600/40 text-white/60 cursor-not-allowed"
                  : "bg-violet-600 hover:bg-violet-500 text-white",
              ].join(" ")}
            >
              {creating ? <Loader2 size={13} className="animate-spin" /> : <Plus size={13} />}
              {creating ? "Creating…" : "Create"}
            </button>
            <button
              onClick={() => { setShowCreate(false); setDraftName(""); }}
              className="px-3 py-2 rounded-lg text-[13px] font-medium text-white/65 hover:text-white hover:bg-white/[0.05] transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Error banner */}
      {error && (
        <div className="flex items-start gap-2 px-3 py-2 mb-3 rounded-lg bg-red-500/10 border border-red-500/25 text-red-300 text-[12.5px]">
          <AlertTriangle size={13} className="mt-0.5 shrink-0" />
          <span className="flex-1">{error}</span>
          <button onClick={() => setError(null)} className="text-current opacity-70 hover:opacity-100">
            <XIcon size={12} />
          </button>
        </div>
      )}

      {/* List */}
      {loading && keys.length === 0 ? (
        <div className="py-6 flex items-center justify-center text-white/40 text-[13px]">
          <Loader2 size={14} className="animate-spin mr-2" />
          Loading…
        </div>
      ) : keys.length === 0 ? (
        <p className="text-[12.5px] text-white/45 leading-relaxed">
          No keys yet. Click <span className="text-violet-300">New key</span> above to
          generate one — you'll see the secret once, so paste it into your config right away.
        </p>
      ) : (
        <ul className="space-y-2">
          {keys.map((k) => {
            const revoked = !!k.revoked_at;
            return (
              <li
                key={k.id}
                className={[
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-colors",
                  revoked
                    ? "border-white/[0.04] bg-white/[0.012] opacity-60"
                    : "border-white/[0.06] hover:border-white/15",
                ].join(" ")}
              >
                <KeyRound
                  size={14}
                  className={revoked ? "text-white/30 shrink-0" : "text-violet-300 shrink-0"}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2">
                    <span className="text-[13.5px] font-semibold text-white truncate">
                      {k.name}
                    </span>
                    {revoked && (
                      <span className="text-[10.5px] uppercase tracking-wider text-red-300/80 font-semibold">
                        revoked
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-[11.5px] text-white/45 mt-0.5">
                    <code className="font-mono text-white/55">{k.key_prefix}…</code>
                    <span>·</span>
                    <span>created {fmtWhen(k.created_at)}</span>
                    {k.last_used_at && (
                      <>
                        <span>·</span>
                        <span>last used {fmtWhen(k.last_used_at)}</span>
                      </>
                    )}
                  </div>
                </div>
                {!revoked && (
                  <button
                    onClick={() => handleRevoke(k)}
                    disabled={revoking === k.id}
                    aria-label={`Revoke ${k.name}`}
                    title="Revoke this key"
                    className="p-1.5 rounded-md text-white/45 hover:text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
                  >
                    {revoking === k.id
                      ? <Loader2 size={13} className="animate-spin" />
                      : <Trash2 size={13} />}
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {/* Reveal modal — shown ONCE after creation */}
      {reveal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(6px)" }}
        >
          <div
            className="w-full max-w-[560px] rounded-2xl border border-violet-500/40 p-6"
            style={{
              background: "linear-gradient(180deg, rgba(124,58,237,0.08) 0%, rgba(15,15,18,0.95) 100%)",
              boxShadow: "0 30px 80px -20px rgba(124,58,237,0.55)",
            }}
          >
            <div className="flex items-start gap-2 mb-1">
              <KeyRound size={16} className="text-violet-300 mt-0.5 shrink-0" />
              <h4 className="text-[17px] font-bold text-white">
                Your new API key
              </h4>
            </div>
            <p className="text-[13px] text-white/60 leading-relaxed mb-4">
              <span className="text-amber-300 font-semibold">Copy this now.</span>{" "}
              It will never be shown again — if you lose it, just create another.
            </p>

            <div className="flex items-center gap-2 rounded-xl border border-white/[0.1] bg-black/50 px-3.5 py-3 mb-5">
              <code className="flex-1 font-mono text-[13px] text-violet-200 break-all">
                {reveal.secret}
              </code>
              <button
                onClick={handleCopyRevealed}
                className={[
                  "flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[12px] border transition-colors shrink-0",
                  revealCopied
                    ? "text-emerald-300 border-emerald-500/30 bg-emerald-500/10"
                    : "text-white/65 border-white/[0.1] hover:text-white hover:border-white/25",
                ].join(" ")}
              >
                {revealCopied ? <Check size={12} /> : <Copy size={12} />}
                {revealCopied ? "Copied" : "Copy"}
              </button>
            </div>

            <div className="flex items-center justify-between">
              <p className="text-[12px] text-white/40">
                Label: <span className="text-white/70">{reveal.name}</span>
              </p>
              <button
                onClick={() => setReveal(null)}
                className="px-4 py-2 rounded-lg text-[13px] font-semibold bg-violet-600 hover:bg-violet-500 text-white transition-colors"
              >
                I've saved it
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
