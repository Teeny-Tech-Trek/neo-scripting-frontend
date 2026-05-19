import { useState } from "react";

const LOGO_SRC = "/logo.png";
const SITE_URL = "https://neo-script-neon.vercel.app";
const SITE_LABEL = "neo-script-neon.vercel.app";
const TECH_STACK = ["Agno", "Gemini", "Qdrant"];

/* ─── Sparkle fallback (jab logo image load na ho) ─────────────────── */
function SparkleIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M12 2L13.5 8.5L20 10L13.5 11.5L12 18L10.5 11.5L4 10L10.5 8.5L12 2Z"
        fill="#7c3aed"
        stroke="#a78bfa"
        strokeWidth="0.5"
        strokeLinejoin="round"
      />
      <path
        d="M19 3L19.75 5.25L22 6L19.75 6.75L19 9L18.25 6.75L16 6L18.25 5.25L19 3Z"
        fill="#a78bfa"
        opacity="0.7"
      />
    </svg>
  );
}

export default function Footer() {
  const [logoFailed, setLogoFailed] = useState(false);
  const year = new Date().getFullYear();

  return (
    <>
      {/* Top gradient divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />

      <footer className="px-6 sm:px-10 lg:px-12 py-7">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-5">
          {/* ─── LEFT: brand + copyright + link ─── */}
          <div className="flex items-center gap-3">
            <span className="relative flex items-center justify-center w-6 h-6">
              <span
                aria-hidden="true"
                className="absolute inset-0 rounded-full bg-violet-500/20 blur-md"
              />
              {!logoFailed ? (
                <img
                  src={LOGO_SRC}
                  alt="Neo Script"
                  onError={() => setLogoFailed(true)}
                  className="img-bounce relative w-6 h-6 rounded-md object-contain"
                  draggable={false}
                />
              ) : (
                <span className="relative">
                  <SparkleIcon />
                </span>
              )}
            </span>

            <div className="flex items-center gap-2 text-[13px] flex-wrap justify-center sm:justify-start">
              <span className="text-white/65 font-medium">Neo Scripting</span>
              <span className="text-white/15">·</span>
              <span className="text-white/40">© {year}</span>
              <span className="text-white/15 hidden md:inline">·</span>
              <a
                href={SITE_URL}
                target="_blank"
                rel="noreferrer"
                className="hidden md:inline text-violet-400/65 hover:text-violet-300 transition-colors"
              >
                {SITE_LABEL}
              </a>
            </div>
          </div>

          {/* ─── RIGHT: tech stack ─── */}
          <div className="flex items-center gap-2 flex-wrap justify-center">
            <span className="text-[12px] text-white/30 mr-1">Built with</span>
            {TECH_STACK.map((tech) => (
              <span
                key={tech}
                className="text-[11px] font-medium px-2.5 py-1 rounded-md border border-white/[0.08] text-white/55 hover:border-violet-500/30 hover:text-violet-300 hover:bg-violet-500/[0.04] transition-all duration-200 cursor-default"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      </footer>
    </>
  );
}