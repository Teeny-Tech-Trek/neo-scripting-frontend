import { cloneElement, isValidElement } from "react";
import type { ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import type { Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Citation, CitationSourceKind } from "../../services/ai/generationsService";

/* ════════════════════════════════════════════════════════════════════════
   HIGHLIGHTING
   ────────────────────────────────────────────────────────────────────────
   The backend gives us citations as char-offset ranges into the source
   markdown PLUS the exact substring at that range (`matched_text`). Mapping
   char offsets through react-markdown's render tree is unreliable, so we
   instead do plain substring matching on the rendered string children.

   v1 limitations (accepted, not bugs):
     • A citation whose source span straddles an inline element (e.g. a
       sentence containing `**bold**`) won't highlight in one piece — the
       part before the bold will match, the part after will match, but the
       seam in the middle stays plain. Sentence-level user-doc matches
       almost never span inline formatting, so this is rare in practice.
     • Multiple citations covering overlapping spans collapse onto the
       higher-confidence one; identical spans on the same text only render
       once. We choose the visually dominant class per `kindRank` below.
   ════════════════════════════════════════════════════════════════════════ */

// Visual priority — higher number wins when two highlight kinds overlap.
const kindRank: Record<CitationSourceKind, number> = {
  user_doc:   3,
  competitor: 2,
  web:        1,
  keyword:    0,
};

// Per-document highlighter palette. Each user_doc citation picks a color from
// this list by hashing its source_document_id, so:
//   • all sentences from doc A share one color (e.g. light yellow)
//   • all sentences from doc B share another (e.g. light blue)
//   • the same doc always gets the same color across renders/page reloads
// Colors are tuned for dark backgrounds with white text — translucent enough
// not to drown the type, opaque enough to read like a real highlighter.
export const USER_DOC_PALETTE = [
  { name: "yellow", bg: "rgba(253, 224, 71, 0.32)", border: "rgba(253, 224, 71, 0.65)" }, // #fde047
  { name: "pink",   bg: "rgba(244, 114, 182, 0.30)", border: "rgba(244, 114, 182, 0.65)" }, // #f472b6
  { name: "blue",   bg: "rgba(96, 165, 250, 0.30)",  border: "rgba(96, 165, 250, 0.65)"  }, // #60a5fa
  { name: "mint",   bg: "rgba(110, 231, 183, 0.28)", border: "rgba(110, 231, 183, 0.65)" }, // #6ee7b7
  { name: "orange", bg: "rgba(253, 186, 116, 0.30)", border: "rgba(253, 186, 116, 0.65)" }, // #fdba74
  { name: "lilac",  bg: "rgba(196, 181, 253, 0.32)", border: "rgba(196, 181, 253, 0.65)" }, // #c4b5fd
  { name: "rose",   bg: "rgba(251, 113, 133, 0.28)", border: "rgba(251, 113, 133, 0.65)" }, // #fb7185
  { name: "teal",   bg: "rgba(45, 212, 191, 0.28)",  border: "rgba(45, 212, 191, 0.65)"  }, // #2dd4bf
];

// Deterministic doc → palette index. Same doc id always yields the same color.
const pickPaletteSlot = (seed: string): number => {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return h % USER_DOC_PALETTE.length;
};

// Keyword / competitor / web get their own consistent (non-per-doc) colors.
const NON_USER_DOC_STYLES: Record<Exclude<CitationSourceKind, "user_doc">, { bg: string; border: string }> = {
  keyword:    { bg: "rgba(168, 85, 247, 0.28)",  border: "rgba(168, 85, 247, 0.65)"  }, // violet
  competitor: { bg: "rgba(245, 158, 11, 0.28)",  border: "rgba(245, 158, 11, 0.65)"  }, // amber
  web:        { bg: "rgba(56, 189, 248, 0.28)",  border: "rgba(56, 189, 248, 0.65)"  }, // sky
};

function styleFor(citation: Citation): { bg: string; border: string } {
  if (citation.source_kind === "user_doc" && citation.source_document_id) {
    return USER_DOC_PALETTE[pickPaletteSlot(citation.source_document_id)];
  }
  if (citation.source_kind === "user_doc") {
    // user_doc without a doc id (shouldn't happen, but defensive) → first slot
    return USER_DOC_PALETTE[0];
  }
  return NON_USER_DOC_STYLES[citation.source_kind];
}

const tooltipFor = (c: Citation): string => {
  if (c.source_kind === "keyword") {
    return `Mandatory keyword: ${c.keyword ?? "—"}`;
  }
  if (c.source_kind === "user_doc") {
    const conf = c.confidence != null ? ` · relevance ${c.confidence.toFixed(2)}` : "";
    const name = c.document_title || c.document_filename || "uploaded document";
    return `From your reference doc: ${name}${conf}`;
  }
  if (c.source_kind === "competitor") {
    const conf = c.confidence != null ? ` · relevance ${c.confidence.toFixed(2)}` : "";
    return `From competitor research${conf}`;
  }
  return `From web research`;
};

type Match = {
  start: number;
  end: number;
  citation: Citation;
};

// Find every citation match inside `s`. Multiple citations can match the
// same span; we keep the highest-rank one. Overlapping matches at different
// offsets are split into separate segments — no nesting attempt in v1.
function findMatchesIn(s: string, citations: Citation[]): Match[] {
  if (!s || !citations || citations.length === 0) return [];
  const raw: Match[] = [];
  for (const c of citations) {
    const needle = c.matched_text;
    if (!needle || needle.length < 2) continue;
    // Case-insensitive search — citations don't always preserve case.
    const lower = s.toLowerCase();
    const lneedle = needle.toLowerCase();
    let from = 0;
    while (from <= lower.length - lneedle.length) {
      const idx = lower.indexOf(lneedle, from);
      if (idx < 0) break;
      raw.push({ start: idx, end: idx + needle.length, citation: c });
      from = idx + needle.length;
    }
  }
  if (raw.length === 0) return [];

  // Sort by start, then by descending kind rank so the dominant kind wins.
  raw.sort((a, b) => {
    if (a.start !== b.start) return a.start - b.start;
    return kindRank[b.citation.source_kind] - kindRank[a.citation.source_kind];
  });

  // Drop overlaps: keep the first (highest-priority) one and skip until past it.
  const out: Match[] = [];
  let cursor = -1;
  for (const m of raw) {
    if (m.start >= cursor) {
      out.push(m);
      cursor = m.end;
    }
  }
  return out;
}

function wrapString(s: string, citations: Citation[], keyBase: string): ReactNode {
  const matches = findMatchesIn(s, citations);
  if (matches.length === 0) return s;

  const out: ReactNode[] = [];
  let pos = 0;
  matches.forEach((m, i) => {
    if (m.start > pos) out.push(s.slice(pos, m.start));
    const style = styleFor(m.citation);
    out.push(
      <mark
        key={`${keyBase}-${i}`}
        title={tooltipFor(m.citation)}
        data-citation-kind={m.citation.source_kind}
        data-citation-doc={m.citation.source_document_id ?? ""}
        style={{
          backgroundColor: style.bg,
          // Keep the original text color — highlighter-pen aesthetic.
          color: "inherit",
          borderRadius: 3,
          // Tighten the highlight so adjacent words don't fuse into a single
          // block. `box-decoration-break: clone` makes the highlight wrap
          // cleanly across line breaks (otherwise it'd be one long pill).
          boxDecorationBreak: "clone",
          WebkitBoxDecorationBreak: "clone",
          padding: "1px 3px",
          cursor: "help",
          // CRITICAL: <mark> renders as inline by default and its background
          // is purely CSS — it does NOT travel into the clipboard. Plain
          // text copies stay plain. Rich-text copies include the markdown
          // bolds the LLM wrote (those are content, not styling).
        }}
      >
        {s.slice(m.start, m.end)}
      </mark>,
    );
    pos = m.end;
  });
  if (pos < s.length) out.push(s.slice(pos));
  return out;
}

function highlightChildren(children: ReactNode, citations: Citation[], keyBase = "h"): ReactNode {
  if (children == null || typeof children === "boolean") return children;
  if (typeof children === "string") return wrapString(children, citations, keyBase);
  if (typeof children === "number") return children;
  if (Array.isArray(children)) {
    return children.map((c, i) => highlightChildren(c, citations, `${keyBase}-${i}`));
  }
  if (isValidElement<{ children?: ReactNode }>(children)) {
    const child = children;
    const childChildren = child.props?.children;
    // Skip code blocks — their raw text is not citation territory.
    if (typeof child.type === "string" && (child.type === "code" || child.type === "pre")) {
      return child;
    }
    return cloneElement(child, {
      ...child.props,
      children: highlightChildren(childChildren, citations, keyBase),
    });
  }
  return children;
}

/* ════════════════════════════════════════════════════════════════════════
   COMPONENTS — same render rules as before, just wrapped to highlight text
   ════════════════════════════════════════════════════════════════════════ */

const buildComponents = (citations: Citation[]): Components => ({
  h1: ({ children }) => (
    <h1 className="text-2xl font-bold text-white mt-8 mb-4 tracking-tight leading-tight">
      {highlightChildren(children, citations)}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="text-xl font-bold text-white mt-7 mb-3 tracking-tight leading-tight pl-3 border-l-2 border-accent">
      {highlightChildren(children, citations)}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="text-base font-semibold text-white mt-5 mb-2 pl-3 border-l border-accent/60">
      {highlightChildren(children, citations)}
    </h3>
  ),
  p: ({ children }) => (
    <p className="text-[#d4d4d8] text-sm leading-[1.85] mb-4">
      {highlightChildren(children, citations)}
    </p>
  ),
  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-accent-light no-underline hover:underline transition-all duration-200"
    >
      {highlightChildren(children, citations)}
    </a>
  ),
  ul: ({ children }) => <ul className="mb-4 space-y-1 pl-1">{children}</ul>,
  ol: ({ children }) => (
    <ol className="mb-4 space-y-1 pl-1 list-decimal list-inside">
      {children}
    </ol>
  ),
  li: ({ children }) => (
    <li className="text-[#d4d4d8] text-sm leading-[1.8] flex gap-2">
      <span className="mt-[0.45rem] w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0" />
      <span>{highlightChildren(children, citations)}</span>
    </li>
  ),
  blockquote: ({ children }) => (
    <blockquote className="pl-4 border-l-2 border-accent/50 italic text-text-secondary text-sm my-4">
      {highlightChildren(children, citations)}
    </blockquote>
  ),
  code: ({ className, children, ...props }) => {
    const isBlock = /language-/.test(className ?? "");
    if (!isBlock) {
      return (
        <code
          className="px-1.5 py-0.5 rounded text-[13px] font-mono"
          style={{ background: "rgba(124,58,237,0.15)", color: "#a78bfa" }}
          {...props}
        >
          {children}
        </code>
      );
    }
    return (
      <div className="my-4 rounded-xl overflow-hidden border border-border">
        <div className="px-4 py-1.5 bg-bg-base border-b border-border">
          <span className="label-caps">markdown</span>
        </div>
        <pre className="overflow-x-auto p-4 bg-bg-base/80">
          <code className="text-[13px] font-mono text-text-secondary leading-relaxed" {...props}>
            {children}
          </code>
        </pre>
      </div>
    );
  },
  hr: () => <hr className="border-border my-6" />,
  strong: ({ children }) => (
    <strong className="font-semibold text-white">
      {highlightChildren(children, citations)}
    </strong>
  ),
  em: ({ children }) => (
    <em className="italic text-text-secondary">{highlightChildren(children, citations)}</em>
  ),
  table: ({ children }) => (
    <div className="overflow-x-auto my-4">
      <table className="w-full text-sm border-collapse">{children}</table>
    </div>
  ),
  th: ({ children }) => (
    <th className="px-3 py-2 text-left text-xs font-semibold text-text-secondary uppercase tracking-wide border border-border bg-bg-surface">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="px-3 py-2 text-[#d4d4d8] border border-border text-sm">
      {highlightChildren(children, citations)}
    </td>
  ),
});

type MarkdownViewerProps = {
  content: string;
  citations?: Citation[];
};

export default function MarkdownViewer({ content, citations }: MarkdownViewerProps) {
  const safeCitations = citations ?? [];
  return (
    <div className="prose-custom">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={buildComponents(safeCitations)}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
