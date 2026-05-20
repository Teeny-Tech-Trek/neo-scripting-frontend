import type { CSSProperties, ReactNode } from "react";
import { USER_DOC_PALETTE } from "../MarkdownViewer";
import type {
  Citation,
  CitationSourceKind,
} from "../../../services/ai/generationsService";

/* Plain-text highlighter for social previews.
   Social posts aren't markdown — they're raw strings with line breaks. So we
   skip react-markdown entirely and just do substring matching directly on
   the content, wrapping matches in <mark>. Logic mirrors MarkdownViewer so
   colors stay consistent across the two surfaces. */

const NON_USER_DOC: Record<Exclude<CitationSourceKind, "user_doc">, { bg: string; border: string }> = {
  keyword:    { bg: "rgba(168, 85, 247, 0.30)", border: "rgba(168, 85, 247, 0.65)" },
  competitor: { bg: "rgba(245, 158, 11, 0.30)", border: "rgba(245, 158, 11, 0.65)" },
  web:        { bg: "rgba(56, 189, 248, 0.30)", border: "rgba(56, 189, 248, 0.65)" },
};

const pickPaletteSlot = (seed: string): number => {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return h % USER_DOC_PALETTE.length;
};

const styleFor = (c: Citation): { bg: string; border: string } => {
  if (c.source_kind === "user_doc" && c.source_document_id) {
    return USER_DOC_PALETTE[pickPaletteSlot(c.source_document_id)];
  }
  if (c.source_kind === "user_doc") return USER_DOC_PALETTE[0];
  return NON_USER_DOC[c.source_kind];
};

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
  return "From web research";
};

const kindRank: Record<CitationSourceKind, number> = {
  user_doc: 3, competitor: 2, web: 1, keyword: 0,
};

type Match = { start: number; end: number; citation: Citation };

function findMatches(text: string, citations: Citation[]): Match[] {
  if (!text || !citations || citations.length === 0) return [];
  const raw: Match[] = [];
  const lower = text.toLowerCase();
  for (const c of citations) {
    const needle = c.matched_text;
    if (!needle || needle.length < 2) continue;
    const ln = needle.toLowerCase();
    let from = 0;
    while (from <= lower.length - ln.length) {
      const idx = lower.indexOf(ln, from);
      if (idx < 0) break;
      raw.push({ start: idx, end: idx + needle.length, citation: c });
      from = idx + needle.length;
    }
  }
  if (raw.length === 0) return [];

  raw.sort((a, b) => {
    if (a.start !== b.start) return a.start - b.start;
    return kindRank[b.citation.source_kind] - kindRank[a.citation.source_kind];
  });

  // Greedy overlap drop — same approach as MarkdownViewer.
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

type Props = {
  content: string;
  citations?: Citation[];
  /** Optional style overrides for the <p>/wrapper element. */
  className?: string;
  style?: CSSProperties;
};

export default function HighlightedText({ content, citations, className, style }: Props) {
  const matches = findMatches(content, citations ?? []);
  if (matches.length === 0) {
    return (
      <span className={className} style={{ whiteSpace: "pre-wrap", ...style }}>
        {content}
      </span>
    );
  }

  const out: ReactNode[] = [];
  let pos = 0;
  matches.forEach((m, i) => {
    if (m.start > pos) out.push(content.slice(pos, m.start));
    const s = styleFor(m.citation);
    out.push(
      <mark
        key={i}
        title={tooltipFor(m.citation)}
        data-citation-kind={m.citation.source_kind}
        data-citation-doc={m.citation.source_document_id ?? ""}
        style={{
          backgroundColor: s.bg,
          color: "inherit",
          borderRadius: 3,
          padding: "1px 3px",
          cursor: "help",
          boxDecorationBreak: "clone",
          WebkitBoxDecorationBreak: "clone",
        }}
      >
        {content.slice(m.start, m.end)}
      </mark>,
    );
    pos = m.end;
  });
  if (pos < content.length) out.push(content.slice(pos));

  return (
    <span className={className} style={{ whiteSpace: "pre-wrap", ...style }}>
      {out}
    </span>
  );
}
