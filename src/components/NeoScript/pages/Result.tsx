import { useEffect, useState, useCallback, useRef } from "react";
import {
  ArrowLeft, Copy, Check, Download, RefreshCw,
  ExternalLink, FileText,
} from "lucide-react";
import MarkdownViewer from "../MarkdownViewer";
import SocialPostPreview from "../social/SocialPostPreview";
import {
  getGeneration,
  type Citation,
  type CitationSourceKind,
} from "../../../services/ai/generationsService";
import { USER_DOC_PALETTE } from "../MarkdownViewer";

/* ─── same as original ─────────────────────────────────────── */
const STORAGE_KEY = "neo_script_last_result";

type GenerateResult = {
  article_markdown?: string;
  social_posts?: Record<string, string>;
  citations?: Citation[];
  // Per-platform citation lists for the social previews. Same shape as
  // `citations` (which targets the blog), just keyed by platform.
  social_citations?: Record<string, Citation[]>;
  // The brand this generation was scoped to — used by the platform-themed
  // social previews as the "posting account" display name.
  brand?: string;
};

const navigateTo = (path: string) => {
  window.history.pushState({}, "", path);
  window.dispatchEvent(new PopStateEvent("popstate"));
};
/* ────────────────────────────────────────────────────────────── */

/* ─── UI helpers ────────────────────────────────────────────── */
const extractTitle = (md: string): string => {
  const line = md.split("\n").find((l) => l.startsWith("# "));
  return line ? line.replace(/^#+\s*/, "").trim() : "Untitled output";
};

const getWordCount = (md: string): number =>
  md.split(/\s+/).filter((w) => w.length > 0).length;

const getReadTime = (wc: number): number => Math.max(1, Math.ceil(wc / 200));

/* Platform badge with count */
const PlatformBadge: React.FC<{ count: number }> = ({ count }) =>
  count > 0 ? (
    <span
      className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded text-[10px] font-bold"
      style={{
        background: "rgba(124,58,237,0.30)",
        color: "#c4b5fd",
        border: "1px solid rgba(124,58,237,0.40)",
      }}
    >
      {count}
    </span>
  ) : null;

/* Floating selection toolbar */
interface SelectionPos { x: number; y: number }
const TOOLBAR_ACTIONS = ["Rewrite", "Expand", "Shorten", "Change tone", "Ask Neo"];

const SelectionToolbar: React.FC<{ pos: SelectionPos | null; onDismiss: () => void }> = ({
  pos, onDismiss,
}) => {
  if (!pos) return null;
  return (
    <div
      className="fixed z-[9999] flex items-center gap-0.5 px-2 py-1.5 rounded-xl shadow-2xl"
      style={{
        left: pos.x,
        top:  pos.y,
        transform: "translateX(-50%) translateY(-100%)",
        background: "rgba(18,14,45,0.96)",
        border: "1px solid rgba(124,58,237,0.45)",
        backdropFilter: "blur(16px)",
        boxShadow: "0 8px 30px rgba(0,0,0,0.55), 0 0 20px rgba(124,58,237,0.20)",
      }}
    >
      {TOOLBAR_ACTIONS.map((action, i) => (
        <button
          key={action}
          onMouseDown={e => { e.preventDefault(); onDismiss(); }}
          className="px-2.5 py-1 rounded-lg text-[12px] font-semibold transition-colors whitespace-nowrap"
          style={{
            color: i === TOOLBAR_ACTIONS.length - 1 ? "#c4b5fd" : "rgba(255,255,255,0.75)",
            background: "transparent",
          }}
          onMouseEnter={e => (e.currentTarget.style.background = "rgba(124,58,237,0.25)")}
          onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
        >
          {i === 0 && <span style={{ color:"#a855f7", marginRight:4 }}>»</span>}
          {i === TOOLBAR_ACTIONS.length - 1 && <span style={{ marginRight:4, color:"#a855f7" }}>+</span>}
          {action}
        </button>
      ))}
    </div>
  );
};
/* ────────────────────────────────────────────────────────────── */

export default function Result() {
  /* ─── original logic — UNCHANGED ─── */
  const [result, setResult] = useState<GenerateResult | null>(null);
  const [mdCopied, setMdCopied] = useState(false);

  useEffect(() => {
    // 1. Opened from history: /result?req=<id> — fetch from backend.
    const reqId = new URLSearchParams(window.location.search).get("req");
    if (reqId) {
      (async () => {
        try {
          const detail = await getGeneration(reqId);
          const hydrated: GenerateResult = {
            article_markdown: detail.article_markdown ?? "",
            social_posts: detail.social_posts || {},
            citations: detail.citations || [],
            social_citations: detail.social_citations || {},
            brand: detail.brand_name ?? "",
          };
          sessionStorage.setItem(STORAGE_KEY, JSON.stringify(hydrated));
          setResult(hydrated);
        } catch {
          // Fall through to local sources if the fetch fails.
        }
      })();
      return;
    }

    // 2. Fresh generation pushed state via navigateTo("/result", data).
    //    Tolerate the legacy `blog_markdown` key on any state pushed before the
    //    rename by coercing it onto the canonical `article_markdown`.
    const navState = window.history.state as
      | (GenerateResult & { blog_markdown?: string })
      | null;
    if (
      navState &&
      typeof navState === "object" &&
      ("article_markdown" in navState || "blog_markdown" in navState)
    ) {
      const normalized: GenerateResult = {
        ...navState,
        article_markdown:
          navState.article_markdown ?? navState.blog_markdown ?? "",
      };
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
      setResult(normalized);
      return;
    }

    // Coerce any object stored before the rename (legacy `blog_markdown` key)
    // onto the canonical `article_markdown` so a session straddling a deploy
    // still renders the blog output.
    const coerce = (raw: string): GenerateResult => {
      const obj = JSON.parse(raw) as GenerateResult & { blog_markdown?: string };
      return { ...obj, article_markdown: obj.article_markdown ?? obj.blog_markdown ?? "" };
    };

    // 3. Refresh / direct navigation: replay last successful generation.
    const session = sessionStorage.getItem(STORAGE_KEY);
    if (session) {
      try { setResult(coerce(session)); return; }
      catch { sessionStorage.removeItem(STORAGE_KEY); }
    }
    const legacy = localStorage.getItem("neo_script_result");
    if (legacy) {
      try {
        const parsed = coerce(legacy);
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
        setResult(parsed);
        return;
      } catch { localStorage.removeItem("neo_script_result"); }
    }
  }, []);

  const handleCopyMarkdown = async () => {
    if (!result?.article_markdown) return;
    try {
      await navigator.clipboard.writeText(result.article_markdown);
      setMdCopied(true);
      setTimeout(() => setMdCopied(false), 2000);
    } catch { /* ignore */ }
  };

  const handleGenerateAnother = () => {
    localStorage.removeItem("neo_script_result");
    navigateTo("/home");
  };
  /* ─── end original logic ─── */

  /* ─── NEW UI state ─── */
  const [activeTab, setActiveTab]         = useState<string>("article");

  // If the generation produced ONLY social content (no blog markdown), the
  // default "article" tab is empty and forces the user to manually click
  // the platform. Auto-switch to whichever platform actually has content.
  useEffect(() => {
    if (!result) return;
    const hasBlog = Boolean(result.article_markdown && result.article_markdown.trim());
    if (hasBlog) return;  // blog generation: keep article tab
    const populated = Object.entries(result.social_posts ?? {})
      .find(([, body]) => Boolean(body && body.trim()));
    if (populated) setActiveTab(populated[0]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result]);
  const [savedAgo, setSavedAgo]           = useState<number>(0);
  const [mdDownloaded, setMdDownloaded]   = useState(false);
  const [selPos, setSelPos]               = useState<SelectionPos | null>(null);
  const articleRef                        = useRef<HTMLDivElement>(null);

  /* "Saved X ago" timer */
  useEffect(() => {
    if (!result) return;
    const t0 = Date.now();
    const id = setInterval(() => setSavedAgo(Math.floor((Date.now() - t0) / 1000)), 1000);
    return () => clearInterval(id);
  }, [result]);

  /* Text selection → floating toolbar */
  const handleMouseUp = useCallback(() => {
    const sel = window.getSelection();
    if (!sel || sel.toString().trim().length < 5) { setSelPos(null); return; }
    const range = sel.getRangeAt(0);
    const rect  = range.getBoundingClientRect();
    setSelPos({ x: rect.left + rect.width / 2, y: rect.top });
  }, []);

  useEffect(() => {
    document.addEventListener("mouseup", handleMouseUp);
    return () => document.removeEventListener("mouseup", handleMouseUp);
  }, [handleMouseUp]);

  /* Download .md */
  const handleDownloadMd = () => {
    if (!result?.article_markdown) return;
    const title = extractTitle(result.article_markdown);
    const blob  = new Blob([result.article_markdown], { type: "text/markdown" });
    const url   = URL.createObjectURL(blob);
    const a     = document.createElement("a");
    a.href = url; a.download = `${title}.md`; a.click();
    URL.revokeObjectURL(url);
    setMdDownloaded(true);
    setTimeout(() => setMdDownloaded(false), 2000);
  };
  /* ─── end new state ─── */

  /* ─── empty state (same logic, minimal style change) ─── */
  if (!result) {
    return (
      <div className="min-h-screen bg-bg-base flex items-center justify-center">
        <div className="text-center">
          <p className="text-white/60 text-lg mb-4">No result found.</p>
          <a href="/home" className="text-violet-400 hover:text-violet-300 underline text-sm">
            Generate new content
          </a>
        </div>
      </div>
    );
  }

  /* ─── derived data ─── */
  const socialPosts       = result.social_posts ?? {};
  const platformOrder     = ["linkedin", "twitter", "reddit"];
  const availablePlatforms = platformOrder.filter(
    (p) => socialPosts[p] && socialPosts[p].trim()
  );

  const md        = result.article_markdown ?? "";
  const title     = extractTitle(md);
  const wordCount = getWordCount(md);
  const readTime  = getReadTime(wordCount);
  // Real signal: every span we cited counts as a backed-up claim. Inline URL
  // matches are no longer used — they over-counted in markdown tables.
  const srcCount  = result.citations?.length ?? 0;

  const savedLabel =
    savedAgo < 10  ? "Saved just now" :
    savedAgo < 60  ? `Saved ${savedAgo}s ago` :
    savedAgo < 120 ? "Saved 1 min ago" :
                     `Saved ${Math.floor(savedAgo/60)} min ago`;

  const tabs = [
    { id: "article", label: "Long-form", count: 0 },
    ...availablePlatforms.map((p) => ({
      id: p,
      label: p.charAt(0).toUpperCase() + p.slice(1),
      count: 1,
    })),
  ];

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "#06060e" }}
      onClick={() => setSelPos(null)}
    >
      <style>{`
        @keyframes res-pulse { 0%,100%{opacity:.5} 50%{opacity:1} }
      `}</style>

      {/* ═══════════════ STICKY HEADER ═══════════════ */}
      <header
        className="sticky top-0 z-40 flex-shrink-0"
        style={{
          background: "rgba(6,6,14,0.92)",
          backdropFilter: "blur(16px)",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
        }}
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-12 flex items-center gap-3">
          {/* Back */}
          <button
            onClick={() => navigateTo("/home")}
            className="flex items-center gap-1.5 text-[13px] text-white/50 hover:text-white transition-colors px-2 py-1 rounded-lg hover:bg-white/5 flex-shrink-0"
          >
            <ArrowLeft size={14} strokeWidth={2.5} />
            <span className="hidden sm:inline">Back</span>
          </button>

          <div className="w-px h-4 bg-white/10 flex-shrink-0"/>

          {/* Title + save status */}
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <span className="text-[13px] sm:text-[14px] font-semibold text-white truncate">
              {title}
            </span>
            <div className="hidden sm:flex items-center gap-1.5 flex-shrink-0 text-[11px] font-medium"
              style={{ color:"#4ade80" }}>
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 flex-shrink-0"
                style={{ animation:"res-pulse 2.5s ease-in-out infinite",
                  boxShadow:"0 0 6px rgba(74,222,128,.6)" }}/>
              {savedLabel}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {/* Copy */}
            <button
              onClick={handleCopyMarkdown}
              className="flex items-center gap-1.5 text-[12px] font-semibold px-3 py-1.5 rounded-lg transition-all"
              style={{
                background: "rgba(255,255,255,.05)",
                border: "1px solid rgba(255,255,255,.10)",
                color: mdCopied ? "#4ade80" : "rgba(255,255,255,.75)",
              }}
              onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,.09)")}
              onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,.05)")}
            >
              {mdCopied ? <Check size={13} strokeWidth={2.5}/> : <Copy size={13} strokeWidth={2}/>}
              <span className="hidden sm:inline">{mdCopied ? "Copied" : "Copy"}</span>
            </button>

            {/* Download .md */}
            <button
              onClick={handleDownloadMd}
              className="flex items-center gap-1.5 text-[12px] font-semibold px-3 py-1.5 rounded-lg transition-all"
              style={{
                background: "rgba(255,255,255,.05)",
                border: "1px solid rgba(255,255,255,.10)",
                color: mdDownloaded ? "#4ade80" : "rgba(255,255,255,.75)",
              }}
              onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,.09)")}
              onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,.05)")}
            >
              {mdDownloaded ? <Check size={13} strokeWidth={2.5}/> : <Download size={13} strokeWidth={2}/>}
              <span className="hidden sm:inline">.md</span>
            </button>

            {/* Publish */}
            <button
              className="flex items-center gap-1.5 text-[12px] font-bold px-4 py-1.5 rounded-lg transition-all text-white"
              style={{
                background: "linear-gradient(135deg,#6d28d9,#7c3aed)",
                boxShadow: "0 0 16px rgba(124,58,237,.40)",
              }}
              onMouseEnter={e => (e.currentTarget.style.boxShadow = "0 0 24px rgba(124,58,237,.60)")}
              onMouseLeave={e => (e.currentTarget.style.boxShadow = "0 0 16px rgba(124,58,237,.40)")}
            >
              <ExternalLink size={12} strokeWidth={2.5}/>
              Publish
            </button>
          </div>
        </div>
      </header>

      {/* ═══════════════ TAB BAR ═══════════════ */}
      <div
        className="sticky z-30 flex-shrink-0"
        style={{
          top: 48,
          background: "rgba(6,6,14,0.90)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
        }}
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex items-center">
          {/* Platform tabs */}
          <div className="flex items-end gap-0 flex-1 overflow-x-auto">
            {tabs.map((tab) => {
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className="relative flex items-center gap-0 px-4 py-3 text-[13px] font-semibold whitespace-nowrap transition-colors flex-shrink-0"
                  style={{ color: active ? "white" : "rgba(255,255,255,.45)" }}
                >
                  {tab.label}
                  <PlatformBadge count={tab.count} />
                  {active && (
                    <span
                      className="absolute bottom-0 left-3 right-3 h-[2px] rounded-full"
                      style={{ background: "linear-gradient(90deg,#7c3aed,#a855f7)" }}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Regenerate */}
          <button
            onClick={handleGenerateAnother}
            className="flex items-center gap-1.5 text-[12px] font-semibold px-3 py-1.5 rounded-lg ml-2 flex-shrink-0 transition-colors"
            style={{ color:"rgba(255,255,255,.45)" }}
            onMouseEnter={e => { e.currentTarget.style.color="white"; e.currentTarget.style.background="rgba(255,255,255,.05)"; }}
            onMouseLeave={e => { e.currentTarget.style.color="rgba(255,255,255,.45)"; e.currentTarget.style.background="transparent"; }}
          >
            <RefreshCw size={12} strokeWidth={2.5}/>
            <span className="hidden sm:inline">Regenerate</span>
          </button>
        </div>
      </div>

      {/* ═══════════════ CONTENT ═══════════════ */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-6 pb-20">

        {/* ── Article tab ── */}
        {activeTab === "article" && (
          <div ref={articleRef}>
            {/* Article meta */}
            <div className="mb-5">
              <h1 className="text-[22px] sm:text-[26px] font-extrabold text-white leading-tight tracking-tight mb-1.5">
                {title}
              </h1>
              <p className="text-[13px]" style={{ color:"rgba(255,255,255,.4)" }}>
                {readTime} min read · Updated today
              </p>
            </div>

            {/* Citation legend — only when we actually have something to show */}
            <CitationLegend citations={result.citations ?? []} />

            {/* Article content */}
            <div
              className="rounded-2xl p-5 sm:p-7"
              style={{
                background: "rgba(255,255,255,.025)",
                border: "1px solid rgba(255,255,255,.06)",
              }}
              onMouseUp={e => { e.stopPropagation(); /* allow handleMouseUp to fire */ }}
            >
              <MarkdownViewer
                content={result.article_markdown ?? ""}
                citations={result.citations ?? []}
              />
            </div>
          </div>
        )}

        {/* ── Social platform tabs ── */}
        {activeTab !== "article" && (
          <div>
            {socialPosts[activeTab] && socialPosts[activeTab].trim() ? (
              <SocialPostPreview
                platform={activeTab}
                content={socialPosts[activeTab]}
                brand={result.brand ?? ""}
                citations={result.social_citations?.[activeTab] ?? []}
              />
            ) : (
              <div className="flex flex-col items-center justify-center py-20">
                <FileText className="w-8 h-8 mb-3" style={{ color:"rgba(255,255,255,.2)" }} strokeWidth={1.5}/>
                <p className="text-white/40 text-sm">No content for this platform.</p>
              </div>
            )}
          </div>
        )}

      </main>

      {/* ═══════════════ BOTTOM STATUS BAR ═══════════════ */}
      <footer
        className="fixed bottom-0 left-0 right-0 z-30"
        style={{
          background: "rgba(6,6,14,0.94)",
          backdropFilter: "blur(12px)",
          borderTop: "1px solid rgba(255,255,255,.07)",
        }}
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-10 flex items-center justify-between">
          {/* Left: word count + read time */}
          <div className="flex items-center gap-3">
            <span className="text-[12px]" style={{ color:"rgba(255,255,255,.4)" }}>
              {wordCount.toLocaleString()} words
            </span>
            <span className="w-1 h-1 rounded-full bg-white/20"/>
            <span className="text-[12px]" style={{ color:"rgba(255,255,255,.4)" }}>
              {readTime} min read
            </span>
          </div>

          {/* Right: citation count — number of backed-up spans the citations
              pass attributed. Only renders when we have any. */}
          {srcCount > 0 && (
            <div className="flex items-center gap-1.5">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.4)" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
              <span className="text-[12px] hidden sm:inline" style={{ color:"rgba(255,255,255,.4)" }}>
                {srcCount} citation{srcCount === 1 ? "" : "s"}
              </span>
            </div>
          )}
        </div>
      </footer>

      {/* ═══════════════ TEXT SELECTION TOOLBAR ═══════════════ */}
      <SelectionToolbar
        pos={selPos}
        onDismiss={() => setSelPos(null)}
      />
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   CITATION LEGEND — one chip per document cited, plus a chip per non-doc
   citation kind (keyword/competitor/web). Each user_doc chip uses the same
   color the MarkdownViewer assigns that document's highlights, so users can
   visually scan: "this yellow highlight = brand-voice.md".
   ════════════════════════════════════════════════════════════════════════ */
const NON_DOC_LEGEND_META: Record<Exclude<CitationSourceKind, "user_doc">, { label: string; bg: string; border: string }> = {
  keyword:    { label: "Must-include keyword", bg: "rgba(168, 85, 247, 0.28)",  border: "rgba(168, 85, 247, 0.65)"  },
  competitor: { label: "Competitor research",  bg: "rgba(245, 158, 11, 0.28)",  border: "rgba(245, 158, 11, 0.65)"  },
  web:        { label: "Web research",         bg: "rgba(56, 189, 248, 0.28)",  border: "rgba(56, 189, 248, 0.65)"  },
};

// Same hash MarkdownViewer uses, kept inlined so the two stay in sync without
// exporting an extra helper.
const docColorSlot = (seed: string): number => {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return h % USER_DOC_PALETTE.length;
};

function CitationLegend({ citations }: { citations: Citation[] }) {
  if (!citations || citations.length === 0) return null;

  // Group user_doc citations by document_id; everything else bucketed by kind.
  type DocEntry = { docId: string; label: string; count: number; bg: string; border: string };
  const docMap = new Map<string, DocEntry>();
  const kindCount: Partial<Record<CitationSourceKind, number>> = {};

  for (const c of citations) {
    if (c.source_kind === "user_doc" && c.source_document_id) {
      const id = c.source_document_id;
      const existing = docMap.get(id);
      if (existing) {
        existing.count += 1;
      } else {
        const slot = USER_DOC_PALETTE[docColorSlot(id)];
        docMap.set(id, {
          docId: id,
          label: c.document_title || c.document_filename || "Reference doc",
          count: 1,
          bg: slot.bg,
          border: slot.border,
        });
      }
    } else {
      kindCount[c.source_kind] = (kindCount[c.source_kind] ?? 0) + 1;
    }
  }

  const docEntries = Array.from(docMap.values()).sort((a, b) => b.count - a.count);
  const nonDocKinds = (Object.keys(kindCount) as Array<keyof typeof NON_DOC_LEGEND_META>).filter(
    (k) => kindCount[k] && kindCount[k]! > 0,
  );

  if (docEntries.length === 0 && nonDocKinds.length === 0) return null;

  return (
    <div className="mb-4 flex flex-wrap items-center gap-2">
      <span className="text-[11px] uppercase tracking-[0.1em] text-white/40 mr-1">
        Cited from
      </span>

      {docEntries.map((d) => (
        <span
          key={d.docId}
          title={d.label}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[12px] max-w-[260px]"
          style={{
            backgroundColor: d.bg,
            border: `1px solid ${d.border}`,
            color: "rgba(255,255,255,0.92)",
          }}
        >
          <span
            className="inline-block w-2 h-2 rounded-sm shrink-0"
            style={{ backgroundColor: d.border }}
          />
          <span className="truncate">{d.label}</span>
          <span className="text-white/55 font-mono shrink-0">{d.count}</span>
        </span>
      ))}

      {nonDocKinds.map((k) => {
        const meta = NON_DOC_LEGEND_META[k];
        return (
          <span
            key={k}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[12px]"
            style={{
              backgroundColor: meta.bg,
              border: `1px solid ${meta.border}`,
              color: "rgba(255,255,255,0.92)",
            }}
          >
            <span
              className="inline-block w-2 h-2 rounded-sm"
              style={{ backgroundColor: meta.border }}
            />
            {meta.label}
            <span className="text-white/55 font-mono">{kindCount[k]}</span>
          </span>
        );
      })}

      <span className="text-[11px] text-white/35 ml-auto">
        Hover any highlight for the source.
      </span>
    </div>
  );
}