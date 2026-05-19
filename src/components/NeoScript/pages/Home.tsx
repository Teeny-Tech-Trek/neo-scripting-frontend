import { useState } from "react";
import Navbar from "../Navbar";
import HeroSection from "../HeroSection";
import GeneratorForm from "../GeneratorForm";
import Footer from "../Footer";

export type ViewMode = "web" | "mcp";

// Generation mode. One pipeline runs at a time — blog OR a single social post.
export type GenerationMode = "blog" | "social";
export type SocialPlatform = "linkedin" | "twitter" | "reddit";

export type BriefData = {
  topic: string;
  brand: string;
  companyUrl: string;
  mode: GenerationMode;
  // Required when mode === "social". Single platform per request.
  platform?: SocialPlatform;
  // When true, the Python pipeline retrieves the user's previously-uploaded
  // reference documents for this brand and feeds them into the agents.
  useUserDocs: boolean;
  // Mandatory keywords the Writer agent is instructed to include verbatim
  // in the generated content. Sent as `keywords` to /generate; the backend
  // caps total count + per-keyword length so a malicious payload can't blow
  // up the prompt.
  keywords: string[];
};

export default function Home() {
  const [view, setView] = useState<ViewMode>("web");
  const [brief, setBrief] = useState<BriefData | null>(null);

  const handleGenerate = (data: BriefData) => {
    setBrief(data);
  };

  const handleDone = () => {
    setBrief(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-bg-base pt-10">
      <Navbar />
      <main className="flex-1">
        {/* When generating, GeneratorForm replaces the entire hero area.
            Otherwise show HeroSection with the toggle (web brief OR mcp). */}
        {brief ? (
          <GeneratorForm brief={brief} onDone={handleDone} />
        ) : (
          <HeroSection
            view={view}
            setView={setView}
            onGenerate={handleGenerate}
          />
        )}

        {/* MCP content lives inside HeroSection when view === "mcp", so we
            don't render <MCPSection /> here separately. */}
      </main>
      <Footer />
    </div>
  );
}