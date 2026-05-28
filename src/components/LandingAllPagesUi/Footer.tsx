import { motion, useInView } from "framer-motion";
import {
  CirclePlus,
  Play,
  Lock,
  Send,
  Globe,
  ChevronDown,
  Sparkles,
} from "lucide-react";
import { useRef } from "react";
import React from "react";

/* ============================================================
   Custom social SVG icons (lucide doesn't have all of these)
============================================================ */
/* ============================================================
   Footer link with icon
============================================================ */
interface FooterLinkProps {
  icon: React.ReactNode;
  label: string;
  href?: string;
  badge?: string;
}

const FooterLink: React.FC<FooterLinkProps> = ({
  icon,
  label,
  href = "#",
  badge,
}) => (
  <a
    href={href}
    onClick={(e) => {
      // Prevent navigation for placeholder # links
      if (href === "#") e.preventDefault();
    }}
    className="flex items-center gap-2.5 text-[14px] py-1 transition-colors group"
    style={{ color: "rgba(255,255,255,0.65)" }}
    onMouseEnter={(e) => (e.currentTarget.style.color = "#ffffff")}
    onMouseLeave={(e) =>
      (e.currentTarget.style.color = "rgba(255,255,255,0.65)")
    }
  >
    <span
      className="flex-shrink-0 transition-colors"
      style={{ color: "rgba(255,255,255,0.4)" }}
    >
      {icon}
    </span>
    <span className="font-medium">{label}</span>
    {badge && (
      <span
        className="text-[10px] font-bold px-2 py-0.5 rounded-md tracking-wide"
        style={{
          background:
            "linear-gradient(90deg, rgba(34,211,238,0.18), rgba(168,85,247,0.18))",
          border: "1px solid rgba(168,85,247,0.35)",
          color: "#c084fc",
        }}
      >
        {badge}
      </span>
    )}
  </a>
);

/* ============================================================
   Section heading (PRODUCT, RESOURCES, COMPANY, CONNECT)
============================================================ */
const SectionHeading: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <h3
    className="text-[12px] font-extrabold tracking-[0.18em] uppercase mb-5"
    style={{
      background: "linear-gradient(90deg, #22d3ee 0%, #60a5fa 100%)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      backgroundClip: "text",
    }}
  >
    {children}
  </h3>
);

/* ============================================================
   Main Footer
============================================================ */
const Footer = () => {
  const footerRef = useRef(null);
  const isInView = useInView(footerRef, {
    once: true,
    margin: "-80px",
    amount: 0.05,
  });

  return (
    <footer
      ref={footerRef}
      className="relative pt-16 lg:pt-20 pb-6 overflow-hidden"
      style={{ background: "#05050f" }}
    >
      <style>{`
        @keyframes ft-pulse { 0%,100%{opacity:0.25} 50%{opacity:1} }
        @keyframes ft-status-dot {
          0%,100% { box-shadow: 0 0 0 0 rgba(34,197,94,0.6); }
          50%     { box-shadow: 0 0 0 6px rgba(34,197,94,0); }
        }
      `}</style>

      {/* Background atmosphere (subtle, top edge glow) */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute"
          style={{
            top: "-20%",
            left: "20%",
            width: "60%",
            height: "60%",
            background:
              "radial-gradient(ellipse at center, rgba(59,130,246,0.10) 0%, rgba(139,92,246,0.06) 35%, transparent 65%)",
          }}
        />
      </div>

      {/* Top accent line */}
      <div
        className="absolute top-0 left-0 right-0 h-[1px]"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, rgba(34,211,238,0.4) 50%, transparent 100%)",
        }}
      />

      {/* Tiny particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 30 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              width: `${Math.random() * 1.2 + 0.5}px`,
              height: `${Math.random() * 1.2 + 0.5}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              opacity: Math.random() * 0.4 + 0.1,
              animation: `ft-pulse ${
                3 + Math.random() * 4
              }s ease-in-out infinite`,
              animationDelay: `${Math.random() * 5}s`,
            }}
          />
        ))}
      </div>

      <div className="container mx-auto px-6 lg:px-10 relative z-10">
        {/* ════════════ MAIN GRID ════════════ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8 max-w-[1400px] mx-auto"
        >
          {/* ─────── COL 1: Brand ─────── */}
          <div className="lg:col-span-5 sm:col-span-2 flex flex-col gap-5">
            {/* Logo + name */}
            <a href="/" className="flex items-center gap-3 w-fit">
              <div className="w-24 h-24 flex items-center justify-center flex-shrink-0">
                <img
                  src="/logo.png"
                  alt="Neo Scripting"
                  className="w-24 h-24 object-contain"
                  draggable={false}
                />
              </div>
              <h2
                className="text-[24px] tracking-tight leading-none font-syne-bold"
                style={{ fontWeight: 800 }}
              >
                <span className="text-white ">Neo</span>
                  <span
              style={{
                background:
                  "linear-gradient(90deg, #22d3ee 0%, #3b82f6 50%, #a855f7 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
             Scripting
            </span>
              </h2>
            </a>

            {/* Description */}
            <p
              className="text-[14px] leading-relaxed max-w-xs"
              style={{ color: "rgba(255,255,255,0.55)" }}
            >
              10 AI agents working together to research, write, optimize, and
              publish AI-optimized content across search engines and platforms.
            </p>

         
           
          </div>

          {/* ─────── COL 2: PRODUCT ─────── */}
          <div className="lg:col-span-3 flex flex-col">
            <SectionHeading>Product</SectionHeading>
            <div className="flex flex-col gap-1">
              <FooterLink
                icon={<CirclePlus className="w-4 h-4" strokeWidth={2} />}
                label="How It Works"
                href="#how-it-works"
              />
              <FooterLink
                icon={<Sparkles className="w-4 h-4" strokeWidth={2} />}
                label="Agents"
                href="#agents"
              />
              <FooterLink
                icon={<Play className="w-4 h-4" strokeWidth={2} />}
                label="Live Demo"
                href="#demo"
              />
              {/* <FooterLink
                icon={<DollarSign className="w-4 h-4" strokeWidth={2} />}
                label="Pricing"
                href="#pricing"
              /> */}
            </div>
          </div>

          

          {/* ─────── COL 4: CONNECT ─────── */}
          <div className="lg:col-span-4 sm:col-span-2 flex flex-col">
            <SectionHeading>Connect</SectionHeading>
            <p
              className="text-[14px] leading-relaxed mb-4"
              style={{ color: "rgba(255,255,255,0.55)" }}
            >
              Stay updated with the latest news and product updates.
            </p>

            {/* Email input */}
            <form
              onSubmit={(e) => e.preventDefault()}
              className="relative mb-5 max-w-sm"
            >
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full h-11 pl-4 pr-14 rounded-lg text-[14px] text-white outline-none transition-all"
                style={{
                  background: "rgba(15,15,30,0.6)",
                  border: "1px solid rgba(255,255,255,0.10)",
                }}
                onFocus={(e) =>
                  (e.currentTarget.style.borderColor =
                    "rgba(34,211,238,0.5)")
                }
                onBlur={(e) =>
                  (e.currentTarget.style.borderColor =
                    "rgba(255,255,255,0.10)")
                }
              />
              <button
                type="submit"
                aria-label="Subscribe"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 w-9 h-8 rounded-md flex items-center justify-center"
                style={{
                  background:
                    "linear-gradient(90deg, #3b82f6 0%, #a855f7 100%)",
                  boxShadow: "0 0 14px rgba(59,130,246,0.45)",
                }}
              >
                <Send className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
              </button>
            </form>

          </div>
        </motion.div>

        {/* ════════════ DIVIDER ════════════ */}
        <div
          className="my-8 lg:my-10 max-w-[1400px] mx-auto h-[1px]"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(96,165,250,0.18), transparent)",
          }}
        />

        {/* ════════════ BOTTOM BAR ════════════ */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 max-w-[1400px] mx-auto"
        >
          {/* Copyright */}
          <p
            className="text-[12.5px]"
            style={{ color: "rgba(255,255,255,0.5)" }}
          >
            © 2026 Neo Scripting. All rights reserved.
          </p>

          {/* Trust badges */}
          <div
            className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[12.5px]"
            style={{ color: "rgba(255,255,255,0.55)" }}
          >
            <div className="flex items-center gap-1.5">
              <Lock
                className="w-3.5 h-3.5"
                style={{ color: "rgba(255,255,255,0.55)" }}
                strokeWidth={2}
              />
              <span>Enterprise-grade security</span>
            </div>
          </div>

          {/* Language selector */}
          <button
            type="button"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full text-[13px] font-medium text-white transition-colors"
            style={{
              background: "rgba(15,15,30,0.6)",
              border: "1px solid rgba(255,255,255,0.12)",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.borderColor = "rgba(34,211,238,0.4)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)")
            }
          >
            <Globe
              className="w-4 h-4"
              style={{ color: "rgba(255,255,255,0.7)" }}
              strokeWidth={2}
            />
            English
            <ChevronDown
              className="w-3.5 h-3.5"
              style={{ color: "rgba(255,255,255,0.5)" }}
              strokeWidth={2}
            />
          </button>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;
