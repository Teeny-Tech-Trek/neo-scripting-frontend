import { useState } from "react";
import { ArrowBigUp, ArrowBigDown, MessageSquare, Share, Bookmark, Check, Copy } from "lucide-react";
import HighlightedText from "./HighlightedText";
import type { Citation } from "../../../services/ai/generationsService";

type Props = { brand: string; content: string; citations?: Citation[] };

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "") || "yourbrand";

/* Reddit-style snoo avatar — orange round with a friendly placeholder. */
const Snoo = ({ size = 36 }: { size?: number }) => (
  <span
    className="rounded-full flex items-center justify-center text-white font-bold shadow-sm shrink-0"
    style={{
      width: size, height: size,
      background: "linear-gradient(135deg,#FF4500 0%,#FF8717 100%)",
    }}
  >
    <svg width={size * 0.55} height={size * 0.55} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="13" r="9" fill="rgba(255,255,255,0.18)" />
      <circle cx="9"  cy="13" r="1.4" fill="white" />
      <circle cx="15" cy="13" r="1.4" fill="white" />
      <path d="M8.5 16c1 .8 2.2 1.2 3.5 1.2s2.5-.4 3.5-1.2"
            stroke="white" strokeWidth="1.4" strokeLinecap="round" fill="none" />
    </svg>
  </span>
);

/* If the content starts with a markdown H1/H2, treat that line as the post
   title and the rest as the body. Otherwise: no title, just body — which
   matches how a self-text post on Reddit can render. */
function splitTitleBody(content: string): { title: string | null; body: string } {
  const m = content.match(/^\s*#{1,2}\s+(.+?)\s*\n+([\s\S]*)$/);
  if (m) return { title: m[1].trim(), body: m[2].trim() };
  // Fallback heuristic: first line if it's < 120 chars + has no period mid-way.
  const firstNL = content.indexOf("\n");
  if (firstNL > 0 && firstNL < 120) {
    const first = content.slice(0, firstNL).trim();
    const rest = content.slice(firstNL + 1).trim();
    if (rest && !first.endsWith(".") && first.length > 8) {
      return { title: first, body: rest };
    }
  }
  return { title: null, body: content };
}

export default function RedditPreview({ brand, content, citations }: Props) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    try { await navigator.clipboard.writeText(content); setCopied(true); setTimeout(() => setCopied(false), 1800); } catch {}
  };

  const displayName = brand.trim() || "Your brand";
  const sub = `r/${slug(displayName).slice(0, 21)}`;
  const user = `u/${slug(displayName)}_team`;
  const { title, body } = splitTitleBody(content);

  return (
    <div className="rounded-xl overflow-hidden border border-white/[0.08] bg-[#1a1a1b] text-[#d7dadc] shadow-xl">
      {/* App-bar mimic */}
      <div className="px-4 py-2.5 flex items-center justify-between border-b border-white/[0.06] bg-[#1a1a1b]">
        <div className="flex items-center gap-2">
          <Snoo size={20} />
          <span className="text-[12px] text-white/45 font-medium">Preview</span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-[12px] font-semibold text-white/80 hover:bg-white/[0.06] px-2.5 py-1 rounded-md transition-colors"
        >
          {copied ? <Check size={12} /> : <Copy size={12} />}
          {copied ? "Copied" : "Copy post"}
        </button>
      </div>

      {/* Two-column post layout: votes on the left, content on the right */}
      <div className="flex">
        {/* Vote column */}
        <div className="w-10 bg-[#161617] flex flex-col items-center pt-3 gap-1.5 text-white/45">
          <ArrowBigUp size={20} className="hover:text-[#FF4500] cursor-pointer" />
          <span className="text-[11px] font-bold text-white/70">1</span>
          <ArrowBigDown size={20} className="hover:text-[#7193ff] cursor-pointer" />
        </div>

        {/* Main column */}
        <div className="flex-1 min-w-0 p-3">
          {/* Header row */}
          <div className="flex items-center gap-2 mb-1.5 text-[12px] text-white/55 flex-wrap">
            <Snoo size={18} />
            <span className="text-white font-bold">{sub}</span>
            <span aria-hidden>·</span>
            <span>Posted by <span className="hover:underline cursor-pointer">{user}</span></span>
            <span aria-hidden>·</span>
            <span>just now</span>
          </div>

          {/* Title */}
          {title && (
            <h3 className="text-[18px] font-semibold leading-tight text-white mb-2">
              {title}
            </h3>
          )}

          {/* Body */}
          <div className="text-[14px] leading-[1.6] text-[#d7dadc]">
            <HighlightedText content={body} citations={citations} />
          </div>

          {/* Action bar */}
          <div className="mt-3 pt-1 flex items-center gap-2 text-[12px] text-white/55 font-bold">
            <button className="flex items-center gap-1.5 px-2 py-1.5 rounded hover:bg-white/[0.05]">
              <MessageSquare size={16} />
              <span>0 Comments</span>
            </button>
            <button className="flex items-center gap-1.5 px-2 py-1.5 rounded hover:bg-white/[0.05]">
              <Share size={16} />
              <span>Share</span>
            </button>
            <button className="flex items-center gap-1.5 px-2 py-1.5 rounded hover:bg-white/[0.05]">
              <Bookmark size={16} />
              <span>Save</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
