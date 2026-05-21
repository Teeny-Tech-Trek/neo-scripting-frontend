import { useEffect, useState } from "react";
import type { DragEvent } from "react";
import {
  ChevronDown, ChevronUp, ArrowRight, Loader2, FileText,
  Paperclip, X as XIcon, CheckCircle2, AlertCircle,
} from "lucide-react";
import MCPSection from "./MCPSection";
import type { BriefData, GenerationMode, SocialPlatform, ViewMode } from "./pages/Home";
import {
  getGeneration,
  listGenerations,
  type GenerationHistoryItem,
} from "../../services/ai/generationsService";
import {
  listBrands,
  uploadDocument,
  type UserBrandSummary,
} from "../../services/ai/documentsService";

const SOCIALS: { label: string; value: SocialPlatform }[] = [
  { label: "LinkedIn", value: "linkedin" },
  { label: "Twitter",  value: "twitter"  },
  { label: "Reddit",   value: "reddit"   },
];

const ACCEPTED_EXTS = new Set([".md", ".txt", ".pdf", ".docx"]);
const ACCEPTED_ATTR = ".md,.txt,.pdf,.docx";

const fileExt = (name: string): string => {
  const i = name.lastIndexOf(".");
  return i >= 0 ? name.slice(i).toLowerCase() : "";
};

const navigateTo = (path: string) => {
  window.history.pushState({}, "", path);
  window.dispatchEvent(new PopStateEvent("popstate"));
};

const relativeTime = (iso: string | null): string => {
  if (!iso) return "—";
  const then = new Date(iso);
  const sec = Math.round((Date.now() - then.getTime()) / 1000);
  if (sec < 60)    return `${sec}s ago`;
  if (sec < 3600)  return `${Math.round(sec / 60)}m ago`;
  if (sec < 86400) return `${Math.round(sec / 3600)}h ago`;
  if (sec < 604800) return `${Math.round(sec / 86400)}d ago`;
  return then.toLocaleDateString();
};

const MCP_URL_SHORT = "neo-script-mcp.com/sse";

type Props = {
  view: ViewMode;
  setView: (v: ViewMode) => void;
  onGenerate: (data: BriefData) => void;
};

export default function HeroSection({ view, setView, onGenerate }: Props) {
  return (
    <section className="relative pt-8 pb-12 px-4 sm:px-6 overflow-hidden">
      {/* Ambient violet glow */}
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
              "radial-gradient(ellipse at center, rgba(124,58,237,0.18) 0%, rgba(124,58,237,0.06) 45%, transparent 70%)",
            filter: "blur(8px)",
          }}
        />
      </div>

      <div className="relative max-w-[1180px] mx-auto">
        {/* ─── View toggle (centered) ─── */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-0.5 bg-white/[0.03] border border-white/[0.06] rounded-full p-1">
            <button
              onClick={() => setView("web")}
              className={[
                "px-5 py-1.5 text-[13px] font-medium rounded-full transition-all duration-200",
                view === "web"
                  ? "bg-white/[0.08] text-white shadow-[0_1px_0_rgba(255,255,255,0.04)_inset]"
                  : "text-white/45 hover:text-white/80",
              ].join(" ")}
            >
              Web app
            </button>
            <button
              onClick={() => setView("mcp")}
              className={[
                "px-5 py-1.5 text-[13px] font-medium rounded-full transition-all duration-200",
                view === "mcp"
                  ? "bg-white/[0.08] text-white shadow-[0_1px_0_rgba(255,255,255,0.04)_inset]"
                  : "text-white/45 hover:text-white/80",
              ].join(" ")}
            >
              MCP server
            </button>
          </div>
        </div>

        {/* ─── Conditional content ─── */}
        {view === "web" ? (
          <BriefForm onGenerate={onGenerate} />
        ) : (
          <MCPSection />
        )}
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   BRIEF FORM — Web app view
   ═══════════════════════════════════════════════════════════════════════ */
function BriefForm({ onGenerate }: { onGenerate: (d: BriefData) => void }) {
  const [topic, setTopic] = useState(
    "How AI agents are transforming last-mile logistics in 2025"
  );
  const [brand, setBrand] = useState("Acme Logistics");
  const [companyUrl, setCompanyUrl] = useState("acme.com");
  // One generation per request — blog OR a single social post.
  const [mode, setMode] = useState<GenerationMode>("blog");
  const [platform, setPlatform] = useState<SocialPlatform>("linkedin");
  // Whether to feed this brand's uploaded reference docs into the pipeline.
  // Defaults off — opt-in, since most generations don't need it.
  const [useUserDocs, setUseUserDocs] = useState(false);
  // Prevent double-submit while the parent transitions to the GeneratorForm.
  const [submitting, setSubmitting] = useState(false);
  // Banner shown while a retry-prefill is in flight (or if it fails).
  const [prefill, setPrefill] = useState<{ kind: "loading" | "error"; text: string } | null>(null);

  // Advanced-options panel + quick attach (uploads to the brand on this form
  // without leaving — the equivalent of an attach-file button on ChatGPT).
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [attachDragOver, setAttachDragOver] = useState(false);
  const [attachUploading, setAttachUploading] = useState(false);
  const [attachMsg, setAttachMsg] = useState<
    | { kind: "ok"; text: string }
    | { kind: "err"; text: string }
    | null
  >(null);

  // Custom keyword chips. The Writer agent is told to include each one
  // verbatim in the output. Cap matches the backend Pydantic limit.
  const KEYWORD_MAX = 10;
  const KEYWORD_LEN_MAX = 60;
  const [keywords, setKeywords] = useState<string[]>([]);
  const [keywordDraft, setKeywordDraft] = useState("");

  const addKeyword = (raw: string) => {
    const cleaned = raw.trim().replace(/\s+/g, " ");
    if (!cleaned) return;
    if (cleaned.length > KEYWORD_LEN_MAX) return;
    // De-dup case-insensitively but keep the user's original casing.
    const dup = keywords.some((k) => k.toLowerCase() === cleaned.toLowerCase());
    if (dup) return;
    if (keywords.length >= KEYWORD_MAX) return;
    setKeywords((prev) => [...prev, cleaned]);
  };

  const removeKeyword = (k: string) => {
    setKeywords((prev) => prev.filter((x) => x !== k));
  };

  const handleKeywordKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Enter or comma finalizes the current draft. Backspace on empty
    // removes the last chip — the standard "tag input" interaction.
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addKeyword(keywordDraft);
      setKeywordDraft("");
    } else if (e.key === "Backspace" && !keywordDraft && keywords.length > 0) {
      e.preventDefault();
      setKeywords((prev) => prev.slice(0, -1));
    }
  };

  const handleKeywordPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const text = e.clipboardData.getData("text");
    // If the pasted text has commas / newlines, split into multiple chips.
    if (/[,\n]/.test(text)) {
      e.preventDefault();
      text.split(/[,\n]/).forEach((t) => addKeyword(t));
      setKeywordDraft("");
    }
  };

  // /home?retry=<id> — fetch the original brief and prefill the form. User
  // reviews + clicks Generate. We don't auto-fire to avoid surprise costs.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const retryId = params.get("retry");
    if (!retryId) return;

    setPrefill({ kind: "loading", text: "Loading original brief…" });
    (async () => {
      try {
        const d = await getGeneration(retryId);
        setTopic(d.prompt || d.generated_topic || "");
        setBrand(d.brand_name || "");
        setCompanyUrl((d.company_url || "").replace(/^https?:\/\//, ""));
        if (d.platforms && d.platforms.length > 0) {
          setMode("social");
          const first = d.platforms[0] as SocialPlatform;
          if (first === "linkedin" || first === "twitter" || first === "reddit") {
            setPlatform(first);
          }
        } else {
          setMode("blog");
        }
        setPrefill(null);
        // Clean the URL so a refresh doesn't re-fetch.
        window.history.replaceState({}, "", "/home");
      } catch (err) {
        setPrefill({ kind: "error", text: (err as Error).message || "Couldn't load original brief" });
      }
    })();
  }, []);

  const fieldsInvalid = !topic.trim() || !brand.trim() || !companyUrl.trim();
  const disabled = fieldsInvalid || submitting;

  const handleSubmit = () => {
    if (disabled) return;
    // Commit any unfinalized keyword draft so it doesn't get silently dropped.
    let finalKeywords = keywords;
    const pending = keywordDraft.trim();
    if (pending && keywords.length < KEYWORD_MAX) {
      const dup = keywords.some((k) => k.toLowerCase() === pending.toLowerCase());
      if (!dup && pending.length <= KEYWORD_LEN_MAX) {
        finalKeywords = [...keywords, pending];
      }
    }
    setSubmitting(true);
    onGenerate({
      topic,
      brand,
      companyUrl,
      mode,
      platform: mode === "social" ? platform : undefined,
      useUserDocs,
      keywords: finalKeywords,
    });
  };

  // ── Quick attach (inside Advanced options) ────────────────────────────
  // Uploads to whatever the user typed in the Brand field. Validates ext
  // client-side so we don't waste a round-trip on a bogus type.

  const attachFile = async (f: File | null | undefined) => {
    if (!f) return;
    const ext = fileExt(f.name);
    if (!ACCEPTED_EXTS.has(ext)) {
      setAttachMsg({
        kind: "err",
        text: `Unsupported "${ext || "(no extension)"}". Allowed: .md, .txt, .pdf, .docx`,
      });
      return;
    }
    const brandClean = brand.trim();
    if (!brandClean) {
      setAttachMsg({ kind: "err", text: "Add a brand name first — that's where the doc gets filed." });
      return;
    }

    setAttachUploading(true);
    setAttachMsg(null);
    try {
      const result = await uploadDocument(brandClean, f);
      if (result.duplicate) {
        setAttachMsg({ kind: "ok", text: `Already in ${brandClean}'s knowledge base.` });
      } else if (result.success) {
        setAttachMsg({
          kind: "ok",
          text: `Attached "${result.title || f.name}" · ${result.chunk_count ?? 0} chunks.`,
        });
        // If the user just attached a doc, they almost certainly want it used.
        setUseUserDocs(true);
      } else {
        setAttachMsg({ kind: "err", text: result.error || "Upload failed" });
      }
    } catch (err) {
      setAttachMsg({ kind: "err", text: (err as Error).message || "Upload failed" });
    } finally {
      setAttachUploading(false);
    }
  };

  const handleAttachDragOver = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    if (!attachDragOver) setAttachDragOver(true);
  };
  const handleAttachDragLeave = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setAttachDragOver(false);
  };
  const handleAttachDrop = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setAttachDragOver(false);
    attachFile(e.dataTransfer?.files?.[0]);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-5 ">
      {/* LEFT SIDEBAR — Brands + Recent + MCP. Rendered first so it sits on
          the left at lg+ widths; on mobile it stacks above the form. */}
      <aside className="flex flex-col gap-5 order-2 lg:order-1">
        <BrandsSidebar />
        <RecentSidebar />

        <div
          className="rounded-2xl border border-white/[0.06] p-5"
          style={{ background: "rgba(255,255,255,0.015)" }}
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
            </span>
            <h3 className="text-[14px] font-semibold text-white">
              MCP server live
            </h3>
          </div>
          <p className="text-[12.5px] text-white/50 leading-relaxed mb-3">
            Use Neo Script from Claude, Cursor or any MCP client.
          </p>
          <div className="flex items-center gap-2 rounded-lg border border-white/[0.08] bg-black/40 px-2.5 py-1.5">
            <code className="flex-1 font-mono text-[11.5px] text-violet-300 truncate">
              {MCP_URL_SHORT}
            </code>
          </div>
        </div>
      </aside>

      {/* MAIN CARD */}
      <div
        className="rounded-2xl border border-white/[0.06] p-7 shadow-[0_1px_0_rgba(255,255,255,0.02)_inset] order-1 lg:order-2"
        style={{ background: "rgba(255,255,255,0.015)" }}
      >
        <div className="flex items-start justify-between mb-6">
          <h2 className="text-[22px] font-semibold tracking-tight text-white">
            New brief
          </h2>
          <span className="text-[12px] text-white/40 mt-2">
            Multi-agent · 30–60s
          </span>
        </div>

        {prefill && (
          <div
            className={[
              "mb-4 flex items-center gap-2 px-3 py-2 rounded-lg text-[12px] border",
              prefill.kind === "loading"
                ? "bg-white/[0.04]    border-white/[0.08]    text-white/65"
                : "bg-red-500/10      border-red-500/25      text-red-300",
            ].join(" ")}
          >
            {prefill.kind === "loading" && <Loader2 size={12} className="animate-spin" />}
            {prefill.text}
          </div>
        )}

        <p className="text-[13px] font-medium text-white/70 mb-2.5">
          What should we write about?
        </p>
        <input
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="e.g. How AI is transforming logistics operations in 2025"
          className="w-full bg-transparent border border-violet-500/60 rounded-xl px-4 py-3.5 text-[15px] font-medium text-white placeholder:text-white/30 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-500/20 transition-all mb-7"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-7">
          <div>
            <p className="text-[13px] font-medium text-white/70 mb-2.5">
              Brand
            </p>
            <input
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              placeholder="e.g. Acme Corp"
              className="w-full bg-transparent border border-white/[0.1] rounded-xl px-4 py-3 text-[14px] font-medium text-white placeholder:text-white/25 outline-none focus:border-violet-500/40 hover:border-white/20 transition-colors"
            />
          </div>
          <div>
            <p className="text-[13px] font-medium text-white/70 mb-2.5">
              Company URL
            </p>
            <div className="flex items-center w-full bg-transparent border border-white/[0.1] rounded-xl px-4 py-3 text-[14px] hover:border-white/20 focus-within:border-violet-500/40 transition-colors">
              <span className="text-white/30 mr-1">https://</span>
              <input
                value={companyUrl}
                onChange={(e) => setCompanyUrl(e.target.value)}
                placeholder="acme.com"
                className="flex-1 bg-transparent text-white font-medium placeholder:text-white/25 outline-none"
              />
            </div>
          </div>
        </div>

        <p className="text-[13px] font-medium text-white/70 mb-2.5">
          What do you want to generate?
        </p>
        <div className="flex flex-wrap gap-2 mb-5">
          {(["blog", "social"] as GenerationMode[]).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={[
                "px-4 py-1.5 rounded-full text-[13px] font-medium transition-all duration-200 border",
                mode === m
                  ? "bg-violet-600/90 border-violet-500 text-white shadow-[0_4px_20px_-6px_rgba(124,58,237,0.5)]"
                  : "bg-transparent border-white/[0.1] text-white/65 hover:border-white/25 hover:text-white",
              ].join(" ")}
            >
              {m === "blog" ? "Long-form" : "Short-form"}
            </button>
          ))}
        </div>

        {mode === "social" && (
          <>
            <p className="text-[13px] font-medium text-white/70 mb-2.5">
              Platform
            </p>
            <div className="flex flex-wrap gap-2 mb-7">
              {SOCIALS.map((s) => (
                <button
                  key={s.value}
                  onClick={() => setPlatform(s.value)}
                  className={[
                    "px-4 py-1.5 rounded-full text-[13px] font-medium transition-all duration-200 border",
                    platform === s.value
                      ? "bg-violet-600/90 border-violet-500 text-white shadow-[0_4px_20px_-6px_rgba(124,58,237,0.5)]"
                      : "bg-transparent border-white/[0.1] text-white/65 hover:border-white/25 hover:text-white",
                  ].join(" ")}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </>
        )}

        {/* ─── Reference documents toggle ─── */}
        <button
          type="button"
          role="switch"
          aria-checked={useUserDocs}
          onClick={() => setUseUserDocs((v) => !v)}
          className={[
            "w-full flex items-start gap-3 px-4 py-3 mb-7 rounded-xl border text-left transition-colors",
            useUserDocs
              ? "border-violet-500/40 bg-violet-500/[0.06] hover:bg-violet-500/[0.08]"
              : "border-white/[0.1]   bg-transparent       hover:border-white/25",
          ].join(" ")}
        >
          {/* Switch track */}
          <span
            className={[
              "mt-0.5 inline-flex shrink-0 h-5 w-9 rounded-full p-0.5 transition-colors",
              useUserDocs ? "bg-violet-500" : "bg-white/[0.12]",
            ].join(" ")}
          >
            <span
              className={[
                "h-4 w-4 rounded-full bg-white shadow transition-transform",
                useUserDocs ? "translate-x-4" : "translate-x-0",
              ].join(" ")}
            />
          </span>
          <span className="flex-1 min-w-0">
            <span
              className={[
                "block text-[13.5px] font-medium",
                useUserDocs ? "text-white" : "text-white/85",
              ].join(" ")}
            >
              Use my uploaded reference docs for{" "}
              <span className="text-violet-300">
                {brand.trim() || "this brand"}
              </span>
            </span>
            <span className="block text-[12px] text-white/45 mt-0.5">
              Pulls relevant chunks from documents you uploaded under this brand
              name and feeds them to the writer agents. Manage docs on{" "}
              <a
                href="/documents"
                onClick={(e) => e.stopPropagation()}
                className="text-violet-300 hover:text-violet-200 underline-offset-2 hover:underline"
              >
                Documents
              </a>
              .
            </span>
          </span>
        </button>

        {/* ─── Advanced options (collapsible) ─── */}
        <div className="pb-7 border-b border-white/[0.06]">
          <button
            type="button"
            onClick={() => setAdvancedOpen((v) => !v)}
            className="w-full flex items-center justify-between text-left text-[13px] text-white/65 hover:text-white transition-colors"
          >
            <span className="flex items-center gap-1.5">
              {advancedOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              Advanced options
            </span>
            <span className="text-[12px] text-white/35">
              keywords · reference doc
            </span>
          </button>

          {advancedOpen && (
            <div className="mt-4 space-y-5">
              {/* ─── Must-include keywords ─── */}
              <div>
                <p className="text-[13px] font-medium text-white/70 mb-1.5">
                  Must-include keywords
                </p>
                <p className="text-[12px] text-white/45 mb-2 leading-relaxed">
                  Press Enter or comma to add. The Writer agent is instructed
                  to include each keyword verbatim in the output. Max{" "}
                  {KEYWORD_MAX} keywords, {KEYWORD_LEN_MAX} characters each.
                </p>

                <div
                  className={[
                    "flex flex-wrap items-center gap-1.5 min-h-[44px] px-3 py-2 rounded-xl border bg-transparent transition-colors",
                    keywords.length >= KEYWORD_MAX
                      ? "border-white/[0.06]"
                      : "border-white/[0.1] focus-within:border-violet-500/40 hover:border-white/20",
                  ].join(" ")}
                >
                  {keywords.map((k) => (
                    <span
                      key={k}
                      className="inline-flex items-center gap-1 pl-2.5 pr-1 py-0.5 rounded-full bg-violet-500/15 border border-violet-500/30 text-[12.5px] text-violet-200"
                    >
                      <span className="max-w-[180px] truncate">{k}</span>
                      <button
                        type="button"
                        onClick={() => removeKeyword(k)}
                        aria-label={`Remove keyword ${k}`}
                        className="w-4 h-4 inline-flex items-center justify-center rounded-full text-violet-200/70 hover:text-white hover:bg-violet-500/30 transition-colors"
                      >
                        <XIcon size={10} strokeWidth={2.5} />
                      </button>
                    </span>
                  ))}

                  {keywords.length < KEYWORD_MAX ? (
                    <input
                      value={keywordDraft}
                      onChange={(e) =>
                        setKeywordDraft(e.target.value.slice(0, KEYWORD_LEN_MAX))
                      }
                      onKeyDown={handleKeywordKeyDown}
                      onPaste={handleKeywordPaste}
                      onBlur={() => {
                        if (keywordDraft.trim()) {
                          addKeyword(keywordDraft);
                          setKeywordDraft("");
                        }
                      }}
                      placeholder={
                        keywords.length === 0
                          ? 'e.g. "agentic AI", "last-mile", "2026 outlook"'
                          : "Add another…"
                      }
                      className="flex-1 min-w-[120px] bg-transparent text-[13px] text-white placeholder:text-white/30 outline-none py-0.5"
                    />
                  ) : (
                    <span className="text-[12px] text-white/40 italic">
                      Maximum reached — remove one to add more.
                    </span>
                  )}
                </div>
              </div>

              {/* ─── Quick attach ─── */}
              <p className="text-[12px] text-white/55 mb-2 leading-relaxed">
                Attach a doc that's specifically relevant to this generation.
                It saves to{" "}
                <span className="text-violet-300">
                  {brand.trim() || "the brand you type above"}
                </span>
                's knowledge base and gets used automatically for this run.
                Manage everything on{" "}
                <a
                  href="/documents"
                  className="text-violet-300 hover:text-violet-200 underline-offset-2 hover:underline"
                >
                  Documents
                </a>
                .
              </p>

              <label
                htmlFor="brief-attach-input"
                onDragEnter={handleAttachDragOver}
                onDragOver={handleAttachDragOver}
                onDragLeave={handleAttachDragLeave}
                onDrop={handleAttachDrop}
                className={[
                  "block w-full rounded-xl border border-dashed px-4 py-4 cursor-pointer transition-colors",
                  attachDragOver
                    ? "border-violet-400 bg-violet-500/[0.08]"
                    : "border-white/15 bg-white/[0.015] hover:border-white/30 hover:bg-white/[0.03]",
                ].join(" ")}
              >
                <input
                  id="brief-attach-input"
                  type="file"
                  accept={ACCEPTED_ATTR}
                  disabled={attachUploading}
                  onChange={(e) => {
                    const f = e.target.files?.[0] ?? null;
                    e.target.value = ""; // allow re-uploading the same file
                    attachFile(f);
                  }}
                  className="sr-only"
                />
                <div className="flex items-center gap-3">
                  {attachUploading ? (
                    <Loader2 size={16} className="text-violet-300 animate-spin" />
                  ) : (
                    <Paperclip
                      size={16}
                      className={attachDragOver ? "text-violet-300" : "text-white/45"}
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    {attachDragOver ? (
                      <span className="text-[13px] font-medium text-violet-200">
                        Release to attach
                      </span>
                    ) : attachUploading ? (
                      <span className="text-[13px] font-medium text-white/80">
                        Uploading…
                      </span>
                    ) : (
                      <>
                        <span className="text-[13px] font-medium text-white/85">
                          Drop a file, or{" "}
                          <span className="text-violet-300">click to browse</span>
                        </span>
                        <span className="block text-[11.5px] text-white/40 mt-0.5">
                          .md, .txt, .pdf, .docx · up to 10 MB
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </label>

              {attachMsg && (
                <div
                  className={[
                    "mt-3 flex items-start gap-2 px-3 py-2 rounded-lg text-[12.5px] border",
                    attachMsg.kind === "ok"
                      ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-300"
                      : "bg-red-500/10     border-red-500/25     text-red-300",
                  ].join(" ")}
                >
                  {attachMsg.kind === "ok" ? (
                    <CheckCircle2 size={13} className="mt-0.5 shrink-0" />
                  ) : (
                    <AlertCircle  size={13} className="mt-0.5 shrink-0" />
                  )}
                  <span className="flex-1 min-w-0">{attachMsg.text}</span>
                  <button
                    type="button"
                    onClick={() => setAttachMsg(null)}
                    aria-label="Dismiss"
                    className="text-current opacity-60 hover:opacity-100"
                  >
                    <XIcon size={12} />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 pt-7">
          <button
            onClick={handleSubmit}
            disabled={disabled}
            className={[
              "flex-1 group font-semibold text-[15px] py-3.5 px-6 rounded-xl transition-all duration-200",
              disabled
                ? "bg-violet-600/40 text-white/60 cursor-not-allowed"
                : "bg-violet-600 hover:bg-violet-500 text-white shadow-[0_8px_30px_-8px_rgba(124,58,237,0.6)] hover:shadow-[0_8px_30px_-4px_rgba(124,58,237,0.8)]",
            ].join(" ")}
          >
            <span className="inline-flex items-center gap-2">
              {submitting
                ? "Starting…"
                : mode === "blog"
                  ? "Run script"
                  : `Run for ${SOCIALS.find(s => s.value === platform)?.label ?? ""}`}
              <ArrowRight
                size={16}
                className="group-hover:translate-x-0.5 transition-transform"
              />
            </span>
          </button>
          {/* <button
            aria-label="Download"
            className="w-12 h-12 rounded-full bg-white/[0.06] border border-white/[0.08] flex items-center justify-center hover:bg-white/[0.1] transition-colors"
          >
            <ArrowDown size={16} className="text-white/70" />
          </button> */}
          <kbd className="hidden sm:flex items-center gap-1 text-[11px] text-white/35 font-mono px-2">
            ⌘ + ↵
          </kbd>
        </div>
      </div>

    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   RECENT SIDEBAR — last 4 of the user's generations, clickable
   ═══════════════════════════════════════════════════════════════════════ */
function RecentSidebar() {
  const [items, setItems]     = useState<GenerationHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        // Pull a few extra so we still end up with ~4 after dropping failures.
        const rows = await listGenerations(12);
        if (!cancelled) {
          setItems(rows.filter((r) => r.status === "success").slice(0, 4));
        }
      } catch (err) {
        if (!cancelled) setError((err as Error).message || "Couldn't load");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const handleClick = (it: GenerationHistoryItem) => {
    if (it.status !== "success") return;
    navigateTo(`/result?req=${it.request_id}`);
  };

  return (
    <div
      className="rounded-2xl border border-white/[0.06] p-5"
      style={{ background: "rgba(255,255,255,0.015)" }}
    >
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={() => navigateTo("/history")}
          className="text-[14px] font-semibold text-white hover:text-violet-200 transition-colors"
        >
          History
        </button>
        <button
          type="button"
          onClick={() => navigateTo("/history")}
          className="text-[12px] text-white/45 hover:text-white transition-colors inline-flex items-center gap-0.5"
        >
          See all <ArrowRight size={11} />
        </button>
      </div>

      {loading ? (
        <div className="py-6 flex items-center justify-center text-white/40 text-[13px]">
          <Loader2 size={14} className="animate-spin mr-2" /> Loading…
        </div>
      ) : error ? (
        <p className="text-[12px] text-red-400/80">{error}</p>
      ) : items.length === 0 ? (
        <div className="py-4 flex flex-col items-center text-white/40 text-[12px]">
          <FileText size={20} className="mb-2 text-white/25" />
          No generations yet.
        </div>
      ) : (
        <ul className="space-y-4">
          {items.map((it) => {
            const isClickable = it.status === "success";
            const isBlog = (it.platforms?.length ?? 0) === 0;
            const typeLabel = isBlog
              ? "Long-form"
              : `${it.platforms[0].charAt(0).toUpperCase()}${it.platforms[0].slice(1)}`;
            return (
              <li key={it.request_id}>
                <button
                  type="button"
                  onClick={() => handleClick(it)}
                  disabled={!isClickable}
                  className={[
                    "block w-full text-left transition-colors",
                    isClickable ? "cursor-pointer" : "cursor-default opacity-60",
                  ].join(" ")}
                >
                  <div
                    className={[
                      "text-[14px] font-medium text-white/95 mb-0.5 truncate",
                      isClickable ? "hover:text-violet-300" : "",
                    ].join(" ")}
                  >
                    {it.generated_topic || it.prompt}
                  </div>
                  <div className="text-[12px] text-white/40 flex items-center gap-1.5">
                    <span>{relativeTime(it.requested_at)}</span>
                    <span>·</span>
                    <span className="text-violet-400 font-medium">{typeLabel}</span>
                    {it.status !== "success" && (
                      <>
                        <span>·</span>
                        <span className="text-white/50 italic">{it.status}</span>
                      </>
                    )}
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   BRANDS SIDEBAR — last 4 brands the user uploaded docs for, clickable.
   We can't show individual documents without picking a brand, so the
   sidebar lists brands (each is one row → /documents filtered to it).
   The "See all" button goes to /documents with no filter.
   ═══════════════════════════════════════════════════════════════════════ */
function BrandsSidebar() {
  const [brands, setBrands]   = useState<UserBrandSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const rows = await listBrands();
        // Sort by most-recently-ingested first, take top 4.
        const sorted = [...rows].sort((a, b) => {
          const ta = a.last_ingested_at ? Date.parse(a.last_ingested_at) : 0;
          const tb = b.last_ingested_at ? Date.parse(b.last_ingested_at) : 0;
          return tb - ta;
        });
        if (!cancelled) setBrands(sorted.slice(0, 4));
      } catch (err) {
        if (!cancelled) setError((err as Error).message || "Couldn't load");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return (
    <div
      className="rounded-2xl border border-white/[0.06] p-5"
      style={{ background: "rgba(255,255,255,0.015)" }}
    >
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={() => navigateTo("/documents")}
          className="text-[14px] font-semibold text-white hover:text-violet-200 transition-colors"
        >
          Documents
        </button>
        <button
          type="button"
          onClick={() => navigateTo("/documents")}
          className="text-[12px] text-white/45 hover:text-white transition-colors inline-flex items-center gap-0.5"
        >
          See all <ArrowRight size={11} />
        </button>
      </div>

      {loading ? (
        <div className="py-5 flex items-center justify-center text-white/40 text-[12.5px]">
          <Loader2 size={13} className="animate-spin mr-2" /> Loading…
        </div>
      ) : error ? (
        <p className="text-[12px] text-red-400/80">{error}</p>
      ) : brands.length === 0 ? (
        <div className="py-4 flex flex-col items-center text-white/40 text-[12px] text-center">
          <FileText size={18} className="mb-2 text-white/25" />
          No brands yet. Upload a doc to get started.
        </div>
      ) : (
        <ul className="space-y-3">
          {brands.map((b) => (
            <li key={b.brand_name}>
              <button
                type="button"
                onClick={() => navigateTo("/documents")}
                className="block w-full text-left group"
              >
                <div className="text-[13.5px] font-medium text-white/95 mb-0.5 truncate group-hover:text-violet-300 transition-colors capitalize">
                  {b.brand_name}
                </div>
                <div className="text-[11.5px] text-white/40 flex items-center gap-1.5">
                  <span>{b.doc_count} doc{b.doc_count === 1 ? "" : "s"}</span>
                  {b.last_ingested_at && (
                    <>
                      <span>·</span>
                      <span>{relativeTime(b.last_ingested_at)}</span>
                    </>
                  )}
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}