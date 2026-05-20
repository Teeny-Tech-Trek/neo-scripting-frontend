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
const GithubIcon: React.FC<{ size?: number; color?: string }> = ({
  size = 18,
  color = "currentColor",
}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <path d="M12 0C5.374 0 0 5.373 0 12 0 17.302 3.438 21.8 8.207 23.387c.6.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
  </svg>
);

const TwitterIcon: React.FC<{ size?: number; color?: string }> = ({
  size = 18,
  color = "currentColor",
}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <path d="M23.643 4.937c-.835.37-1.732.62-2.675.733.962-.576 1.7-1.49 2.048-2.578-.9.534-1.897.922-2.958 1.13-.85-.904-2.06-1.47-3.4-1.47-2.572 0-4.658 2.086-4.658 4.66 0 .364.042.718.12 1.06-3.873-.195-7.304-2.05-9.602-4.868-.4.69-.63 1.49-.63 2.342 0 1.616.823 3.043 2.072 3.878-.764-.025-1.482-.234-2.11-.583v.06c0 2.257 1.605 4.14 3.737 4.568-.392.106-.803.162-1.227.162-.3 0-.593-.028-.877-.082.593 1.85 2.313 3.198 4.352 3.234-1.595 1.25-3.604 1.995-5.786 1.995-.376 0-.747-.022-1.112-.065 2.062 1.323 4.51 2.093 7.14 2.093 8.57 0 13.255-7.098 13.255-13.254 0-.2-.005-.402-.014-.602.91-.658 1.7-1.477 2.323-2.41z" />
  </svg>
);

const LinkedinIcon: React.FC<{ size?: number; color?: string }> = ({
  size = 18,
  color = "currentColor",
}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.36V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.72V1.72C24 .77 23.2 0 22.22 0z" />
  </svg>
);



/* ============================================================
   Twin silhouettes logo (matching navbar)
============================================================ */
const TwinSilhouettes = () => (
  <svg width="22" height="22" viewBox="0 0 32 32" fill="none">
    <defs>
      <linearGradient id="twin-grad-footer" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#22d3ee" />
        <stop offset="100%" stopColor="#60a5fa" />
      </linearGradient>
    </defs>
    <path
      d="M11.5 8.5 a2.5 2.5 0 0 1 0 5 a2.5 2.5 0 0 1 0 -5 Z M7 22 c0 -3 2 -5.5 4.5 -5.5 c1 0 1.8 .4 2.5 1 v8 H7 v-3.5 Z"
      fill="url(#twin-grad-footer)"
    />
    <path
      d="M20.5 8.5 a2.5 2.5 0 0 0 0 5 a2.5 2.5 0 0 0 0 -5 Z M25 22 c0 -3 -2 -5.5 -4.5 -5.5 c-1 0 -1.8 .4 -2.5 1 v8 H25 v-3.5 Z"
      fill="url(#twin-grad-footer)"
    />
  </svg>
);

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
   Social icon button
============================================================ */
interface SocialButtonProps {
  icon: React.ReactNode;
  href?: string;
  label: string;
}

const SocialButton: React.FC<SocialButtonProps> = ({
  icon,
  href = "#",
  label,
}) => (
  <a
    href={href}
    aria-label={label}
    className="w-10 h-10 rounded-lg flex items-center justify-center transition-all"
    style={{
      background: "rgba(15,15,30,0.6)",
      border: "1px solid rgba(255,255,255,0.10)",
      color: "rgba(255,255,255,0.7)",
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.borderColor = "rgba(34,211,238,0.4)";
      e.currentTarget.style.color = "#22d3ee";
      e.currentTarget.style.background = "rgba(34,211,238,0.08)";
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.borderColor = "rgba(255,255,255,0.10)";
      e.currentTarget.style.color = "rgba(255,255,255,0.7)";
      e.currentTarget.style.background = "rgba(15,15,30,0.6)";
    }}
  >
    {icon}
  </a>
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
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{
                  background:
                    "linear-gradient(135deg, #0a1f3d 0%, #102a4e 50%, #0a1f3d 100%)",
                  border: "1.5px solid rgba(34,211,238,0.4)",
                  boxShadow:
                    "0 0 18px rgba(34,211,238,0.35), inset 0 0 10px rgba(34,211,238,0.15)",
                }}
              >
                <TwinSilhouettes />
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

            {/* Social icons */}
            <div className="flex items-center gap-2.5">
              <SocialButton
                icon={<GithubIcon size={16} />}
                href="https://github.com"
                label="GitHub"
              />
              <SocialButton
                icon={<TwitterIcon size={15} />}
                href="https://twitter.com"
                label="Twitter"
              />
              <SocialButton
                icon={<LinkedinIcon size={15} />}
                href="https://linkedin.com"
                label="LinkedIn"
              />
              
            </div>
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
