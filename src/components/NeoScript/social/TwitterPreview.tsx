import { useState } from "react";
import { MessageCircle, Repeat2, Heart, BarChart3, Share, BadgeCheck, Check, Copy } from "lucide-react";
import HighlightedText from "./HighlightedText";
import type { Citation } from "../../../services/ai/generationsService";

type Props = { brand: string; content: string; citations?: Citation[] };

const initialOf = (s: string) => (s.trim().charAt(0) || "?").toUpperCase();
const handleFromBrand = (s: string) =>
  s.replace(/[^A-Za-z0-9]/g, "").slice(0, 15) || "yourbrand";

/* The X logo — bold sans-serif "X" inside its rounded black square.
   We render the glyph as text rather than a path so it scales cleanly. */
const XLogo = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

export default function TwitterPreview({ brand, content, citations }: Props) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    try { await navigator.clipboard.writeText(content); setCopied(true); setTimeout(() => setCopied(false), 1800); } catch {}
  };

  const displayName = brand.trim() || "Your brand";
  const handle = handleFromBrand(displayName);
  const charLimit = 280;
  const over = content.length > charLimit;

  return (
    <div className="rounded-2xl overflow-hidden border border-white/[0.08] bg-black text-white shadow-xl">
      {/* App-bar mimic — small X strip */}
      <div className="px-4 py-2.5 flex items-center justify-between border-b border-white/[0.08]">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-white text-black">
            <XLogo size={14} />
          </span>
          <span className="text-[12px] text-white/55 font-medium">Preview</span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-[12px] font-semibold text-white/85 hover:bg-white/[0.08] px-2.5 py-1 rounded-full transition-colors"
        >
          {copied ? <Check size={12} /> : <Copy size={12} />}
          {copied ? "Copied" : "Copy post"}
        </button>
      </div>

      {/* Tweet body */}
      <div className="px-4 pt-3 pb-2 flex gap-3">
        <span className="w-11 h-11 shrink-0 rounded-full bg-gradient-to-br from-[#1d9bf0] to-[#0c5a91] text-white font-bold text-[16px] flex items-center justify-center">
          {initialOf(displayName)}
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap leading-tight">
            <span className="font-bold text-[15px] truncate max-w-[200px]">{displayName}</span>
            <BadgeCheck size={15} className="text-[#1d9bf0] shrink-0" fill="#1d9bf0" stroke="black" />
            <span className="text-[14.5px] text-white/55 truncate">@{handle}</span>
            <span className="text-white/55">·</span>
            <span className="text-[14.5px] text-white/55">now</span>
          </div>
          <p className="mt-1 text-[15px] leading-[1.45] break-words">
            <HighlightedText content={content} citations={citations} />
          </p>
          {over && (
            <p className="mt-2 text-[12px] text-red-400">
              {content.length}/{charLimit} — over Twitter's character limit. Will need to be trimmed before posting.
            </p>
          )}
        </div>
      </div>

      {/* Engagement bar (visual only) */}
      <div className="px-3 pb-1.5 grid grid-cols-5 text-white/55">
        {[
          { icon: MessageCircle, color: "hover:text-[#1d9bf0]"             },
          { icon: Repeat2,       color: "hover:text-[#00ba7c]"             },
          { icon: Heart,         color: "hover:text-[#f91880]"             },
          { icon: BarChart3,     color: "hover:text-[#1d9bf0]"             },
          { icon: Share,         color: "hover:text-[#1d9bf0]"             },
        ].map(({ icon: Icon, color }, i) => (
          <div key={i} className={`flex items-center justify-center py-2 transition-colors ${color}`}>
            <Icon size={16} />
          </div>
        ))}
      </div>

      {/* Footer with character count */}
      <div className="px-4 py-2 border-t border-white/[0.08] flex items-center justify-between text-[11.5px] text-white/45">
        <span>{content.length} characters</span>
        <span className={over ? "text-red-400 font-mono" : "font-mono"}>
          {content.length}/{charLimit}
        </span>
      </div>
    </div>
  );
}
