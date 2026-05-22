const HeroImg = "/LoginImage.png";

import { motion } from "framer-motion";
import {
  Play, Sparkles, Bot, Zap, Shield, Globe,
  Search, PenLine, TrendingUp, CheckCircle2, Send,
  Brain, Users, Target, BarChart2, RefreshCw,
} from "lucide-react";
import { useEffect, useRef, useState, useMemo } from "react";
import gsap from "gsap";
import React from "react";

// ─────────────────────────────────────────────
// useTypewriter
// ─────────────────────────────────────────────
const useTypewriter = (text: string, speed = 50, holdMs = 3000, clearSpd = 15) => {
  const chars = useMemo(() => Array.from(text), [text]);
  const [len,   setLen  ] = useState(0);
  const [phase, setPhase] = useState<"typing"|"holding"|"clearing">("typing");
  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    if (phase === "typing") {
      if (len < chars.length) t = setTimeout(() => setLen(l => l + 1), speed);
      else                    t = setTimeout(() => setPhase("holding"), holdMs);
    } else if (phase === "holding") {
      t = setTimeout(() => setPhase("clearing"), 400);
    } else {
      if (len > 0) t = setTimeout(() => setLen(l => l - 1), clearSpd);
      else         setPhase("typing");
    }
    return () => clearTimeout(t);
  }, [len, phase, chars, speed, holdMs, clearSpd]);
  return { displayed: chars.slice(0, len).join(""), isTyping: phase !== "clearing" };
};

const Caret: React.FC = () => (
  <motion.span
    animate={{ opacity: [1, 0, 1] }}
    transition={{ duration: 0.75, repeat: Infinity, ease: "linear" }}
    className="inline-block w-[1.5px] h-[0.75em] bg-violet-300 ml-[1px] align-middle"
  />
);

// ─────────────────────────────────────────────
// Card data
// ─────────────────────────────────────────────
const LEFT_CARDS = [
  { icon: Search,        title: "Research",  subtitle: "Smart insights gathering",         color: "#60a5fa" },
  { icon: PenLine,       title: "Write",     subtitle: "AI-powered content creation",      color: "#a78bfa" },
  { icon: TrendingUp,    title: "Optimize",  subtitle: "Structure tuned for discovery",    color: "#34d399" },
  { icon: CheckCircle2,  title: "Validate",  subtitle: "Fact-check & quality ensure",      color: "#f9a8d4" },
  { icon: Send,          title: "Publish",   subtitle: "Auto-publish to web & social",     color: "#60a5fa" },
] as const;

const RIGHT_CARDS = [
  { icon: Brain,      title: "Understand",  subtitle: "NLP & intent analysis",             color: "#c084fc" },
  { icon: Users,      title: "Strategize",  subtitle: "Content strategy generation",       color: "#60a5fa" },
  { icon: Target,     title: "Personalize", subtitle: "Audience-tailored content",         color: "#f9a8d4" },
  { icon: BarChart2,  title: "Analyze",     subtitle: "Performance tracking",              color: "#34d399" },
  { icon: RefreshCw,  title: "Improve",     subtitle: "Continuous learning & improvement", color: "#a78bfa" },
] as const;

// ─────────────────────────────────────────────
// PipelineCard — purple highlighted border
// ─────────────────────────────────────────────
interface PipelineCardProps {
  icon: React.ElementType; title: string; subtitle: string; color: string;
  delay?: number; align?: "left" | "right"; floatDir?: 1 | -1;
}
const PipelineCard: React.FC<PipelineCardProps> = ({
  icon: Icon, title, subtitle, color, delay = 0, align = "left", floatDir = 1,
}) => {
  const { displayed, isTyping } = useTypewriter(subtitle, 50, 3000, 15);
  return (
    <motion.div
      initial={{ opacity: 0, x: align === "left" ? -20 : 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.6, ease: [0.22,1,0.36,1] }}
    >
      <motion.div
        animate={{ y: [0, -4 * floatDir, 0] }}
        transition={{ duration: 3.6 + delay * 0.4, repeat: Infinity, ease: "easeInOut" }}
        className="relative flex items-center gap-2 px-2.5 py-2 rounded-xl"
        style={{
          background:     "rgba(8, 4, 28, 0.92)",
          border:         "1.5px solid rgba(167,139,250,0.85)",   /* ← bright purple border */
          boxShadow:
            "0 0 12px rgba(167,139,250,0.45), " +                /* purple outer glow */
            "0 0 0 1px rgba(124,58,237,0.25), " +                /* soft ring */
            "0 6px 18px rgba(0,0,0,0.55), " +
            "inset 0 1px 0 rgba(255,255,255,0.07)",
          backdropFilter: "blur(12px)",
        }}
      >
        {/* Icon */}
        <div className="w-[24px] h-[24px] rounded-[6px] flex items-center justify-center flex-shrink-0"
          style={{
            background: `linear-gradient(135deg, ${color}35, ${color}14)`,
            border:     `1px solid ${color}60`,
            boxShadow:  `0 0 8px ${color}50`,
          }}>
          <Icon size={12} style={{ color }} strokeWidth={2.2} />
        </div>

        {/* Text */}
        <div className="min-w-0">
          <p className="text-[11px] font-bold text-white leading-none mb-[3px]">{title}</p>
          <p className="text-[9.5px] leading-none" style={{ color:"rgba(255,255,255,0.52)", minHeight:"11px" }}>
            {displayed}{isTyping && <Caret />}
          </p>
        </div>

        {/* Connector line */}
        {align === "left" && (
          <div className="absolute pointer-events-none"
            style={{ right:"-12px", top:"50%", transform:"translateY(-50%)",
              width:"12px", height:"1.5px",
              background:"linear-gradient(90deg, rgba(167,139,250,0.7), transparent)" }}/>
        )}
        {align === "right" && (
          <div className="absolute pointer-events-none"
            style={{ left:"-12px", top:"50%", transform:"translateY(-50%)",
              width:"12px", height:"1.5px",
              background:"linear-gradient(270deg, rgba(167,139,250,0.7), transparent)" }}/>
        )}
      </motion.div>
    </motion.div>
  );
};

// ─────────────────────────────────────────────
// StatCard
// ─────────────────────────────────────────────
interface StatCardProps { icon: React.ReactNode; value: string; label: string; }
const StatCard: React.FC<StatCardProps> = ({ icon, value, label }) => (
  <div className="rounded-2xl p-4"
    style={{ background:"rgba(15,15,30,0.5)", border:"1px solid rgba(96,165,250,0.15)", backdropFilter:"blur(10px)" }}>
    <div className="flex items-center gap-2.5 mb-1.5">
      <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ background:"rgba(59,130,246,0.10)" }}>{icon}</div>
      <span className="hero-font text-2xl text-white leading-none" style={{ fontWeight:900, letterSpacing:"-0.01em" }}>
        {value}
      </span>
    </div>
    <p className="body-font text-xs sm:text-[13px]" style={{ color:"rgba(255,255,255,0.5)" }}>{label}</p>
  </div>
);

// ─────────────────────────────────────────────
// Main HeroSection
// ─────────────────────────────────────────────
const HeroSection = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check(); window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    if (!heroRef.current) return;
    gsap.fromTo(heroRef.current,
      { scale:0.95, opacity:0 },
      { scale:1, opacity:1, duration:1.2, ease:"power3.out" });
  }, []);

  return (
    <section id="hero"
      className="relative min-h-screen flex items-center overflow-hidden body-font"
      style={{ background:"#05050f", paddingTop:isMobile?"100px":"120px", paddingBottom:isMobile?"60px":"80px" }}>

      {/* Atmosphere */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute" style={{ top:"5%", right:"-10%", width:"70%", height:"90%",
          background:"radial-gradient(ellipse at center,rgba(59,130,246,0.22) 0%,rgba(99,102,241,0.12) 30%,rgba(139,92,246,0.08) 50%,transparent 70%)",
          animation:"hero-glow 12s ease-in-out infinite" }}/>
        <div className="absolute" style={{ bottom:"-10%", right:"10%", width:"50%", height:"60%",
          background:"radial-gradient(ellipse at center,rgba(139,92,246,0.18) 0%,transparent 60%)" }}/>
        <div className="absolute" style={{ top:"20%", left:"-10%", width:"50%", height:"60%",
          background:"radial-gradient(ellipse at center,rgba(59,130,246,0.08) 0%,transparent 60%)" }}/>
      </div>

      {/* Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 70 }).map((_, i) => (
          <div key={i} className="absolute rounded-full bg-white" style={{
            width:`${Math.random()*1.5+0.5}px`, height:`${Math.random()*1.5+0.5}px`,
            left:`${Math.random()*100}%`, top:`${Math.random()*100}%`,
            opacity:Math.random()*0.5+0.1,
            animation:`hero-pulse ${3+Math.random()*4}s ease-in-out infinite`,
            animationDelay:`${Math.random()*5}s`,
          }}/>
        ))}
      </div>

      <div className="container mx-auto px-6 lg:px-10 relative z-10">
        {/*
          Grid: 38% left text | 62% right stage
          Gives image enough room to look like reference
        */}
        <div className="grid grid-cols-1 lg:[grid-template-columns:38%_62%] gap-10 lg:gap-8 items-center">

          {/* ════════ LEFT COLUMN ════════ */}
          <motion.div className="flex flex-col gap-7"
            initial={{ opacity:0, x:-50 }} animate={{ opacity:1, x:0 }} transition={{ duration:0.8, ease:"easeOut" }}>

            <motion.div initial={{ opacity:0, y:24 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.25 }}>
              <h1 className="hero-font leading-[1.05] tracking-tight"
                style={{ fontSize:"clamp(2.6rem,5.5vw,3.50rem)", fontWeight:600, letterSpacing:"-0.02em" }}>
                <span className="block text-white font-syne-bold">The content scripting layer</span>
                <span className="block text-white font-syne-bold">
                  for the{" "}
                  <span style={{ background:"linear-gradient(90deg,#22d3ee 0%,#3b82f6 100%)",
                    WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text" }}>
                    modern web.
                  </span>
                </span>
                <span className="block text-white font-syne-bold">
                  Run it from{" "}
                  <span style={{ background:"linear-gradient(90deg,#a855f7 0%,#d946ef 100%)",
                    WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text" }}>
                    anywhere.
                  </span>
                </span>
              </h1>
            </motion.div>

            <motion.p className="body-font text-base sm:text-[17px] leading-relaxed max-w-xl"
              style={{ color:"rgba(255,255,255,0.6)" }}
              initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.35 }}>
              Neo Scripting is the content scripting layer for the modern web.
              A multi-agent pipeline that turns rough ideas into trusted,
              citation-backed content for your website and social channels —
              from your IDE, your terminal, or our app.
            </motion.p>

            <motion.div className="flex flex-col sm:flex-row gap-3"
              initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.45 }}>
              <motion.a href="/login"
                whileHover={{ scale:1.03, boxShadow:"0 0 50px rgba(59,130,246,0.55)" }} whileTap={{ scale:0.97 }}
                className="group relative inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-full font-semibold text-[15px] text-white overflow-hidden"
                style={{ background:"linear-gradient(90deg,#22d3ee 0%,#3b82f6 50%,#a855f7 100%)",
                  boxShadow:"0 0 30px rgba(59,130,246,0.4),0 0 20px rgba(34,211,238,0.25)" }}>
                <Sparkles className="w-4 h-4 relative z-10" fill="white" strokeWidth={0}/>
                <span className="relative z-10">Start Generating Now</span>
                <span className="pointer-events-none absolute top-0 bottom-0 w-1/3"
                  style={{ background:"linear-gradient(90deg,transparent,rgba(255,255,255,0.3),transparent)",
                    animation:"btn-shine 2.5s ease-in-out infinite" }}/>
              </motion.a>
              <motion.a href="#how-it-works"
                whileHover={{ scale:1.03 }} whileTap={{ scale:0.97 }}
                className="inline-flex items-center justify-center gap-3 px-7 py-4 rounded-full font-medium text-[15px] text-white"
                style={{ border:"1px solid rgba(255,255,255,0.12)", background:"rgba(15,15,30,0.5)", backdropFilter:"blur(10px)" }}>
                <span className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.12)" }}>
                  <Play className="w-3 h-3 text-white" fill="white" strokeWidth={0} style={{ marginLeft:"1px" }}/>
                </span>
                Explore the Pipeline
              </motion.a>
            </motion.div>

            <motion.div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mt-2"
              initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.55 }}>
              <StatCard icon={<Bot    className="w-5 h-5" style={{ color:"#60a5fa" }} strokeWidth={2}/>} value="10"   label="AI agents"/>
              <StatCard icon={<Zap    className="w-5 h-5" style={{ color:"#f0abfc" }} fill="#f0abfc" strokeWidth={1}/>} value="1" label="API call"/>
              <StatCard icon={<Shield className="w-5 h-5" style={{ color:"#60a5fa" }} strokeWidth={2}/>} value="100%" label="Citation-backed"/>
              <StatCard icon={<Globe  className="w-5 h-5" style={{ color:"#60a5fa" }} strokeWidth={2}/>} value="24/7" label="Autonomous"/>
            </motion.div>
          </motion.div>

          {/* ════════ RIGHT COLUMN — pipeline stage ════════ */}
          <div ref={heroRef} className="relative w-full">

            {/* ── DESKTOP: image centered (constrained) + cards overlaid from edges ── */}
            <div className="hidden lg:block relative">

              {/* Image — constrained to 62% of column, centered */}
              <div className="relative mx-auto" style={{ width: "62%" }}>
                <motion.div className="absolute pointer-events-none z-0"
                  style={{ inset:"-15%",
                    background:"radial-gradient(ellipse at center,rgba(59,130,246,0.32) 0%,rgba(139,92,246,0.18) 40%,transparent 65%)",
                    filter:"blur(50px)" }}
                  animate={{ scale:[1,1.08,1], opacity:[0.5,0.85,0.5] }}
                  transition={{ duration:4.5, repeat:Infinity }}/>

                <div className="absolute pointer-events-none z-[2]"
                  style={{ bottom:"0%", left:"50%", transform:"translateX(-50%)",
                    width:"80%", height:"55px",
                    background:"radial-gradient(ellipse at center,rgba(139,92,246,0.70) 0%,rgba(99,102,241,0.40) 40%,transparent 70%)",
                    filter:"blur(14px)" }}/>

                <motion.img
                  src={HeroImg}
                  alt="Neo Scripting Dashboard"
                  loading="eager" decoding="sync" draggable={false}
                  onContextMenu={(e) => e.preventDefault()}
                  initial={{ opacity:0, y:16 }}
                  animate={{ opacity:1, y:0, scale:[1, 1.05, 1] }}
                  transition={{
                    opacity: { duration:1.0, delay:0.3, ease:[0.22,1,0.36,1] },
                    y:       { duration:1.0, delay:0.3, ease:[0.22,1,0.36,1] },
                    scale:   { duration:3.2, repeat:Infinity, ease:"easeInOut", delay:1.3 },
                  }}
                  className="relative z-10 w-full h-auto select-none block"
                  style={{
                    filter:"drop-shadow(0 24px 60px rgba(59,130,246,0.38)) drop-shadow(0 0 28px rgba(139,92,246,0.32))",
                    pointerEvents:"none", userSelect:"none", WebkitUserDrag:"none",
                  } as React.CSSProperties}
                />
              </div>

              {/* LEFT cards — absolute from left edge, overlay image left side */}
              <div className="absolute z-30 flex flex-col gap-[7px]"
                style={{ top:"6%", left:"0%", width:"28%" }}>
                {LEFT_CARDS.map((c, i) => (
                  <PipelineCard key={c.title} icon={c.icon} title={c.title} subtitle={c.subtitle}
                    color={c.color} align="left" delay={0.3 + i * 0.1} floatDir={i % 2 === 0 ? 1 : -1}/>
                ))}
              </div>

              {/* RIGHT cards — absolute from right edge, overlay image right side */}
              <div className="absolute z-30 flex flex-col gap-[7px]"
                style={{ top:"6%", right:"0%", width:"28%" }}>
                {RIGHT_CARDS.map((c, i) => (
                  <PipelineCard key={c.title} icon={c.icon} title={c.title} subtitle={c.subtitle}
                    color={c.color} align="right" delay={0.35 + i * 0.1} floatDir={i % 2 === 0 ? -1 : 1}/>
                ))}
              </div>

            </div>

            {/* Mobile: image only */}
            <div className="lg:hidden relative">
              <motion.div className="absolute pointer-events-none"
                style={{ inset:"-10%",
                  background:"radial-gradient(ellipse at center,rgba(59,130,246,0.32) 0%,rgba(139,92,246,0.18) 40%,transparent 70%)",
                  filter:"blur(50px)" }}
                animate={{ scale:[1,1.08,1], opacity:[0.5,0.85,0.5] }}
                transition={{ duration:4, repeat:Infinity }}/>
              <img src={HeroImg} alt="Neo Scripting Dashboard" loading="eager" decoding="sync"
                draggable={false} onContextMenu={(e) => e.preventDefault()}
                className="img-bounce relative z-10 w-full h-auto select-none"
                style={{ filter:"drop-shadow(0 20px 60px rgba(59,130,246,0.3))",
                  pointerEvents:"none", userSelect:"none", WebkitUserDrag:"none" } as React.CSSProperties}/>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default HeroSection;