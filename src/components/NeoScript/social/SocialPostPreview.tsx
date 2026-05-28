import LinkedInPreview from "./LinkedInPreview";
import TwitterPreview from "./TwitterPreview";
import RedditPreview from "./RedditPreview";
import type { Citation } from "../../../services/ai/generationsService";

type Props = {
  platform: string;
  content: string;
  brand: string;
  citations?: Citation[];
};

/* Dispatches a platform-themed preview. Falls back to a generic card layout
   for any platform we haven't styled (defensive — shouldn't happen since
   the brief form only allows linkedin/twitter/reddit). */
export default function SocialPostPreview({ platform, content, brand, citations }: Props) {
  switch (platform.toLowerCase()) {
    case "linkedin": return <LinkedInPreview brand={brand} content={content} citations={citations} />;
    case "twitter":  return <TwitterPreview  brand={brand} content={content} citations={citations} />;
    case "reddit":   return <RedditPreview   brand={brand} content={content} citations={citations} />;
    default:
      return (
        <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-5 text-white/80">
          <div className="text-[11px] uppercase tracking-wider text-white/40 mb-2">
            {platform}
          </div>
          <p className="text-[14px] whitespace-pre-wrap">{content}</p>
        </div>
      );
  }
}
