import { useMemo, useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import {
  Sparkles, BookOpen, Cpu, Zap, ShieldCheck, KeyRound, Database,
  Workflow, FileText, CreditCard, Plug, ChevronRight,
} from "lucide-react";
// Docs is a public page — use the landing-page navbar so anonymous visitors
// see the Sign In / Get Started CTAs, not the logged-in avatar dropdown.
import Navbar from "../../LandingAllPagesUi/Navbar";
import Footer from "../Footer";

/* ════════════════════════════════════════════════════════════════════════
   DOCS PAGE — public, two-tab (Technical / Product). Visual language mirrors
   Billing.tsx: dark bg, violet glow, glass surfaces, sidebar nav + content.
   ════════════════════════════════════════════════════════════════════════ */

type Tab = "technical" | "product";

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

/* ─── TECHNICAL DOCS ─────────────────────────────────────────────────────── */
const TECHNICAL: Section[] = [
  {
    id: "overview",
    title: "Overview",
    icon: BookOpen,
    body: (
      <>
        <H2>Technical overview</H2>
        <P>
          Neo Script is a content scripting layer — a multi-agent LLM pipeline
          that turns rough briefs into citation-backed long-form (blogs) and
          short-form (LinkedIn / Twitter / Reddit) content. It's surfaced as
          four cooperating services:
        </P>
        <UL>
          <LI><b>Node.js auth service</b> — Express + Prisma + Postgres. Owns identity, JWT issuance, sessions, OAuth.</LI>
          <LI><b>Python FastAPI backend</b> — the generation pipeline, RAG (Qdrant), citations, history, billing, credits.</LI>
          <LI><b>Python MCP server</b> — SSE bridge for Claude Desktop / Cursor / Windsurf to invoke the pipeline.</LI>
          <LI><b>React + Vite frontend</b> — talks to Node auth for sessions and FastAPI for everything else.</LI>
        </UL>

        <H3>Tech stack</H3>
        <UL>
          <LI>Frontend: React 18, Vite, TypeScript, Tailwind, framer-motion, react-markdown, Razorpay Checkout JS.</LI>
          <LI>Node auth: Node 18+, Express, Prisma 5, bcrypt, RS256 JWT (jose), pino, ioredis.</LI>
          <LI>Python AI: FastAPI, psycopg2, Agno (agents), Gemini (default LLM) + OpenRouter (fallback), Qdrant, Langfuse, Firecrawl, httpx.</LI>
          <LI>MCP server: Python <Code>mcp</Code> SDK, Starlette SSE transport.</LI>
          <LI>DB: AWS RDS Postgres 14+, schemas <Code>auth_service</Code> (Prisma) + <Code>public</Code> (raw SQL).</LI>
          <LI>Vector DB: Qdrant Cloud, collections <Code>aeo_knowledge_base</Code> + <Code>user_knowledge_data</Code>.</LI>
          <LI>Payments: external TTT central billing service (Razorpay-backed) — shared across affiliated products.</LI>
        </UL>
      </>
    ),
  },
  {
    id: "architecture",
    title: "Architecture",
    icon: Cpu,
    body: (
      <>
        <H2>Architecture</H2>
        <P>
          All three backend services run side-by-side under PM2 on a single AWS
          EC2 instance behind nginx. Postgres lives on AWS RDS in the private
          VPC. The frontend is statically hosted and talks to the EC2's nginx
          vhost over HTTPS.
        </P>
        <CodeBlock>{`neoscript.techtrekkers.ai   (frontend, static host)
        │
        ▼
       nginx (EC2, ap-south-1)
        ├─► auth.techtrekkers.ai  →  PM2: neo-auth   (Node, port 3000)
        ├─► api.techtrekkers.ai   →  PM2: neo-python (FastAPI, port 8000)
        └─► mcp.techtrekkers.ai   →  PM2: neo-mcp    (Starlette, port 8080)
                                            │
                                            ▼
                                  AWS RDS Postgres (private VPC)

External (own creds): https://billingservice.techtrekkers.ai  (TTT, payments)`}</CodeBlock>

        <H3>Cross-schema FKs</H3>
        <P>
          Python writes to the <Code>public</Code> schema and stores
          cross-schema foreign keys to <Code>auth_service.users(id)</Code>. The
          Python service never writes to the <Code>auth_service</Code> schema —
          Prisma owns that. Identity comes from the verified JWT's{" "}
          <Code>sub</Code> claim.
        </P>

        <H3>Plan tiers and credits</H3>
        <P>
          Credits are a pure top-up bucket — balance is the lifetime SUM of all
          ledger deltas. Purchases via TTT post <Code>+N</Code> rows tagged
          with <Code>external_payment_id</Code> for idempotency. The free tier
          gets a one-shot trial grant on first observation.
        </P>
      </>
    ),
  },
  {
    id: "auth",
    title: "Authentication",
    icon: ShieldCheck,
    body: (
      <>
        <H2>Authentication model</H2>
        <P>
          Two credential types share a single dispatcher{" "}
          <Code>get_current_user()</Code> in the Python backend.
        </P>

        <H3>JWT (browser sessions)</H3>
        <UL>
          <LI>RS256-signed by Node auth's private key, lifetime 15 min.</LI>
          <LI>Claims: <Code>sub</Code>, <Code>sessionId</Code>, <Code>roles</Code>, <Code>iss</Code>, <Code>aud</Code>.</LI>
          <LI>Python verifies via JWKS at <Code>https://auth.&lt;domain&gt;/auth/.well-known/jwks.json</Code> (note the <b>/auth</b> prefix).</LI>
          <LI>Refresh token is an httpOnly cookie scoped to <Code>/auth/refresh</Code>, 7-day lifetime.</LI>
        </UL>

        <H3>API keys (MCP / programmatic)</H3>
        <UL>
          <LI>Format: <Code>neo_&lt;43-char-urlsafe-base64&gt;</Code>.</LI>
          <LI>Stored as SHA-256 hash in <Code>api_keys.key_hash</Code>. Raw key shown once on creation.</LI>
          <LI>The dispatcher routes by prefix: <Code>neo_</Code> → API key path; everything else → JWT verifier.</LI>
        </UL>

        <Callout tone="warn">
          <b>Critical alignment:</b> Node auth and FastAPI must agree byte-for-byte on{" "}
          <Code>JWT_ISSUER</Code> and <Code>JWT_AUDIENCE</Code>. Any divergence rejects every JWT.
        </Callout>
      </>
    ),
  },
  {
    id: "endpoints",
    title: "API endpoints",
    icon: Plug,
    body: (
      <>
        <H2>API surface</H2>

        <H3>Generation</H3>
        <UL>
          <LI><Code>POST /generate</Code> — full pipeline. Body: <Code>{`{ prompt, brand_name, company_url, mode, platforms, use_user_docs, keywords, competitor_research }`}</Code>. Verified-email gate.</LI>
          <LI><Code>GET /user/generations?limit=12</Code> — paginated history.</LI>
          <LI><Code>GET /user/generations/&#123;id&#125;</Code> — detail with citations.</LI>
        </UL>

        <H3>Knowledge</H3>
        <UL>
          <LI><Code>GET /user/brands</Code> — brand sidebar buckets.</LI>
          <LI><Code>GET /user/documents?brand_name=...</Code> — per-brand docs.</LI>
          <LI><Code>POST /user/documents</Code> — multipart upload (md / txt / pdf / docx).</LI>
        </UL>

        <H3>Billing & credits</H3>
        <UL>
          <LI><Code>GET /user/plan</Code> — current plan + lifetime balance.</LI>
          <LI><Code>GET /billing/plans</Code> — purchasable tiers with TTT prices.</LI>
          <LI><Code>POST /billing/create-order</Code> — start a Razorpay checkout.</LI>
          <LI><Code>POST /billing/verify-payment</Code> — post-checkout polling.</LI>
          <LI><Code>POST /api/billing/internal/activate</Code> — webhook target for TTT (auth via <Code>x-internal-api-key</Code>).</LI>
          <LI><Code>POST /internal/billing/payment-failed</Code> — webhook target for failed payments.</LI>
        </UL>

        <H3>API keys</H3>
        <UL>
          <LI><Code>POST /user/api-keys</Code> — mint. Raw key returned once.</LI>
          <LI><Code>GET /user/api-keys</Code> — list (never includes secret).</LI>
          <LI><Code>DELETE /user/api-keys/&#123;id&#125;</Code> — revoke.</LI>
        </UL>

        <H3>Health</H3>
        <UL>
          <LI><Code>GET /health</Code> — FastAPI + Qdrant status.</LI>
          <LI><Code>GET https://mcp.techtrekkers.ai/health</Code> — MCP server.</LI>
          <LI><Code>GET https://mcp.techtrekkers.ai/status</Code> — active SSE sessions (public, CORS-friendly).</LI>
        </UL>
      </>
    ),
  },
  {
    id: "pipeline",
    title: "Pipeline",
    icon: Workflow,
    body: (
      <>
        <H2>Pipeline anatomy</H2>
        <P>
          The blog pipeline is a five-step DAG of LLM agents. The social pipeline
          is a parallel surface — same researcher, then a platform-specific writer.
        </P>
        <CodeBlock>{`0   Topic generator      (only when caller gave a prompt, not a topic)
0.5 Competitor research   (opt-in, Pro+ only — Firecrawl + Qdrant)
0.7 User-doc retrieval    (opt-in — per-brand Qdrant search)
1   Researcher
2   Planner
3   Writer                (wrapped in run_with_failover → OpenRouter on Gemini 429/5xx)
4   Optimizer
5   Final editor

Post  extract_markers_and_strip  →  Approach-A citations
Then  compute_citations           →  Approach-B (keyword + similarity)
      save_citations              →  blog_citations rows (DELETE+INSERT, idempotent)`}</CodeBlock>

        <P>
          Every external call (LLM, Qdrant, Firecrawl, email, Langfuse, TTT) is
          wrapped in try/except. Failures degrade the result but never blow up
          the generation. <Code>error_logs</Code> records the WARNINGs for
          later analysis.
        </P>
      </>
    ),
  },
  {
    id: "mcp",
    title: "MCP server",
    icon: KeyRound,
    body: (
      <>
        <H2>MCP server</H2>
        <P>
          A standalone Starlette process that bridges Claude Desktop / Cursor /
          Windsurf to the FastAPI pipeline. It validates that incoming
          <Code>Authorization: Bearer neo_...</Code> headers are present, stashes
          them in a contextvar, and forwards each tool call to FastAPI with
          <Code>X-Neo-Source-Channel: mcp</Code> for attribution.
        </P>

        <H3>Tools exposed</H3>
        <UL>
          <LI><Code>generate_blog</Code> — runs the full pipeline.</LI>
          <LI><Code>ingest_document</Code> — admin-only doc ingest from URL.</LI>
          <LI><Code>upload_user_document</Code> — per-brand doc upload from URL.</LI>
          <LI><Code>list_user_documents</Code> — per-brand listing.</LI>
          <LI><Code>check_backend_health</Code> — pings FastAPI <Code>/health</Code>.</LI>
        </UL>

        <H3>Env</H3>
        <CodeBlock>{`API_BASE_URL=https://api.techtrekkers.ai
CORS_ALLOWED_ORIGINS=https://neoscript.techtrekkers.ai
PORT=8080
LOG_LEVEL=info`}</CodeBlock>
      </>
    ),
  },
  {
    id: "deployment",
    title: "Deployment",
    icon: Database,
    body: (
      <>
        <H2>Production deployment</H2>
        <P>
          PM2 + nginx on a single AWS EC2 instance. Three processes: neo-auth,
          neo-python, neo-mcp. AWS RDS Postgres in the same VPC. Frontend on a
          separate static host.
        </P>

        <H3>Updating env vars</H3>
        <P>
          PM2 caches process env from when each app was first launched. Plain
          <Code>pm2 restart</Code> does <b>not</b> reload <Code>.env</Code>. The reliable sequence:
        </P>
        <CodeBlock>{`# 1. Edit the .env on the prod host
nano .env

# 2. Restart with --update-env (or full delete + start)
pm2 restart neo-python --update-env

# 3. Verify
pm2 logs neo-python --lines 30 --nostream`}</CodeBlock>

        <Callout tone="warn">
          <b>python-dotenv quirk:</b> A bare line in <Code>.env</Code> (e.g. a header without <Code>=</Code>)
          aborts parsing and any vars below it never load. Always comment header lines with <Code>#</Code>.
        </Callout>

        <H3>Frontend rebuild</H3>
        <P>
          Vite env vars are baked at <b>build time</b>, not runtime. To change any
          <Code>VITE_*</Code> var, update it in your hosting platform's env settings
          and trigger a fresh build. Restarting is not enough. Then hard-refresh
          the browser to bust the CDN cache.
        </P>
      </>
    ),
  },
];

/* ─── PRODUCT DOCS ───────────────────────────────────────────────────────── */
const PRODUCT: Section[] = [
  {
    id: "getting-started",
    title: "Getting started",
    icon: Sparkles,
    body: (
      <>
        <H2>Your first generation</H2>
        <P>
          You've signed up — here's the 60-second tour.
        </P>
        <UL>
          <LI>Go to <Code>/home</Code>. The brief form sits in the middle.</LI>
          <LI>Pick a <b>brand</b>, paste your <b>company URL</b>, and write a one-line <b>prompt</b> (or a specific topic).</LI>
          <LI>Choose <b>Blog</b> for long-form (~1500 words) or <b>Social</b> for one short post per selected platform.</LI>
          <LI>Optionally toggle <b>use user docs</b> if you've uploaded reference material for this brand. Pro+ users can also toggle <b>competitor research</b>.</LI>
          <LI>Hit <b>Generate</b>. A live progress card shows each agent's step (Research → Plan → Write → Optimize → Finalize).</LI>
          <LI>When it finishes you land on <Code>/result</Code> with the rendered blog, social previews, and inline citations.</LI>
        </UL>

        <Callout>
          Each generation costs <b>1 credit</b>, regardless of mode. The navbar pill in the top-right
          shows your live balance — click it to top up.
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
        <H2>How the generator works</H2>
        <P>
          Every generation runs through a 5-agent pipeline. Each agent has a
          narrow job: Researcher gathers facts, Planner builds the outline,
          Writer drafts, Optimizer tightens, Final Editor polishes and locks
          citations. You watch each stage advance in real time.
        </P>

        <H3>Modes</H3>
        <UL>
          <LI><b>Blog</b> — produces a single long-form post with inline citations + per-platform social variants for any platforms you tick.</LI>
          <LI><b>Social</b> — produces a single short-form post for one platform (LinkedIn, Twitter, or Reddit) with platform-themed preview.</LI>
        </UL>

        <H3>Keywords</H3>
        <P>
          You can pass up to a small list of <b>must-include keywords</b>. The
          Writer treats them as mandatory verbatim phrases — they end up in the
          output and get highlighted as keyword citations on the result page.
        </P>

        <H3>If something feels stuck</H3>
        <P>
          A normal blog run takes 90 – 180 seconds. If the loading screen times
          out before the backend finishes, the result still saves — check
          <Code>/history</Code> a moment later, it'll appear there with the
          status set to <Code>success</Code>.
        </P>
      </>
    ),
  },
  {
    id: "brands-docs",
    title: "Brands & documents",
    icon: FileText,
    body: (
      <>
        <H2>Reference docs (per brand)</H2>
        <P>
          Upload reference material — guidelines, prior posts, product docs —
          and Neo Script will retrieve the relevant chunks during generation,
          weaving in citations to those documents. Each doc is scoped to a
          single brand.
        </P>

        <H3>Where to manage them</H3>
        <UL>
          <LI><Code>/documents</Code> — sidebar of brands on the left, drag-and-drop upload + doc list on the right.</LI>
          <LI>Supported formats: <Code>.md</Code>, <Code>.txt</Code>, <Code>.pdf</Code>, <Code>.docx</Code>.</LI>
          <LI>Click any brand to filter to its docs. Brands are auto-created from your first generation; you can also create one by uploading the first doc under a new brand name.</LI>
        </UL>

        <H3>Using docs in a generation</H3>
        <P>
          On the brief form, set <b>brand</b> and tick <b>Use my reference docs</b>.
          The Researcher and Writer agents will see the brand's relevant
          chunks and the output will cite them with per-document color highlights.
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
          Every fact, keyword, or claim in your generated post can be traced to its source.
          There are four citation kinds, each with its own highlight color:
        </P>
        <UL>
          <LI><b>User doc</b> — content matched against a doc you uploaded. Per-document color (same doc → same color across the whole post).</LI>
          <LI><b>Keyword</b> — one of your must-include keywords surfaced in the text.</LI>
          <LI><b>Competitor</b> — content sourced from a competitor research crawl (Pro+ only).</LI>
          <LI><b>Web</b> — public web research (reserved for future surfaces).</LI>
        </UL>

        <P>
          Hover any highlighted span on the result page to see the source. The
          right-side panel lists every citation with click-to-scroll.
        </P>
      </>
    ),
  },
  {
    id: "claude-mcp",
    title: "Using with Claude / Cursor",
    icon: Plug,
    body: (
      <>
        <H2>Run Neo Script from Claude Desktop</H2>
        <P>
          Mint an API key on <Code>/home</Code> (MCP tab), then drop the snippet
          below into Claude Desktop's <Code>claude_desktop_config.json</Code>.
          Replace <Code>&lt;your-api-key&gt;</Code> with the actual <Code>neo_...</Code> value
          (keep the <Code>Bearer </Code> prefix).
        </P>

        <H3>Windows</H3>
        <CodeBlock>{`{
  "mcpServers": {
    "neo-script": {
      "command": "cmd",
      "args": ["/c", "npx", "-y", "mcp-remote",
               "https://mcp.techtrekkers.ai/sse",
               "--header", "Authorization: Bearer <your-api-key>"]
    }
  }
}`}</CodeBlock>

        <H3>macOS / Linux</H3>
        <CodeBlock>{`{
  "mcpServers": {
    "neo-script": {
      "command": "npx",
      "args": ["-y", "mcp-remote",
               "https://mcp.techtrekkers.ai/sse",
               "--header", "Authorization: Bearer <your-api-key>"]
    }
  }
}`}</CodeBlock>

        <H3>Cursor / Windsurf (native SSE)</H3>
        <CodeBlock>{`{
  "mcpServers": {
    "neo-script": {
      "type": "sse",
      "url": "https://mcp.techtrekkers.ai/sse",
      "headers": { "Authorization": "Bearer <your-api-key>" }
    }
  }
}`}</CodeBlock>

        <Callout>
          After pasting, <b>fully quit and restart</b> Claude Desktop (close the
          window isn't enough). You'll then see <Code>neo-script</Code> in the
          available tools for a new chat.
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
          Credits are pay-as-you-go. You buy a bundle, you spend one credit per
          generation, you top up when you run low. <b>Credits never expire</b>.
        </P>

        <H3>Tiers</H3>
        <UL>
          <LI><b>Free</b> — a small initial grant when you sign up. Once spent, you must purchase a paid bundle to keep generating.</LI>
          <LI><b>Starter</b> — credit bundle plus the basic feature set.</LI>
          <LI><b>Pro</b> — bigger bundle, plus unlocks competitor research and a higher daily MCP cap.</LI>
          <LI><b>Enterprise</b> — fair-use unlimited credits, every feature, large brand and document caps.</LI>
        </UL>

        <H3>What unlocks what</H3>
        <P>
          Feature gates (competitor research, daily MCP limit, max brands) are
          tied to your <b>last purchased plan</b>. Buying Pro once unlocks Pro
          features until you re-buy (no time-based expiry; just buy whatever
          tier you want next).
        </P>

        <H3>Payment</H3>
        <P>
          Razorpay handles checkout — UPI, cards, netbanking. Payments are processed by
          our central billing service; if a payment fails you're never charged
          and no credits are deducted. If credits don't appear within a few
          seconds of a successful payment, refresh <Code>/billing</Code> — the
          webhook usually lands within 1-2 seconds but rare delays are normal.
        </P>
      </>
    ),
  },
];

/* ─── PAGE ───────────────────────────────────────────────────────────────── */
export default function Docs() {
  const [tab, setTab] = useState<Tab>("technical");
  const sections = tab === "technical" ? TECHNICAL : PRODUCT;
  const [activeId, setActiveId] = useState<string>(sections[0].id);

  const active = useMemo(
    () => sections.find((s) => s.id === activeId) ?? sections[0],
    [sections, activeId],
  );

  const handleTabSwitch = (next: Tab) => {
    setTab(next);
    const nextSections = next === "technical" ? TECHNICAL : PRODUCT;
    setActiveId(nextSections[0].id);
  };

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
                ship with Neo Script
              </span>
            </h1>
            <p className="mt-3 text-[14.5px] sm:text-[15.5px] text-white/55 max-w-[640px] mx-auto leading-relaxed">
              Technical docs for developers integrating the API and MCP. Product docs for
              writers and operators using the dashboard.
            </p>

            {/* Tab switcher */}
            <div className="mt-7 inline-flex items-center gap-0.5 bg-white/[0.04] border border-white/[0.08] rounded-full p-1">
              {(["technical", "product"] as Tab[]).map((t) => (
                <button
                  key={t}
                  onClick={() => handleTabSwitch(t)}
                  className={[
                    "px-5 py-1.5 text-[13px] font-medium rounded-full transition-all duration-200 capitalize",
                    tab === t
                      ? "bg-violet-600 text-white shadow-[0_4px_20px_-6px_rgba(124,58,237,0.6)]"
                      : "text-white/55 hover:text-white",
                  ].join(" ")}
                >
                  {t}
                </button>
              ))}
            </div>
          </motion.div>

          {/* ─── BODY: sidebar + content ─── */}
          <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-5 lg:gap-7">
            {/* Sidebar */}
            <aside className="lg:sticky lg:top-24 self-start">
              <nav className="rounded-2xl border border-white/[0.07] bg-white/[0.015] p-2 backdrop-blur-sm">
                {sections.map((s) => {
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
              key={`${tab}-${activeId}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="rounded-2xl border border-white/[0.06] bg-white/[0.015] p-7 sm:p-9 backdrop-blur-sm"
              style={{
                boxShadow: "0 30px 80px -40px rgba(124,58,237,0.18)",
              }}
            >
              {active.body}

              {/* Inter-section nav at bottom */}
              <DocFooterNav
                sections={sections}
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

/* ─── Prev / Next nav within the current tab ─────────────────────────────── */
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
