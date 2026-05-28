import { useMemo, useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import {
  Sparkles, BookOpen, Zap, ShieldCheck, FileText, CreditCard, Plug,
  ChevronRight, KeyRound,
} from "lucide-react";
import Navbar from "../../LandingAllPagesUi/Navbar";
import Footer from "../Footer";

/* ════════════════════════════════════════════════════════════════════════
   DOCS — public, product-only, MCP-centric. Neo Script is an MCP server.
   No internal endpoints, hostnames, schema names, or env vars on this page.
   ════════════════════════════════════════════════════════════════════════ */

type Section = {
  id: string;
  title: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  body: ReactNode;
};

/* ─── Reusable little primitives so each section stays terse ─────────────── */
function H2({ children }: { children: ReactNode }) {
  return (
    <h2 className="text-[22px] sm:text-[26px] font-bold tracking-tight text-white mb-3">
      {children}
    </h2>
  );
}
function H3({ children }: { children: ReactNode }) {
  return (
    <h3 className="text-[15px] font-semibold text-white mt-7 mb-2.5 flex items-center gap-2">
      <span className="w-1 h-4 bg-violet-500/70 rounded-full" />
      {children}
    </h3>
  );
}
function P({ children }: { children: ReactNode }) {
  return <p className="text-[14px] text-white/65 leading-relaxed mb-3">{children}</p>;
}
function Code({ children }: { children: ReactNode }) {
  return (
    <code className="px-1.5 py-0.5 rounded-md bg-violet-500/10 text-violet-200 text-[12.5px] font-mono border border-violet-500/20">
      {children}
    </code>
  );
}
function CodeBlock({ children }: { children: string }) {
  return (
    <pre className="my-4 rounded-xl border border-white/[0.06] bg-black/40 p-4 overflow-x-auto text-[12.5px] leading-relaxed text-white/85 font-mono">
      <code>{children}</code>
    </pre>
  );
}
function UL({ children }: { children: ReactNode }) {
  return <ul className="space-y-1.5 mb-3 ml-1">{children}</ul>;
}
function LI({ children }: { children: ReactNode }) {
  return (
    <li className="flex items-start gap-2 text-[14px] text-white/65 leading-relaxed">
      <span className="mt-[7px] w-1 h-1 rounded-full bg-violet-300/70 shrink-0" />
      <span>{children}</span>
    </li>
  );
}
function Callout({ tone = "info", children }: { tone?: "info" | "warn"; children: ReactNode }) {
  const tones = {
    info: "border-violet-500/30 bg-violet-500/[0.06] text-violet-100",
    warn: "border-amber-500/30 bg-amber-500/[0.06] text-amber-100",
  } as const;
  return (
    <div className={`my-4 px-4 py-3 rounded-xl border text-[13px] leading-relaxed ${tones[tone]}`}>
      {children}
    </div>
  );
}

/* ─── PRODUCT DOCS (MCP-centric) ─────────────────────────────────────────── */
const SECTIONS: Section[] = [
  {
    id: "getting-started",
    title: "Getting started",
    icon: Sparkles,
    body: (
      <>
        <H2>Neo Script is an MCP server</H2>
        <P>
          Neo Script is not a web app — it's a Model Context Protocol (MCP)
          server. You connect it once to your AI assistant (Claude Desktop,
          Cursor, Windsurf, or any MCP-aware client) and then drive the entire
          ten-agent content pipeline by chatting with that assistant. No second
          dashboard, no new tab to switch into.
        </P>

        <H3>The 60-second tour</H3>
        <UL>
          <LI>Create an account to mint an <b>API key</b>. The key is the only credential the MCP needs.</LI>
          <LI>Add the Neo Script entry to your AI client's MCP config (see the <b>Connecting clients</b> section).</LI>
          <LI>Fully quit and relaunch the client so it picks up the new MCP server.</LI>
          <LI>Ask your assistant a content question — it will see <Code>neo-script</Code> in its tools and call it for you.</LI>
        </UL>

        <Callout>
          Every generation costs <b>1 credit</b>, regardless of length or
          platform. Your assistant will surface the result inline; credits are
          deducted automatically when the pipeline succeeds.
        </Callout>
      </>
    ),
  },
  {
    id: "connecting-clients",
    title: "Connecting clients",
    icon: Plug,
    body: (
      <>
        <H2>Connect Neo Script to your AI assistant</H2>
        <P>
          The snippets below show the shape of the MCP config. Replace{" "}
          <Code>&lt;your-mcp-endpoint&gt;</Code> with the SSE URL shown in your
          account, and <Code>&lt;your-api-key&gt;</Code> with the{" "}
          <Code>neo_…</Code> value you minted on sign-up (keep the{" "}
          <Code>Bearer </Code> prefix).
        </P>

        <H3>Claude Desktop (Windows)</H3>
        <CodeBlock>{`{
  "mcpServers": {
    "neo-script": {
      "command": "cmd",
      "args": ["/c", "npx", "-y", "mcp-remote",
               "<your-mcp-endpoint>",
               "--header", "Authorization: Bearer <your-api-key>"]
    }
  }
}`}</CodeBlock>

        <H3>Claude Desktop (macOS / Linux)</H3>
        <CodeBlock>{`{
  "mcpServers": {
    "neo-script": {
      "command": "npx",
      "args": ["-y", "mcp-remote",
               "<your-mcp-endpoint>",
               "--header", "Authorization: Bearer <your-api-key>"]
    }
  }
}`}</CodeBlock>

        <H3>Cursor / Windsurf (native SSE)</H3>
        <CodeBlock>{`{
  "mcpServers": {
    "neo-script": {
      "type": "sse",
      "url": "<your-mcp-endpoint>",
      "headers": { "Authorization": "Bearer <your-api-key>" }
    }
  }
}`}</CodeBlock>

        <Callout>
          After pasting, <b>fully quit and restart</b> the client (closing the
          window is not enough). You'll then see <Code>neo-script</Code>{" "}
          appear in the available tools for a new conversation.
        </Callout>
      </>
    ),
  },
  {
    id: "generating",
    title: "Generating content",
    icon: Zap,
    body: (
      <>
        <H2>Driving the pipeline from your assistant</H2>
        <P>
          Once Neo Script is wired in, you generate digital content by asking
          your assistant for it in plain English. Behind the scenes, the
          assistant invokes Neo Script with the parameters it inferred from
          your message and a ten-agent pipeline runs end to end.
        </P>

        <H3>What to put in your prompt</H3>
        <UL>
          <LI><b>Topic or one-line brief</b> — e.g. "How agentic AI is changing B2B sales in 2026."</LI>
          <LI><b>Brand and company URL</b> — keeps voice and product references on-target.</LI>
          <LI><b>Mode</b> — say <i>long-form</i> for an article-length piece, or <i>social</i> with a platform name (LinkedIn, Twitter, Reddit).</LI>
          <LI><b>Optional</b> — must-include keywords, use of your reference docs, competitor research (Pro+ only).</LI>
        </UL>

        <H3>Example prompts</H3>
        <CodeBlock>{`> Use neo-script to generate long-form digital content about MCP servers
  for B2B SaaS, brand "Acme", tone professional, around 1500 words.

> With neo-script, write a LinkedIn post about agentic AI for the brand
  "Acme" using my reference docs.

> Generate three social variants (LinkedIn, Twitter, Reddit) for the topic
  "vector databases" using neo-script.`}</CodeBlock>

        <H3>What you get back</H3>
        <P>
          The response your assistant returns includes the rendered piece,
          inline citations to your reference docs or competitor crawls, and —
          for long-form mode — short-form variants for each social platform
          you asked for. A typical long-form run finishes in 90 – 180 seconds.
        </P>
      </>
    ),
  },
  {
    id: "brands-docs",
    title: "Reference docs",
    icon: FileText,
    body: (
      <>
        <H2>Reference docs (per brand)</H2>
        <P>
          You can give Neo Script your own source material — brand guidelines,
          prior posts, product docs — and the pipeline will retrieve the
          relevant passages during generation and cite them in the output.
          Each doc is scoped to a single brand.
        </P>

        <H3>Adding a doc from your assistant</H3>
        <P>
          Ask your AI client to upload a doc through the{" "}
          <Code>upload_user_document</Code> tool — point it at a URL and
          specify the brand. Supported formats: <Code>.md</Code>,{" "}
          <Code>.txt</Code>, <Code>.pdf</Code>, <Code>.docx</Code>.
        </P>

        <CodeBlock>{`> Use neo-script to upload https://example.com/brand-voice.pdf
  as a reference doc for brand "Acme".

> List my neo-script reference docs for the brand "Acme".`}</CodeBlock>

        <H3>Using docs in a generation</H3>
        <P>
          Mention the brand and tell your assistant to <i>use my reference
          docs</i> in the prompt. The Researcher and Writer agents will pull
          the relevant chunks and the output will cite each one with a
          per-document color highlight.
        </P>
      </>
    ),
  },
  {
    id: "citations",
    title: "Citations",
    icon: ShieldCheck,
    body: (
      <>
        <H2>Citation system</H2>
        <P>
          Every fact, keyword, or claim Neo Script writes can be traced back
          to a source. The pipeline tags each citation with one of four kinds
          so you (or your assistant) can audit the output:
        </P>
        <UL>
          <LI><b>User doc</b> — content matched against a doc you uploaded. Same source → same highlight color throughout the post.</LI>
          <LI><b>Keyword</b> — one of your must-include keywords surfaced in the body.</LI>
          <LI><b>Competitor</b> — content sourced from a competitor research crawl (Pro+ only).</LI>
          <LI><b>Web</b> — public web research (reserved for future surfaces).</LI>
        </UL>
        <P>
          When your assistant renders the output, citation spans are marked
          inline. Ask it for the citation list and it will return the source
          for each marker.
        </P>
      </>
    ),
  },
  {
    id: "api-keys",
    title: "API keys",
    icon: KeyRound,
    body: (
      <>
        <H2>API keys</H2>
        <P>
          Your API key is the only credential the MCP server needs. Treat it
          like a password — anyone holding it can spend your credits.
        </P>

        <H3>Format and storage</H3>
        <UL>
          <LI>Keys are prefixed <Code>neo_</Code> followed by a random string.</LI>
          <LI>The full secret is shown <b>once</b>, at the moment of creation. Copy it into your MCP config immediately.</LI>
          <LI>Neo Script only stores a hash — you cannot retrieve the raw key later. Revoke and re-mint if you lose it.</LI>
        </UL>

        <H3>Rotating a key</H3>
        <P>
          Revoke any compromised key from your account, mint a fresh one, and
          update the <Code>Authorization: Bearer …</Code> header in your MCP
          config. Restart your client to apply the change.
        </P>

        <Callout tone="warn">
          Never commit your <Code>neo_…</Code> key to a public repo or paste
          it into a shared chat. If a key leaks, revoke it immediately.
        </Callout>
      </>
    ),
  },
  {
    id: "credits-billing",
    title: "Credits & billing",
    icon: CreditCard,
    body: (
      <>
        <H2>How credits work</H2>
        <P>
          Neo Script is pay-as-you-go. You buy a bundle of credits, spend one
          per generation, and top up whenever you run low.{" "}
          <b>Credits never expire.</b>
        </P>

        <H3>Tiers</H3>
        <UL>
          <LI><b>Free</b> — a small initial grant on sign-up. Once spent you'll need a paid bundle to keep generating.</LI>
          <LI><b>Starter</b> — a credit bundle plus the core feature set.</LI>
          <LI><b>Pro</b> — a larger bundle, plus competitor research and a higher daily MCP cap.</LI>
          <LI><b>Enterprise</b> — fair-use unlimited credits, every feature, and large brand and document caps.</LI>
        </UL>

        <H3>What unlocks what</H3>
        <P>
          Feature gates (competitor research, daily MCP cap, max brands) are
          tied to your <b>last purchased plan</b>. Buying Pro once unlocks Pro
          features until you re-buy a different tier — there's no time-based
          expiry.
        </P>

        <H3>Payment</H3>
        <P>
          Checkout supports UPI, cards, and netbanking. If a payment fails
          you're never charged and no credits are deducted. Successful
          payments usually credit your balance within a second or two.
        </P>
      </>
    ),
  },
];

/* ─── PAGE ───────────────────────────────────────────────────────────────── */
export default function Docs() {
  const [activeId, setActiveId] = useState<string>(SECTIONS[0].id);

  const active = useMemo(
    () => SECTIONS.find((s) => s.id === activeId) ?? SECTIONS[0],
    [activeId],
  );

  return (
    <div className="min-h-screen flex flex-col bg-bg-base pt-10">
      <Navbar />

      <main className="relative flex-1 px-4 sm:px-6 pt-12 pb-16 overflow-hidden">
        {/* Ambient violet glow */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 flex justify-center"
        >
          <div
            style={{
              width: 1000, height: 540,
              background:
                "radial-gradient(ellipse at center, rgba(124,58,237,0.22) 0%, rgba(124,58,237,0.07) 45%, transparent 70%)",
              filter: "blur(10px)",
            }}
          />
        </div>

        <div className="relative max-w-[1180px] mx-auto">
          {/* ─── HEADER ─── */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            className="text-center mb-9"
          >
            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] px-2.5 py-1 rounded-full bg-violet-500/15 text-violet-300 border border-violet-500/25">
              <BookOpen size={11} />
              Documentation
            </span>
            <h1 className="mt-4 text-[32px] sm:text-[42px] font-extrabold tracking-tight text-white leading-[1.05]">
              Everything you need to{" "}
              <span
                style={{
                  background:
                    "linear-gradient(90deg, #a78bfa 0%, #c4b5fd 50%, #f0abfc 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                drive Neo Script from your AI client
              </span>
            </h1>
            <p className="mt-3 text-[14.5px] sm:text-[15.5px] text-white/55 max-w-[640px] mx-auto leading-relaxed">
              Neo Script is an MCP server — connect it to Claude Desktop,
              Cursor, Windsurf, or any MCP-aware assistant, then drive the
              pipeline by chatting with that assistant.
            </p>
          </motion.div>

          {/* ─── BODY: sidebar + content ─── */}
          <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-5 lg:gap-7">
            {/* Sidebar */}
            <aside className="lg:sticky lg:top-24 self-start">
              <nav className="rounded-2xl border border-white/[0.07] bg-white/[0.015] p-2 backdrop-blur-sm">
                {SECTIONS.map((s) => {
                  const Icon = s.icon;
                  const isActive = s.id === activeId;
                  return (
                    <button
                      key={s.id}
                      onClick={() => setActiveId(s.id)}
                      className={[
                        "w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-[13px] font-medium transition-all duration-150 mb-0.5",
                        isActive
                          ? "bg-violet-500/15 text-white border border-violet-500/30"
                          : "text-white/55 hover:text-white hover:bg-white/[0.04] border border-transparent",
                      ].join(" ")}
                    >
                      <span className="flex items-center gap-2.5">
                        <Icon size={14} className={isActive ? "text-violet-300" : "text-white/40"} />
                        <span className="text-left">{s.title}</span>
                      </span>
                      <ChevronRight
                        size={13}
                        className={[
                          "shrink-0 transition-all duration-150",
                          isActive ? "text-violet-300 translate-x-0" : "text-white/25 -translate-x-1 opacity-0",
                        ].join(" ")}
                      />
                    </button>
                  );
                })}
              </nav>
            </aside>

            {/* Content */}
            <motion.article
              key={activeId}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="rounded-2xl border border-white/[0.06] bg-white/[0.015] p-7 sm:p-9 backdrop-blur-sm"
              style={{
                boxShadow: "0 30px 80px -40px rgba(124,58,237,0.18)",
              }}
            >
              {active.body}

              <DocFooterNav
                sections={SECTIONS}
                activeId={activeId}
                onJump={setActiveId}
              />
            </motion.article>
          </div>

          {/* ─── FOOTNOTE STRIP ─── */}
          <div className="mt-12 text-center text-[12.5px] text-white/40">
            Need something not covered here?{" "}
            <a href="mailto:hello@techtrekkers.ai" className="text-violet-300 hover:text-violet-200 underline-offset-4 hover:underline">
              hello@techtrekkers.ai
            </a>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

/* ─── Prev / Next nav ────────────────────────────────────────────────────── */
function DocFooterNav({
  sections,
  activeId,
  onJump,
}: {
  sections: Section[];
  activeId: string;
  onJump: (id: string) => void;
}) {
  const idx = sections.findIndex((s) => s.id === activeId);
  const prev = idx > 0 ? sections[idx - 1] : null;
  const next = idx < sections.length - 1 ? sections[idx + 1] : null;
  if (!prev && !next) return null;

  return (
    <div className="mt-10 pt-6 border-t border-white/[0.06] grid grid-cols-2 gap-3">
      {prev ? (
        <button
          onClick={() => onJump(prev.id)}
          className="text-left rounded-xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/15 transition-colors px-4 py-3"
        >
          <p className="text-[10.5px] uppercase tracking-wider text-white/35 font-semibold">Previous</p>
          <p className="text-[13.5px] font-semibold text-white mt-0.5">{prev.title}</p>
        </button>
      ) : <span />}
      {next ? (
        <button
          onClick={() => onJump(next.id)}
          className="text-right rounded-xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/15 transition-colors px-4 py-3"
        >
          <p className="text-[10.5px] uppercase tracking-wider text-white/35 font-semibold">Next</p>
          <p className="text-[13.5px] font-semibold text-white mt-0.5">{next.title}</p>
        </button>
      ) : <span />}
    </div>
  );
}
