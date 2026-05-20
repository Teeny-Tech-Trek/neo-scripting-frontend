import { useState } from "react";
import { ThumbsUp, MessageSquare, Repeat2, Send, Globe, Check, Copy } from "lucide-react";
import HighlightedText from "./HighlightedText";
import type { Citation } from "../../../services/ai/generationsService";

type Props = { brand: string; content: string; citations?: Citation[] };

const LinkedInLogo = () => (
  <span className="inline-flex items-center justify-center w-7 h-7 rounded-[4px] bg-[#0A66C2]">
    <span className="text-white font-extrabold text-[12px] tracking-tight leading-none">
      in
    </span>
  </span>
);

const initialOf = (s: string) => (s.trim().charAt(0) || "?").toUpperCase();

/* Realistic LinkedIn-style post card. Light card on dark page chrome,
   readable on the existing background. Action icons styled but inert. */
export default function LinkedInPreview({ brand, content, citations }: Props) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    try { await navigator.clipboard.writeText(content); setCopied(true); setTimeout(() => setCopied(false), 1800); } catch {}
  };

  const displayName = brand.trim() || "Your brand";
  const tagline = "Content & Marketing"; // generic placeholder line

  return (
    <div className="rounded-xl overflow-hidden border border-white/[0.08] bg-white text-[#1d2226] shadow-xl">
      {/* App-bar mimic — small LinkedIn header strip */}
      <div className="px-4 py-2.5 flex items-center justify-between border-b border-[#e5e7eb] bg-white">
        <div className="flex items-center gap-2">
          <LinkedInLogo />
          <span className="text-[12px] text-[#666666] font-medium">Preview</span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-[12px] font-semibold text-[#0A66C2] hover:bg-[#eaf3fc] px-2.5 py-1 rounded-md transition-colors"
        >
          {copied ? <Check size={12} /> : <Copy size={12} />}
          {copied ? "Copied" : "Copy post"}
        </button>
      </div>

      {/* Author row */}
      <div className="px-4 pt-3.5 pb-2 flex items-start gap-3">
        <span className="w-12 h-12 shrink-0 rounded-full bg-gradient-to-br from-[#0A66C2] to-[#004182] text-white font-bold text-[18px] flex items-center justify-center">
          {initialOf(displayName)}
        </span>
        <div className="flex-1 min-w-0 leading-tight">
          <p className="text-[14.5px] font-semibold truncate">{displayName}</p>
          <p className="text-[12px] text-[#666666] truncate">{tagline}</p>
          <p className="text-[11.5px] text-[#666666] mt-0.5 flex items-center gap-1">
            <span>Just now</span>
            <span aria-hidden>·</span>
            <Globe size={11} className="text-[#666666]" />
          </p>
        </div>
      </div>

      {/* Body */}
      <div className="px-4 pb-3">
        <p className="text-[14.5px] leading-[1.5] text-[#1d2226]">
          <HighlightedText content={content} citations={citations} />
        </p>
      </div>

      {/* Engagement bar (mocked, visual only) */}
      <div className="px-4 py-1.5 border-t border-[#e5e7eb] flex items-center justify-between text-[12px] text-[#666666]">
        <span className="inline-flex items-center gap-1">
          <span className="inline-flex w-4 h-4 rounded-full bg-[#0A66C2] text-white items-center justify-center">
            <ThumbsUp size={9} fill="white" />
          </span>
          <span>Reactions</span>
        </span>
        <span>Comments · Reposts</span>
      </div>

      {/* Action row */}
      <div className="px-2 py-1 border-t border-[#e5e7eb] grid grid-cols-4 text-[#666666]">
        {[
          { icon: ThumbsUp,     label: "Like"    },
          { icon: MessageSquare, label: "Comment" },
          { icon: Repeat2,      label: "Repost"  },
          { icon: Send,         label: "Send"    },
        ].map(({ icon: Icon, label }) => (
          <div
            key={label}
            className="flex items-center justify-center gap-1.5 py-2.5 rounded-md text-[13px] font-semibold select-none"
          >
            <Icon size={16} />
            <span>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
