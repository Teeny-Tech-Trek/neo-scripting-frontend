import React, { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, ArrowRight, ChevronRight,
  LayoutDashboard, Plus, Folder,
  BarChart3, Settings, Check, Loader2,
  Copy,
} from "lucide-react";

/* ─────────────── Inline SVGs ─────────────── */
const LinkedinIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="white">
    <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.36V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.72V1.72C24 .77 23.2 0 22.22 0z"/>
  </svg>
);
const XIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);
const RedditIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="white">
    <path d="M12 0C5.37 0 0 5.37 0 12c0 6.63 5.37 12 12 12s12-5.37 12-12c0-6.63-5.37-12-12-12zm5.01 4.74c.69 0 1.25.56 1.25 1.25a1.25 1.25 0 0 1-2.5.06l-2.6-.55-.8 3.75c1.82.07 3.48.63 4.67 1.49.31-.31.73-.49 1.21-.49.97 0 1.75.79 1.75 1.75 0 .72-.44 1.33-1.04 1.6.03.16.04.32.04.48 0 2.5-2.92 4.53-6.51 4.53s-6.51-2.03-6.51-4.53c0-.16.01-.32.04-.48a1.756 1.756 0 0 1-1.04-1.6c0-.97.79-1.75 1.75-1.75.48 0 .9.18 1.21.49 1.2-.86 2.87-1.42 4.71-1.49l.91-4.35a.39.39 0 0 1 .47-.3l3.04.64A1.25 1.25 0 0 1 17.01 4.74zM9.25 12c-.69 0-1.25.56-1.25 1.25 0 .69.56 1.25 1.25 1.25.69 0 1.25-.56 1.25-1.25 0-.69-.56-1.25-1.25-1.25zm5.5 0c-.69 0-1.25.56-1.25 1.25 0 .69.56 1.25 1.25 1.25.69 0 1.25-.56 1.25-1.25 0-.69-.56-1.25-1.25-1.25zm-5.47 3.99a.33.33 0 0 0-.23.56c.84.84 2.48.91 2.96.91s2.11-.06 2.96-.91a.33.33 0 0 0-.46-.46c-.55.53-1.68.73-2.51.73s-1.98-.2-2.51-.73a.33.33 0 0 0-.23-.1z"/>
  </svg>
);

/* ─────────────── Typewriter ─────────────── */
const TOPICS = [
  "How AI agents are transforming last-mile logistics in 2025",
  "The future of generative AI in B2B content marketing",
  "10 ways vector databases are changing search forever",
];
const PIPELINE_STEPS = [
  "Analyzing topic & intent…",
  "Researching key sources…",
  "Building content outline…",
  "Drafting the body…",
  "Refining structure…",
  "Spinning short-form variants…",
  "Fact-checking content…",
  "Final editorial review…",
  "Preparing for publish…",
  "✓ Content ready!",
];
const RECENT = [
  { title:"AI in logistics 2025",  time:"2h ago",    words:"1,247w", aeo:87, color:"#22d3ee" },
  { title:"Q3 retrospective",      time:"Yesterday", words:"890w",   aeo:79, color:"#a78bfa" },
  { title:"Vector DB benchmarks",  time:"3d ago",    words:"2,103w", aeo:92, color:"#34d399" },
  { title:"Why MCP matters",       time:"Last week", words:"1,560w", aeo:84, color:"#f9a8d4" },
];

const useAutoType = (enabled: boolean) => {
  const [text, setText]       = useState("");
  const [idx, setIdx]         = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [phase, setPhase]     = useState<"typing"|"hold"|"clearing">("typing");

  useEffect(() => {
    if (!enabled) return;
    const target = TOPICS[idx];
    let t: ReturnType<typeof setTimeout>;
    if (phase === "typing") {
      if (charIdx < target.length) t = setTimeout(() => { setText(target.slice(0,charIdx+1)); setCharIdx(c=>c+1); }, 38);
      else t = setTimeout(() => setPhase("hold"), 2400);
    } else if (phase === "hold") {
      t = setTimeout(() => setPhase("clearing"), 300);
    } else {
      if (charIdx > 0) t = setTimeout(() => { setCharIdx(c=>c-1); setText(target.slice(0,charIdx-1)); }, 16);
      else { setIdx(i=>(i+1)%TOPICS.length); setPhase("typing"); }
    }
    return () => clearTimeout(t);
  }, [enabled, phase, charIdx, idx]);

  return { text, isTyping: phase === "typing" };
};

/* ─────────────── Trust score badge ───────────────
   Animated counter, surfaces the citation-backed quality score. */
const AeoBadge: React.FC<{ value:number; color:string }> = ({ value, color }) => {
  const [d, setD] = useState(0);
  useEffect(() => {
    let n = 0; const step = value/75;
    const id = setInterval(() => { n=Math.min(n+step,value); setD(Math.round(n)); if(n>=value) clearInterval(id); }, 16);
    return () => clearInterval(id);
  }, [value]);
  return <span className="text-[10.5px] font-bold px-1.5 py-0.5 rounded whitespace-nowrap"
    style={{ background:`${color}18`, color, border:`1px solid ${color}40` }}>TRUST {d}</span>;
};

/* ─────────────── 3D Card (disabled on mobile) ─────────────── */
const Card3D: React.FC<{ children:React.ReactNode; className?:string; style?:React.CSSProperties; intensity?:number; disabled?:boolean }> =
  ({ children, className="", style={}, intensity=5, disabled=false }) => {
  const [rot, setRot] = useState({ x:0, y:0 });
  if (disabled) return <div className={className} style={style}>{children}</div>;
  return (
    <motion.div
      onMouseMove={e => {
        const r = e.currentTarget.getBoundingClientRect();
        setRot({ x:((e.clientY-r.top)/r.height-.5)*-intensity, y:((e.clientX-r.left)/r.width-.5)*intensity });
      }}
      onMouseLeave={() => setRot({x:0,y:0})}
      animate={{ rotateX:rot.x, rotateY:rot.y }}
      transition={{ type:"spring", stiffness:280, damping:28 }}
      className={className} style={{ transformStyle:"preserve-3d", ...style }}>
      {children}
    </motion.div>
  );
};

/* ─────────────── Main Component ─────────────── */
const NewBriefDashboard: React.FC = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [userEditing, setUserEditing] = useState(false);
  const [topic, setTopic]             = useState("");
  const [brand, setBrand]             = useState("Acme Logistics");
  const [url, setUrl]                 = useState("acme.com");
  const [tone, setTone]               = useState("Professional");
  const [length, setLength]           = useState("Standard");
  const [socials, setSocials]         = useState({ linkedin:true, twitter:true, reddit:false });
  const [showAdv, setShowAdv]         = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [genStep, setGenStep]           = useState(-1);
  const [activeTab, setActiveTab]       = useState<"webapp"|"mcp">("webapp");
  const [copied, setCopied]             = useState(false);
  const [mobileSection, setMobileSection] = useState<"form"|"recent">("form");

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const { text: autoText, isTyping } = useAutoType(!userEditing && !isGenerating);
  useEffect(() => { if (!userEditing) setTopic(autoText); }, [autoText, userEditing]);

  const handleGenerate = useCallback(() => {
    if (isGenerating) return;
    setIsGenerating(true); setGenStep(0);
    PIPELINE_STEPS.forEach((_,i) => setTimeout(() => setGenStep(i), i*680));
    setTimeout(() => { setIsGenerating(false); setGenStep(-1); }, PIPELINE_STEPS.length*680+800);
  }, [isGenerating]);

  const toggleSocial = (k: keyof typeof socials) => setSocials(s=>({...s,[k]:!s[k]}));
  const MCP_URL = "neo-script-mcp.com/sse";

  const particles = useMemo(() => Array.from({length:40}).map(()=>({
    w:Math.random()*1.4+0.4, l:Math.random()*100, t:Math.random()*100,
    op:Math.random()*.4+.08, d:3+Math.random()*4, dl:Math.random()*5,
  })), []);

  const TONES   = ["Professional","Casual","Technical","Story-driven"];
  const LENGTHS = [
    { label:"Short",    sub:"500w" },
    { label:"Standard", sub:"1000w" },
    { label:"Long",     sub:"2000w" },
  ];
  const NAV_ICONS = [
    { icon:LayoutDashboard, active:false },
    { icon:Plus,            active:true  },
    { icon:Folder,          active:false },
    { icon:BarChart3,       active:false },
    { icon:Settings,        active:false },
  ];

  /* ── CARD STYLE HELPER ── */
  const cardStyle: React.CSSProperties = {
    background:"linear-gradient(135deg,rgba(10,8,30,.95),rgba(14,12,42,.95))",
    border:"1px solid rgba(99,102,241,.22)",
    boxShadow:"0 20px 60px rgba(0,0,0,.55), 0 0 30px rgba(99,102,241,.10), inset 0 1px 0 rgba(255,255,255,.05)",
    backdropFilter:"blur(20px)",
  };

  return (
    <div
     id="demo"
     className="min-h-screen relative overflow-x-hidden p-20" style={{ background:"#06060e" }}>
      <style>{`
        @keyframes nb-pulse  { 0%,100%{opacity:.2} 50%{opacity:1} }
        @keyframes nb-glow   { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(12px,-10px) scale(1.04)} }
        @keyframes nb-spin   { to{transform:rotate(360deg)} }
        @keyframes nb-status { 0%,100%{box-shadow:0 0 0 0 rgba(34,197,94,.55)} 50%{box-shadow:0 0 0 5px rgba(34,197,94,0)} }
        @keyframes nb-shine  { 0%{transform:translateX(-100%)} 100%{transform:translateX(200%)} }
        @keyframes nb-caret  { 0%,100%{opacity:1} 50%{opacity:0} }
        .nb-caret { display:inline-block;width:1.5px;height:.85em;background:rgba(167,139,250,.85);
          margin-left:1px;vertical-align:middle;animation:nb-caret .75s steps(2) infinite; }
      `}</style>

      {/* Atmosphere */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute" style={{ top:"-5%",right:"-8%",width:"55%",height:"80%",
          background:"radial-gradient(ellipse at center,rgba(99,102,241,.18) 0%,rgba(139,92,246,.10) 35%,transparent 65%)",
          animation:"nb-glow 14s ease-in-out infinite" }}/>
        <div className="absolute" style={{ bottom:"-10%",left:"-5%",width:"50%",height:"65%",
          background:"radial-gradient(ellipse at center,rgba(59,130,246,.12) 0%,transparent 60%)" }}/>
      </div>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map((p,i) => (
          <div key={i} className="absolute rounded-full bg-white"
            style={{ width:`${p.w}px`,height:`${p.w}px`,left:`${p.l}%`,top:`${p.t}%`,
              opacity:p.op, animation:`nb-pulse ${p.d}s ease-in-out infinite`, animationDelay:`${p.dl}s` }}/>
        ))}
      </div>

      {/* ══════════ LAYOUT ══════════ */}
      <div className="relative z-10 flex flex-col lg:flex-row">

        {/* ── DESKTOP SIDEBAR (hidden on mobile) ── */}
        <aside className="hidden lg:flex flex-col items-center py-5 gap-1 flex-shrink-0"
          style={{ width:56, background:"rgba(8,8,20,.88)", borderRight:"1px solid rgba(255,255,255,.06)" }}>
          {/* Logo */}
          <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-5"
            style={{ background:"linear-gradient(135deg,#1a0a3d,#0e1e50)",
              border:"1px solid rgba(34,211,238,.4)", boxShadow:"0 0 14px rgba(34,211,238,.3)" }}>
            <Sparkles className="w-4 h-4" style={{ color:"#22d3ee" }} fill="#22d3ee" strokeWidth={0}/>
          </div>
          {NAV_ICONS.map(({ icon:Icon, active }, i) => (
            <motion.button key={i} whileHover={{ scale:1.12 }} whileTap={{ scale:.92 }}
              className="w-9 h-9 rounded-xl flex items-center justify-center cursor-pointer"
              style={{ background:active?"linear-gradient(135deg,rgba(34,211,238,.18),rgba(99,102,241,.12))":"transparent",
                border:active?"1px solid rgba(34,211,238,.3)":"1px solid transparent",
                color:active?"#22d3ee":"rgba(255,255,255,.4)" }}>
              <Icon className="w-4 h-4" strokeWidth={2}/>
            </motion.button>
          ))}
        </aside>

        {/* ── MOBILE TOP HEADER (hidden on desktop) ── */}
        <header className="lg:hidden flex items-center justify-between px-4 py-3 flex-shrink-0"
          style={{ background:"rgba(8,8,20,.9)", borderBottom:"1px solid rgba(255,255,255,.06)" }}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background:"linear-gradient(135deg,#1a0a3d,#0e1e50)", border:"1px solid rgba(34,211,238,.4)" }}>
              <Sparkles className="w-3.5 h-3.5" style={{ color:"#22d3ee" }} fill="#22d3ee" strokeWidth={0}/>
            </div>
            <span className="text-[15px] font-extrabold text-white">NeoScripting</span>
          </div>
          <motion.div animate={{ opacity:[.6,1,.6] }} transition={{ duration:2, repeat:Infinity }}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold"
            style={{ background:"rgba(99,102,241,.15)", border:"1px solid rgba(99,102,241,.3)", color:"#a5b4fc" }}>
            <span className="w-1.5 h-1.5 rounded-full bg-violet-400"
              style={{ animation:"nb-status 2s ease-in-out infinite" }}/>
            Multi-agent
          </motion.div>
        </header>

        {/* ── MOBILE SECTION TABS (form / recent) ── */}
        <div className="lg:hidden flex items-center justify-center py-2.5 gap-1 flex-shrink-0"
          style={{ background:"rgba(8,8,20,.7)" }}>
          {(["form","recent"] as const).map(s => (
            <button key={s} onClick={() => setMobileSection(s)}
              className="px-5 py-1.5 rounded-full text-[12px] font-semibold transition-all capitalize"
              style={{
                background:mobileSection===s?"linear-gradient(135deg,#6366f1,#7c3aed)":"transparent",
                color:mobileSection===s?"white":"rgba(255,255,255,.5)",
                boxShadow:mobileSection===s?"0 0 16px rgba(99,102,241,.45)":"none",
              }}>
              {s === "form" ? "New Brief" : "Recent"}
            </button>
          ))}
        </div>

        {/* ── MAIN CONTENT ── */}
        <main className={`flex-1 flex flex-col ${isMobile ? "pb-20" : ""}`}>

          {/* Tab bar (desktop) */}
          <div className="hidden lg:flex items-center justify-center pt-5 pb-3 gap-1 flex-shrink-0">
            <div className="flex items-center p-1 rounded-full"
              style={{ background:"rgba(255,255,255,.05)", border:"1px solid rgba(255,255,255,.08)" }}>
              {(["Web app","MCP server"] as const).map(tab => (
                <motion.button key={tab}
                  onClick={() => setActiveTab(tab==="Web app"?"webapp":"mcp")}
                  whileTap={{ scale:.96 }}
                  className="px-4 py-1.5 rounded-full text-[13px] font-semibold transition-all"
                  style={{
                    background:(tab==="Web app"&&activeTab==="webapp")||(tab==="MCP server"&&activeTab==="mcp")
                      ?"linear-gradient(135deg,#6366f1,#7c3aed)":"transparent",
                    color:(tab==="Web app"&&activeTab==="webapp")||(tab==="MCP server"&&activeTab==="mcp")
                      ?"white":"rgba(255,255,255,.5)",
                    boxShadow:(tab==="Web app"&&activeTab==="webapp")||(tab==="MCP server"&&activeTab==="mcp")
                      ?"0 0 16px rgba(99,102,241,.45)":"none",
                  }}>
                  {tab}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Form (hidden on mobile when "recent" tab active) — only the
              "Web app" tab. MCP tab swaps the same surface for a setup view. */}
          <AnimatePresence mode="wait">
            {(!isMobile || mobileSection === "form") && activeTab === "webapp" && (
              <motion.div key="form"
                initial={isMobile?{opacity:0,x:-20}:{opacity:0,y:8}}
                animate={isMobile?{opacity:1,x:0}:{opacity:1,y:0}}
                exit={isMobile?{opacity:0,x:-20}:{opacity:0,y:-8}}
                transition={{ duration:.3 }}
                className="flex-1 px-3 sm:px-5 lg:px-8 pb-4 lg:pb-8">
                <Card3D disabled={isMobile} intensity={3} className="rounded-2xl overflow-hidden" style={cardStyle}>

                  {/* Card header */}
                  <div className="flex items-center justify-between px-4 sm:px-6 pt-5 pb-4"
                    style={{ borderBottom:"1px solid rgba(255,255,255,.06)" }}>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-[18px] sm:text-[22px] font-extrabold text-white tracking-tight">New brief</h2>
                        <motion.div animate={{ opacity:[.6,1,.6] }} transition={{ duration:2, repeat:Infinity }}
                          className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold"
                          style={{ background:"rgba(99,102,241,.15)", border:"1px solid rgba(99,102,241,.3)", color:"#a5b4fc" }}>
                          <span className="w-1.5 h-1.5 rounded-full bg-violet-400"
                            style={{ animation:"nb-status 2s ease-in-out infinite" }}/>
                          Multi-agent · 30-60s
                        </motion.div>
                      </div>
                    </div>
                  </div>

                  <div className="px-4 sm:px-6 py-4 sm:py-5 space-y-4 sm:space-y-5">

                    {/* Topic */}
                    <div>
                      <label className="block text-[11px] sm:text-[12px] font-bold text-white/70 mb-2 uppercase tracking-widest">
                        What should we write about?
                      </label>
                      <div className="relative rounded-xl"
                        style={{ background:"rgba(255,255,255,.04)", border:"1px solid rgba(99,102,241,.25)" }}>
                        <textarea rows={isMobile?2:2} value={topic}
                          onChange={e => { setUserEditing(true); setTopic(e.target.value); }}
                          onFocus={() => setUserEditing(true)}
                          placeholder="Enter a topic or idea…"
                          className="w-full bg-transparent text-white text-[13px] sm:text-[14px] leading-relaxed px-4 py-3 resize-none outline-none placeholder:text-white/30"/>
                        {!userEditing && isTyping && <span className="nb-caret"/>}
                        {!userEditing && (
                          <motion.div className="absolute inset-0 pointer-events-none rounded-xl"
                            animate={{ opacity:[0,.4,0] }} transition={{ duration:3, repeat:Infinity }}
                            style={{ boxShadow:"inset 0 0 0 1px rgba(99,102,241,.55)" }}/>
                        )}
                      </div>
                    </div>

                    {/* Brand + URL */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      {[
                        { label:"Brand",       value:brand, setter:setBrand, ph:"Company name" },
                        { label:"Company URL", value:url,   setter:setUrl,   ph:"https://…"   },
                      ].map(f => (
                        <div key={f.label}>
                          <label className="block text-[11px] sm:text-[12px] font-bold text-white/70 mb-1.5 uppercase tracking-widest">{f.label}</label>
                          <input type="text" value={f.value} onChange={e=>f.setter(e.target.value)} placeholder={f.ph}
                            className="w-full rounded-xl px-3 sm:px-4 py-2.5 text-[13px] text-white outline-none"
                            style={{ background:"rgba(255,255,255,.04)", border:"1px solid rgba(99,102,241,.20)" }}
                            onFocus={e=>(e.currentTarget.style.borderColor="rgba(99,102,241,.55)")}
                            onBlur={e =>(e.currentTarget.style.borderColor="rgba(99,102,241,.20)")}/>
                        </div>
                      ))}
                    </div>

                    {/* Tone */}
                    <div>
                      <label className="block text-[11px] sm:text-[12px] font-bold text-white/70 mb-2.5 uppercase tracking-widest">Tone</label>
                      <div className="flex flex-wrap gap-2">
                        {TONES.map(t => (
                          <motion.button key={t} onClick={() => setTone(t)}
                            whileHover={{ scale:1.04 }} whileTap={{ scale:.95 }}
                            className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-[12px] sm:text-[13px] font-semibold"
                            style={{
                              background:tone===t?"linear-gradient(135deg,#6d28d9,#7c3aed)":"rgba(255,255,255,.04)",
                              border:tone===t?"1px solid rgba(124,58,237,.6)":"1px solid rgba(255,255,255,.10)",
                              color:tone===t?"white":"rgba(255,255,255,.6)",
                              boxShadow:tone===t?"0 0 18px rgba(124,58,237,.45)":"none",
                            }}>
                            {t}
                          </motion.button>
                        ))}
                      </div>
                    </div>

                    {/* Length */}
                    <div>
                      <label className="block text-[11px] sm:text-[12px] font-bold text-white/70 mb-2.5 uppercase tracking-widest">Length</label>
                      <div className="flex flex-wrap gap-2">
                        {LENGTHS.map(({ label, sub }) => (
                          <motion.button key={label} onClick={() => setLength(label)}
                            whileHover={{ scale:1.04 }} whileTap={{ scale:.95 }}
                            className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-[12px] sm:text-[13px] font-semibold"
                            style={{
                              background:length===label?"linear-gradient(135deg,#6d28d9,#7c3aed)":"rgba(255,255,255,.04)",
                              border:length===label?"1px solid rgba(124,58,237,.6)":"1px solid rgba(255,255,255,.10)",
                              color:length===label?"white":"rgba(255,255,255,.6)",
                              boxShadow:length===label?"0 0 18px rgba(124,58,237,.45)":"none",
                            }}>
                            {label} <span style={{ opacity:.65, fontWeight:400, fontSize:"11px" }}>· {sub}</span>
                          </motion.button>
                        ))}
                      </div>
                    </div>

                    {/* Social checkboxes */}
                    <div>
                      <label className="block text-[11px] sm:text-[12px] font-bold text-white/70 mb-2.5 uppercase tracking-widest">
                        Also spin into social posts
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {[
                          { key:"linkedin" as const, label:"LinkedIn", icon:<LinkedinIcon/>, bg:"#0a66c2" },
                          { key:"twitter"  as const, label:"Twitter",  icon:<XIcon/>,        bg:"#000"    },
                          { key:"reddit"   as const, label:"Reddit",   icon:<RedditIcon/>,   bg:"#ff4500" },
                        ].map(({ key, label, icon, bg }) => (
                          <motion.button key={key} onClick={() => toggleSocial(key)}
                            whileHover={{ scale:1.04 }} whileTap={{ scale:.94 }}
                            className="flex items-center gap-2 px-3 py-1.5 sm:py-2 rounded-lg text-[12px] sm:text-[13px] font-semibold"
                            style={{
                              background:socials[key]?`${bg}22`:"rgba(255,255,255,.04)",
                              border:socials[key]?`1px solid ${bg}60`:"1px solid rgba(255,255,255,.10)",
                              color:socials[key]?"white":"rgba(255,255,255,.5)",
                              boxShadow:socials[key]?`0 0 14px ${bg}44`:"none",
                            }}>
                            <div className="w-5 h-5 rounded flex items-center justify-center"
                              style={{ background:socials[key]?bg:"rgba(255,255,255,.08)" }}>
                              {socials[key]?icon:<div style={{ width:7,height:7,borderRadius:2,border:"1px solid rgba(255,255,255,.3)" }}/>}
                            </div>
                            {label}
                          </motion.button>
                        ))}
                      </div>
                    </div>

                    {/* Advanced */}
                    <motion.button onClick={() => setShowAdv(s=>!s)}
                      className="flex items-center gap-2 text-[12px] sm:text-[13px] font-semibold text-white/50 hover:text-white/80 transition-colors">
                      <motion.span animate={{ rotate:showAdv?90:0 }}><ChevronRight className="w-4 h-4" strokeWidth={2}/></motion.span>
                      Advanced options
                      <span className="text-[10.5px] text-white/30 ml-1 hidden sm:inline">· keywords · audience · internal links</span>
                    </motion.button>
                    <AnimatePresence>
                      {showAdv && (
                        <motion.div initial={{ height:0, opacity:0 }} animate={{ height:"auto", opacity:1 }}
                          exit={{ height:0, opacity:0 }} transition={{ duration:.25 }} style={{ overflow:"hidden" }}>
                          <div className="pt-2 pb-1 grid grid-cols-1 sm:grid-cols-3 gap-3">
                            {["Target keywords","Audience segment","Internal links"].map(f => (
                              <div key={f}>
                                <label className="block text-[10.5px] font-bold text-white/50 mb-1.5 uppercase tracking-widest">{f}</label>
                                <input type="text" placeholder={`Add ${f.toLowerCase()}…`}
                                  className="w-full rounded-lg px-3 py-2 text-[12.5px] text-white outline-none"
                                  style={{ background:"rgba(255,255,255,.04)", border:"1px solid rgba(99,102,241,.18)" }}
                                  onFocus={e=>(e.currentTarget.style.borderColor="rgba(99,102,241,.5)")}
                                  onBlur={e =>(e.currentTarget.style.borderColor="rgba(99,102,241,.18)")}/>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Generate button */}
                    <div className="pt-1">
                      <motion.button onClick={handleGenerate} disabled={isGenerating}
                        whileHover={!isGenerating?{ scale:1.01, boxShadow:"0 0 50px rgba(99,102,241,.65)" }:undefined}
                        whileTap={!isGenerating?{ scale:.985 }:undefined}
                        className="relative w-full rounded-xl font-bold text-[14px] sm:text-[15px] text-white overflow-hidden cursor-pointer disabled:cursor-default"
                        style={{ height:isMobile?52:56,
                          background:isGenerating?"linear-gradient(90deg,#4f46e5,#6d28d9,#7c3aed)":"linear-gradient(90deg,#6d28d9 0%,#7c3aed 50%,#8b5cf6 100%)",
                          boxShadow:"0 8px 30px rgba(99,102,241,.50),0 0 20px rgba(124,58,237,.35)" }}>
                        <AnimatePresence mode="wait">
                          {isGenerating ? (
                            <motion.div key="gen"
                              initial={{ opacity:0,y:6 }} animate={{ opacity:1,y:0 }} exit={{ opacity:0,y:-6 }}
                              className="absolute inset-0 flex flex-col items-center justify-center gap-0.5 px-4">
                              <div className="flex items-center gap-2 text-[13px] sm:text-[14px] font-bold">
                                <Loader2 className="w-4 h-4 flex-shrink-0" style={{ animation:"nb-spin 1s linear infinite" }} strokeWidth={2.5}/>
                                Generating…
                              </div>
                              <AnimatePresence mode="wait">
                                <motion.div key={genStep}
                                  initial={{ opacity:0,y:4 }} animate={{ opacity:1,y:0 }} exit={{ opacity:0,y:-4 }}
                                  className="text-[10px] sm:text-[11px] font-medium" style={{ color:"rgba(255,255,255,.70)" }}>
                                  {genStep >= 0 && PIPELINE_STEPS[genStep]}
                                </motion.div>
                              </AnimatePresence>
                              <motion.div className="absolute bottom-0 left-0 h-[3px] rounded-b-xl"
                                style={{ background:"rgba(255,255,255,.45)" }}
                                initial={{ width:"0%" }}
                                animate={{ width:`${((genStep+1)/PIPELINE_STEPS.length)*100}%` }}
                                transition={{ duration:.5, ease:"easeOut" }}/>
                            </motion.div>
                          ) : (
                            <motion.div key="idle"
                              initial={{ opacity:0,y:6 }} animate={{ opacity:1,y:0 }} exit={{ opacity:0,y:-6 }}
                              className="absolute inset-0 flex items-center justify-center gap-2.5">
                              <Sparkles className="w-4 h-4" fill="white" strokeWidth={0}/>
                              Run script
                              <ArrowRight className="w-4 h-4" strokeWidth={2.5}/>
                            </motion.div>
                          )}
                        </AnimatePresence>
                        {!isGenerating && (
                          <span className="pointer-events-none absolute top-0 bottom-0 w-1/3"
                            style={{ background:"linear-gradient(90deg,transparent,rgba(255,255,255,.22),transparent)",
                              animation:"nb-shine 2.2s ease-in-out infinite" }}/>
                        )}
                      </motion.button>
                      <p className="text-center text-[10.5px] sm:text-[11.5px] mt-2" style={{ color:"rgba(255,255,255,.3)" }}>
                        {isMobile ? "Tap to generate" : "⌘ + ↵ to generate"}
                      </p>
                    </div>

                  </div>
                </Card3D>
              </motion.div>
            )}

            {/* MCP tab — mirrors the form's surface but shows an IDE setup view.
                Static (illustrative), not interactive — same as the rest of the
                landing demo. */}
            {(!isMobile || mobileSection === "form") && activeTab === "mcp" && (
              <motion.div key="mcp"
                initial={isMobile?{opacity:0,x:-20}:{opacity:0,y:8}}
                animate={isMobile?{opacity:1,x:0}:{opacity:1,y:0}}
                exit={isMobile?{opacity:0,x:-20}:{opacity:0,y:-8}}
                transition={{ duration:.3 }}
                className="flex-1 px-3 sm:px-5 lg:px-8 pb-4 lg:pb-8">
                <Card3D disabled={isMobile} intensity={3} className="rounded-2xl overflow-hidden" style={cardStyle}>

                  {/* Card header */}
                  <div className="flex items-center justify-between px-4 sm:px-6 pt-5 pb-4"
                    style={{ borderBottom:"1px solid rgba(255,255,255,.06)" }}>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-[18px] sm:text-[22px] font-extrabold text-white tracking-tight">
                        Connect to your IDE
                      </h2>
                      <motion.div animate={{ opacity:[.6,1,.6] }} transition={{ duration:2, repeat:Infinity }}
                        className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold"
                        style={{ background:"rgba(34,197,94,.14)", border:"1px solid rgba(34,197,94,.32)", color:"#86efac" }}>
                        <span className="w-1.5 h-1.5 rounded-full"
                          style={{ background:"#22c55e", boxShadow:"0 0 6px rgba(34,197,94,.7)", animation:"nb-status 2s ease-in-out infinite" }}/>
                        MCP server live
                      </motion.div>
                    </div>
                  </div>

                  <div className="px-4 sm:px-6 py-4 sm:py-5 space-y-4 sm:space-y-5">

                    {/* Client picker */}
                    <div>
                      <label className="block text-[11px] sm:text-[12px] font-bold text-white/70 mb-2 uppercase tracking-widest">
                        Pick your client
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {["Claude Desktop","Cursor","Windsurf"].map((c,i) => (
                          <motion.div key={c}
                            initial={{ opacity:0, y:6 }} animate={{ opacity:1, y:0 }}
                            transition={{ delay:.05+i*.06 }}
                            className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-[12px] sm:text-[13px] font-semibold"
                            style={{
                              background: i===0?"linear-gradient(135deg,#6d28d9,#7c3aed)":"rgba(255,255,255,.04)",
                              border: i===0?"1px solid rgba(124,58,237,.6)":"1px solid rgba(255,255,255,.10)",
                              color: i===0?"white":"rgba(255,255,255,.6)",
                              boxShadow: i===0?"0 0 18px rgba(124,58,237,.45)":"none",
                            }}>
                            {c}
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    {/* Config snippet */}
                    <div>
                      <label className="block text-[11px] sm:text-[12px] font-bold text-white/70 mb-2 uppercase tracking-widest">
                        Paste into your config
                      </label>
                      <div className="relative rounded-xl overflow-hidden"
                        style={{ background:"rgba(0,0,0,.45)", border:"1px solid rgba(99,102,241,.25)" }}>
                        <pre className="text-[11px] sm:text-[12px] leading-relaxed text-white/85 p-3 sm:p-4 overflow-x-auto font-mono">
{`{
  "mcpServers": {
    "neo-script": {
      "command": "npx",
      "args": ["-y", "mcp-remote",
               "https://${MCP_URL}",
               "--header",
               "Authorization: Bearer neo_xxxx"]
    }
  }
}`}
                        </pre>
                        <motion.button whileTap={{ scale:.92 }}
                          onClick={() => { navigator.clipboard.writeText(`https://${MCP_URL}`); setCopied(true); setTimeout(()=>setCopied(false),1500); }}
                          className="absolute top-2 right-2 flex items-center gap-1.5 px-2 py-1 rounded-md text-[10.5px] font-semibold"
                          style={{ background:"rgba(99,102,241,.20)", border:"1px solid rgba(99,102,241,.4)", color:"#c4b5fd" }}>
                          {copied
                            ? <><Check className="w-3 h-3" strokeWidth={3}/> Copied</>
                            : <><Copy className="w-3 h-3" strokeWidth={2}/> Copy</>}
                        </motion.button>
                      </div>
                    </div>

                    {/* Example prompts */}
                    <div>
                      <label className="block text-[11px] sm:text-[12px] font-bold text-white/70 mb-2 uppercase tracking-widest">
                        Then ask your assistant
                      </label>
                      <div className="space-y-2">
                        {[
                          "Generate a blog about MCP servers for B2B SaaS using Neo Script",
                          "List my Neo Script reference docs for brand \"acme\"",
                          "Use neo-script to write a LinkedIn post about agentic AI",
                        ].map((q,i) => (
                          <motion.div key={i}
                            initial={{ opacity:0, x:-6 }} animate={{ opacity:1, x:0 }}
                            transition={{ delay:.15+i*.07 }}
                            className="flex items-start gap-2 px-3 py-2 rounded-lg text-[12px] sm:text-[13px]"
                            style={{ background:"rgba(255,255,255,.03)", border:"1px solid rgba(255,255,255,.06)", color:"rgba(255,255,255,.75)" }}>
                            <ChevronRight className="w-3.5 h-3.5 mt-[2px] flex-shrink-0 text-violet-300" strokeWidth={2.5}/>
                            <span className="italic">"{q}"</span>
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    {/* Footer CTA */}
                    <div className="pt-1">
                      <motion.div
                        whileHover={{ scale:1.01, boxShadow:"0 0 50px rgba(99,102,241,.55)" }}
                        whileTap={{ scale:.985 }}
                        className="relative w-full rounded-xl font-bold text-[14px] sm:text-[15px] text-white overflow-hidden flex items-center justify-center gap-2.5"
                        style={{ height:isMobile?52:56,
                          background:"linear-gradient(90deg,#6d28d9 0%,#7c3aed 50%,#8b5cf6 100%)",
                          boxShadow:"0 8px 30px rgba(99,102,241,.50),0 0 20px rgba(124,58,237,.35)" }}>
                        <Sparkles className="w-4 h-4" fill="white" strokeWidth={0}/>
                        Mint your API key
                        <ArrowRight className="w-4 h-4" strokeWidth={2.5}/>
                        <span className="pointer-events-none absolute top-0 bottom-0 w-1/3"
                          style={{ background:"linear-gradient(90deg,transparent,rgba(255,255,255,.22),transparent)",
                            animation:"nb-shine 2.2s ease-in-out infinite" }}/>
                      </motion.div>
                      <p className="text-center text-[10.5px] sm:text-[11.5px] mt-2" style={{ color:"rgba(255,255,255,.3)" }}>
                        Sign in → /home → MCP tab → Create API key
                      </p>
                    </div>

                  </div>
                </Card3D>
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* ── RIGHT PANEL ── */}
        <AnimatePresence mode="wait">
          {(!isMobile || mobileSection === "recent") && (
            <motion.aside key="panel"
              initial={isMobile?{opacity:0,x:20}:{}}
              animate={isMobile?{opacity:1,x:0}:{}}
              exit={isMobile?{opacity:0,x:20}:{}}
              transition={{ duration:.3 }}
              className="flex-shrink-0 flex flex-col gap-4"
              style={{
                width:isMobile?"100%":270,
                padding:isMobile?"16px":"20px 16px",
                background:"rgba(8,8,20,.88)",
                borderLeft:isMobile?"none":"1px solid rgba(255,255,255,.06)",
                borderTop:isMobile?"1px solid rgba(255,255,255,.06)":"none",
                paddingBottom:isMobile?80:20,
              }}>

              {/* Recent */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[13px] font-extrabold text-white">Recent</span>
                  <motion.button whileHover={{ x:2 }}
                    className="flex items-center gap-1 text-[11px] font-semibold"
                    style={{ color:"rgba(99,102,241,.85)" }}>
                    View all <ArrowRight className="w-3 h-3" strokeWidth={2.5}/>
                  </motion.button>
                </div>
                <div className="flex flex-col gap-2">
                  {RECENT.map((item, i) => (
                    <motion.div key={i}
                      initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }}
                      transition={{ delay:.12+i*.09, duration:.5, ease:[.22,1,.36,1] }}
                      whileHover={{ x:2, scale:1.01 }}
                      className="p-3 rounded-xl cursor-pointer"
                      style={{ background:"rgba(255,255,255,.035)", border:"1px solid rgba(255,255,255,.07)" }}
                      onMouseEnter={e=>(e.currentTarget.style.borderColor="rgba(99,102,241,.35)")}
                      onMouseLeave={e=>(e.currentTarget.style.borderColor="rgba(255,255,255,.07)")}>
                      <div className="text-[13px] font-bold text-white leading-tight mb-1.5">{item.title}</div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px]" style={{ color:"rgba(255,255,255,.4)" }}>
                          {item.time} · {item.words}
                        </span>
                        <AeoBadge value={item.aeo} color={item.color}/>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* MCP card */}
              <Card3D disabled={isMobile} intensity={4}>
                <div className="p-4 rounded-xl"
                  style={{ background:"rgba(15,20,50,.6)", border:"1px solid rgba(99,102,241,.22)",
                    boxShadow:"0 0 24px rgba(99,102,241,.12),inset 0 1px 0 rgba(255,255,255,.05)" }}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-2 h-2 rounded-full" style={{ background:"#22c55e",
                      boxShadow:"0 0 6px rgba(34,197,94,.7)", animation:"nb-status 2s ease-in-out infinite" }}/>
                    <span className="text-[13px] font-extrabold text-white">MCP server live</span>
                  </div>
                  <p className="text-[11.5px] mb-3 leading-relaxed" style={{ color:"rgba(255,255,255,.5)" }}>
                    Use Neo Script from Claude, Cursor or any MCP client.
                  </p>
                  <div className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg"
                    style={{ background:"rgba(255,255,255,.05)", border:"1px solid rgba(255,255,255,.09)" }}>
                    <code className="text-[11px] text-violet-300 truncate">{MCP_URL}</code>
                    <motion.button whileTap={{ scale:.88 }}
                      onClick={() => { navigator.clipboard.writeText(MCP_URL); setCopied(true); setTimeout(()=>setCopied(false),1500); }}
                      className="flex-shrink-0 w-6 h-6 rounded flex items-center justify-center"
                      style={{ background:"rgba(99,102,241,.25)", border:"1px solid rgba(99,102,241,.4)" }}>
                      <AnimatePresence mode="wait">
                        {copied
                          ? <motion.span key="ok" initial={{ scale:.5 }} animate={{ scale:1 }}>
                              <Check className="w-3 h-3 text-green-400" strokeWidth={3}/>
                            </motion.span>
                          : <motion.span key="cp">
                              <Copy className="w-3 h-3 text-violet-300" strokeWidth={2}/>
                            </motion.span>}
                      </AnimatePresence>
                    </motion.button>
                  </div>
                </div>
              </Card3D>

              {/* Agents */}
              <Card3D disabled={isMobile} intensity={3}>
                <div className="p-4 rounded-xl"
                  style={{ background:"rgba(15,20,50,.6)", border:"1px solid rgba(99,102,241,.18)" }}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[12.5px] font-extrabold text-white">AI Agents Status</span>
                    <span className="text-[13px] font-extrabold" style={{ color:"#22d3ee" }}>10/10</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-1.5">
                    {["Topic Generator","Researcher","Planner","Writer","Optimizer","+ 5 more"].map((a,i) => (
                      <motion.div key={a} initial={{ opacity:0,x:8 }} animate={{ opacity:1,x:0 }}
                        transition={{ delay:.3+i*.07 }}
                        className="flex items-center gap-2 text-[11.5px]"
                        style={{ color:i===5?"rgba(34,211,238,.7)":"rgba(255,255,255,.6)" }}>
                        {i < 5 && <span className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                          style={{ background:"#22c55e", boxShadow:"0 0 4px rgba(34,197,94,.6)" }}/>}
                        {a}
                      </motion.div>
                    ))}
                  </div>
                </div>
              </Card3D>

            </motion.aside>
          )}
        </AnimatePresence>

      </div>

      {/* ── MOBILE BOTTOM NAV ── */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around px-2 py-2"
        style={{ background:"rgba(8,8,20,.96)", borderTop:"1px solid rgba(255,255,255,.08)",
          backdropFilter:"blur(20px)" }}>
        {NAV_ICONS.map(({ icon:Icon, active }, i) => (
          <motion.button key={i} whileTap={{ scale:.85 }}
            className="flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl cursor-pointer"
            style={{
              background:active?"linear-gradient(135deg,rgba(34,211,238,.15),rgba(99,102,241,.10))":"transparent",
              color:active?"#22d3ee":"rgba(255,255,255,.4)",
            }}>
            <Icon className="w-5 h-5" strokeWidth={2}/>
          </motion.button>
        ))}
      </nav>

    </div>
  );
};

export default NewBriefDashboard;