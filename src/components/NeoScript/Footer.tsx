import { useState } from "react";

const LOGO_SRC = "/logo.png";

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
        <div className="flex items-center justify-center gap-3">
          <span className="relative flex items-center justify-center w-16 h-16">
            <span
              aria-hidden="true"
              className="absolute inset-0 rounded-full bg-violet-500/20 blur-md"
            />
            {!logoFailed ? (
              <img
                src={LOGO_SRC}
                alt="Neo Script"
                onError={() => setLogoFailed(true)}
                className="img-bounce relative w-16 h-16 rounded-md object-contain"
                draggable={false}
              />
            ) : (
              <span className="relative">
                <SparkleIcon />
              </span>
            )}
          </span>

          <div className="flex items-center gap-2 text-[13px]">
            <span className="text-white/65 font-medium">Neo Scripting</span>
            <span className="text-white/15">·</span>
            <span className="text-white/40">© {year}</span>
          </div>
        </div>
      </footer>
    </>
  );
}
