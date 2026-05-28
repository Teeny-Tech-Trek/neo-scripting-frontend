import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, ArrowRight, ChevronRight, Check, Copy, Terminal, Zap,
} from "lucide-react";

/* ─────────────── 3D Card (disabled on mobile) ─────────────── */
const Card3D: React.FC<{
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  intensity?: number;
  disabled?: boolean;
}> = ({ children, className = "", style = {}, intensity = 5, disabled = false }) => {
  const [rot, setRot] = useState({ x: 0, y: 0 });
  if (disabled) return <div className={className} style={style}>{children}</div>;
  return (
    <motion.div
      onMouseMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        setRot({
          x: ((e.clientY - r.top) / r.height - 0.5) * -intensity,
          y: ((e.clientX - r.left) / r.width - 0.5) * intensity,
        });
      }}
      onMouseLeave={() => setRot({ x: 0, y: 0 })}
      animate={{ rotateX: rot.x, rotateY: rot.y }}
      transition={{ type: "spring", stiffness: 280, damping: 28 }}
      className={className}
      style={{ transformStyle: "preserve-3d", ...style }}
    >
      {children}
    </motion.div>
  );
};

const CLIENTS = ["Claude Desktop", "Cursor", "Windsurf"] as const;
type Client = (typeof CLIENTS)[number];

const SAMPLE_PROMPTS = [
  "Generate digital content about MCP servers for B2B SaaS using Neo Script",
  'List my Neo Script reference docs for brand "acme"',
  "Use neo-script to write a LinkedIn post about agentic AI",
];

const TOOL_CALLS = [
  { tool: "generate_content", desc: "Run the full citation-backed pipeline" },
  { tool: "upload_document", desc: "Add a brand-scoped reference doc" },
  { tool: "list_documents", desc: "Browse your reference library" },
  { tool: "check_health", desc: "Ping the pipeline before a long run" },
];

const MCPShowcase: React.FC = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [client, setClient] = useState<Client>("Claude Desktop");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const particles = useMemo(
    () =>
      Array.from({ length: 40 }).map(() => ({
        w: Math.random() * 1.4 + 0.4,
        l: Math.random() * 100,
        t: Math.random() * 100,
        op: Math.random() * 0.4 + 0.08,
        d: 3 + Math.random() * 4,
        dl: Math.random() * 5,
      })),
    [],
  );

  const configSnippet =
    client === "Claude Desktop"
      ? `{
  "mcpServers": {
    "neo-script": {
      "command": "npx",
      "args": ["-y", "mcp-remote",
               "<your-mcp-endpoint>",
               "--header",
               "Authorization: Bearer <your-api-key>"]
    }
  }
}`
      : `{
  "mcpServers": {
    "neo-script": {
      "type": "sse",
      "url": "<your-mcp-endpoint>",
      "headers": {
        "Authorization": "Bearer <your-api-key>"
      }
    }
  }
}`;

  const cardStyle: React.CSSProperties = {
    background:
      "linear-gradient(135deg,rgba(10,8,30,.95),rgba(14,12,42,.95))",
    border: "1px solid rgba(99,102,241,.22)",
    boxShadow:
      "0 20px 60px rgba(0,0,0,.55), 0 0 30px rgba(99,102,241,.10), inset 0 1px 0 rgba(255,255,255,.05)",
    backdropFilter: "blur(20px)",
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(configSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div
      id="demo"
      className="relative overflow-x-hidden py-16 sm:py-20 px-4 sm:px-8 lg:px-20"
      style={{ background: "#06060e" }}
    >
      <style>{`
        @keyframes nb-pulse  { 0%,100%{opacity:.2} 50%{opacity:1} }
        @keyframes nb-glow   { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(12px,-10px) scale(1.04)} }
        @keyframes nb-status { 0%,100%{box-shadow:0 0 0 0 rgba(34,197,94,.55)} 50%{box-shadow:0 0 0 5px rgba(34,197,94,0)} }
        @keyframes nb-shine  { 0%{transform:translateX(-100%)} 100%{transform:translateX(200%)} }
      `}</style>

      {/* Atmosphere */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute"
          style={{
            top: "-5%",
            right: "-8%",
            width: "55%",
            height: "80%",
            background:
              "radial-gradient(ellipse at center,rgba(99,102,241,.18) 0%,rgba(139,92,246,.10) 35%,transparent 65%)",
            animation: "nb-glow 14s ease-in-out infinite",
          }}
        />
        <div
          className="absolute"
          style={{
            bottom: "-10%",
            left: "-5%",
            width: "50%",
            height: "65%",
            background:
              "radial-gradient(ellipse at center,rgba(59,130,246,.12) 0%,transparent 60%)",
          }}
        />
      </div>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map((p, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              width: `${p.w}px`,
              height: `${p.w}px`,
              left: `${p.l}%`,
              top: `${p.t}%`,
              opacity: p.op,
              animation: `nb-pulse ${p.d}s ease-in-out infinite`,
              animationDelay: `${p.dl}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-[1180px] mx-auto">
        {/* ═══════════ HEADER ═══════════ */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10 sm:mb-14"
        >
          <span
            className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] px-2.5 py-1 rounded-full"
            style={{
              background: "rgba(124,58,237,0.12)",
              border: "1px solid rgba(124,58,237,0.28)",
              color: "#c4b5fd",
            }}
          >
            <Terminal size={11} />
            Live MCP server
          </span>
          <h2
            className="mt-4 text-white font-syne-bold"
            style={{
              fontSize: "clamp(2rem, 4vw, 3rem)",
              fontWeight: 900,
              letterSpacing: "-0.02em",
              lineHeight: 1.08,
            }}
          >
            <span className="block">Three lines of JSON.</span>
            <span
              className="block"
              style={{
                background:
                  "linear-gradient(90deg, #22d3ee 0%, #3b82f6 50%, #a855f7 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              You're scripting from your assistant.
            </span>
          </h2>
          <p
            className="mt-4 text-[14.5px] sm:text-[16px] leading-relaxed max-w-[640px] mx-auto"
            style={{ color: "rgba(255,255,255,0.55)" }}
          >
            No accounts to juggle. No tabs to context-switch into. Drop the
            snippet, restart your client, and Neo Script's ten-agent pipeline
            is one prompt away.
          </p>
        </motion.div>

        {/* ═══════════ TWO-COLUMN: CONFIG + USAGE ═══════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_1fr] gap-5 lg:gap-7">
          {/* ─── Left: config card ─── */}
          <Card3D
            disabled={isMobile}
            intensity={3}
            className="rounded-2xl overflow-hidden"
            style={cardStyle}
          >
            <div
              className="flex items-center justify-between px-5 sm:px-6 pt-5 pb-4"
              style={{ borderBottom: "1px solid rgba(255,255,255,.06)" }}
            >
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-[18px] sm:text-[20px] font-extrabold text-white tracking-tight">
                  Drop into your client
                </h3>
                <motion.div
                  animate={{ opacity: [0.6, 1, 0.6] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold"
                  style={{
                    background: "rgba(34,197,94,.14)",
                    border: "1px solid rgba(34,197,94,.32)",
                    color: "#86efac",
                  }}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{
                      background: "#22c55e",
                      boxShadow: "0 0 6px rgba(34,197,94,.7)",
                      animation: "nb-status 2s ease-in-out infinite",
                    }}
                  />
                  MCP live
                </motion.div>
              </div>
            </div>

            <div className="px-5 sm:px-6 py-5 space-y-5">
              {/* Client picker */}
              <div>
                <label className="block text-[11px] sm:text-[12px] font-bold text-white/70 mb-2 uppercase tracking-widest">
                  Pick your client
                </label>
                <div className="flex flex-wrap gap-2">
                  {CLIENTS.map((c) => (
                    <motion.button
                      key={c}
                      onClick={() => setClient(c)}
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-[12px] sm:text-[13px] font-semibold"
                      style={{
                        background:
                          client === c
                            ? "linear-gradient(135deg,#6d28d9,#7c3aed)"
                            : "rgba(255,255,255,.04)",
                        border:
                          client === c
                            ? "1px solid rgba(124,58,237,.6)"
                            : "1px solid rgba(255,255,255,.10)",
                        color: client === c ? "white" : "rgba(255,255,255,.6)",
                        boxShadow:
                          client === c
                            ? "0 0 18px rgba(124,58,237,.45)"
                            : "none",
                      }}
                    >
                      {c}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Config snippet */}
              <div>
                <label className="block text-[11px] sm:text-[12px] font-bold text-white/70 mb-2 uppercase tracking-widest">
                  Paste into your config
                </label>
                <div
                  className="relative rounded-xl overflow-hidden"
                  style={{
                    background: "rgba(0,0,0,.45)",
                    border: "1px solid rgba(99,102,241,.25)",
                  }}
                >
                  <pre className="text-[11px] sm:text-[12px] leading-relaxed text-white/85 p-3 sm:p-4 overflow-x-auto font-mono">
                    {configSnippet}
                  </pre>
                  <motion.button
                    whileTap={{ scale: 0.92 }}
                    onClick={handleCopy}
                    className="absolute top-2 right-2 flex items-center gap-1.5 px-2 py-1 rounded-md text-[10.5px] font-semibold"
                    style={{
                      background: "rgba(99,102,241,.20)",
                      border: "1px solid rgba(99,102,241,.4)",
                      color: "#c4b5fd",
                    }}
                  >
                    {copied ? (
                      <>
                        <Check className="w-3 h-3" strokeWidth={3} /> Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" strokeWidth={2} /> Copy
                      </>
                    )}
                  </motion.button>
                </div>
                <p
                  className="text-[10.5px] sm:text-[11px] mt-2"
                  style={{ color: "rgba(255,255,255,.4)" }}
                >
                  Replace the endpoint and API key with the values from your
                  Neo Script account.
                </p>
              </div>

              {/* CTA */}
              <div className="pt-1">
                <motion.a
                  href="/get-started"
                  whileHover={{
                    scale: 1.01,
                    boxShadow: "0 0 50px rgba(99,102,241,.55)",
                  }}
                  whileTap={{ scale: 0.985 }}
                  className="relative w-full rounded-xl font-bold text-[14px] sm:text-[15px] text-white overflow-hidden flex items-center justify-center gap-2.5"
                  style={{
                    height: isMobile ? 52 : 56,
                    background:
                      "linear-gradient(90deg,#6d28d9 0%,#7c3aed 50%,#8b5cf6 100%)",
                    boxShadow:
                      "0 8px 30px rgba(99,102,241,.50),0 0 20px rgba(124,58,237,.35)",
                  }}
                >
                  <Sparkles className="w-4 h-4" fill="white" strokeWidth={0} />
                  Mint your API key
                  <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
                  <span
                    className="pointer-events-none absolute top-0 bottom-0 w-1/3"
                    style={{
                      background:
                        "linear-gradient(90deg,transparent,rgba(255,255,255,.22),transparent)",
                      animation: "nb-shine 2.2s ease-in-out infinite",
                    }}
                  />
                </motion.a>
              </div>
            </div>
          </Card3D>

          {/* ─── Right: usage card ─── */}
          <div className="flex flex-col gap-5">
            {/* Sample prompts */}
            <Card3D
              disabled={isMobile}
              intensity={3}
              className="rounded-2xl overflow-hidden"
              style={cardStyle}
            >
              <div className="px-5 sm:px-6 pt-5 pb-4">
                <div className="flex items-center gap-2 mb-3">
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center"
                    style={{
                      background:
                        "linear-gradient(135deg,rgba(34,211,238,.18),rgba(99,102,241,.10))",
                      border: "1px solid rgba(96,165,250,.35)",
                    }}
                  >
                    <Zap
                      className="w-3.5 h-3.5"
                      style={{ color: "#22d3ee" }}
                      strokeWidth={2.2}
                    />
                  </div>
                  <h3 className="text-[15px] sm:text-[16px] font-extrabold text-white tracking-tight">
                    Then just ask
                  </h3>
                </div>
                <div className="space-y-2">
                  {SAMPLE_PROMPTS.map((q, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -6 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.05 + i * 0.07 }}
                      className="flex items-start gap-2 px-3 py-2 rounded-lg text-[12px] sm:text-[13px]"
                      style={{
                        background: "rgba(255,255,255,.03)",
                        border: "1px solid rgba(255,255,255,.06)",
                        color: "rgba(255,255,255,.75)",
                      }}
                    >
                      <ChevronRight
                        className="w-3.5 h-3.5 mt-[2px] flex-shrink-0 text-violet-300"
                        strokeWidth={2.5}
                      />
                      <span className="italic">"{q}"</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </Card3D>

            {/* Tools exposed */}
            <Card3D
              disabled={isMobile}
              intensity={3}
              className="rounded-2xl overflow-hidden"
              style={cardStyle}
            >
              <div className="px-5 sm:px-6 pt-5 pb-5">
                <div className="flex items-center gap-2 mb-3">
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center"
                    style={{
                      background:
                        "linear-gradient(135deg,rgba(167,139,250,.20),rgba(124,58,237,.10))",
                      border: "1px solid rgba(167,139,250,.35)",
                    }}
                  >
                    <Terminal
                      className="w-3.5 h-3.5"
                      style={{ color: "#c4b5fd" }}
                      strokeWidth={2.2}
                    />
                  </div>
                  <h3 className="text-[15px] sm:text-[16px] font-extrabold text-white tracking-tight">
                    Tools exposed to your client
                  </h3>
                </div>
                <div className="flex flex-col gap-2">
                  {TOOL_CALLS.map((t, i) => (
                    <motion.div
                      key={t.tool}
                      initial={{ opacity: 0, y: 4 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.05 + i * 0.06 }}
                      className="flex items-start justify-between gap-3 px-3 py-2 rounded-lg"
                      style={{
                        background: "rgba(255,255,255,.025)",
                        border: "1px solid rgba(255,255,255,.06)",
                      }}
                    >
                      <code className="text-[12px] font-mono text-violet-200 flex-shrink-0">
                        {t.tool}
                      </code>
                      <span
                        className="text-[11.5px] text-right"
                        style={{ color: "rgba(255,255,255,.5)" }}
                      >
                        {t.desc}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </Card3D>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MCPShowcase;
