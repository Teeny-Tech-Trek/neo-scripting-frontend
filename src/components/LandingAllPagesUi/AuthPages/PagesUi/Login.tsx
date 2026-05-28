const cubeImg = "/LoginImage.png";

import type { FormEvent } from "react";
import { Mail, Lock, Eye, EyeOff, ArrowRight, Check, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export type LoginProps = {
  email: string;
  onEmailChange: (value: string) => void;
  password: string;
  onPasswordChange: (value: string) => void;
  showPassword: boolean;
  onTogglePassword: () => void;
  rememberMe: boolean;
  onToggleRememberMe: () => void;
  onSubmit: (e: FormEvent) => void;
  isSubmitting?: boolean;
  errorMessage?: string;
  onGoogleSignIn?: () => void;
  onForgotPassword?: () => void;
};

/* ───────────────── Brand logos ───────────────── */
const GoogleLogo = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24">
    <path fill="#EA4335" d="M12 5.04c1.84 0 3.51.65 4.81 1.93l3.57-3.57C18.32 1.51 15.43.32 12 .32 7.31.32 3.26 3.05 1.28 7.06l4.16 3.22C6.4 7.34 8.94 5.04 12 5.04z"/>
    <path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.28 1.45-1.13 2.68-2.41 3.5l3.93 3.05c2.3-2.13 3.5-5.27 3.5-8.79z"/>
    <path fill="#FBBC05" d="M5.44 14.28c-.27-.79-.41-1.62-.41-2.48s.14-1.69.4-2.48L1.28 6.1C.46 7.74 0 9.81 0 12s.46 4.26 1.28 5.9l4.16-3.22z"/>
    <path fill="#34A853" d="M12 23.68c3.24 0 5.95-1.07 7.93-2.91l-3.93-3.05c-1.09.73-2.49 1.16-4 1.16-3.06 0-5.66-2.3-6.55-5.39L1.28 16.7c1.98 4.01 6.03 6.98 10.72 6.98z"/>
  </svg>
);

const Login = ({
  email,
  onEmailChange,
  password,
  onPasswordChange,
  showPassword,
  onTogglePassword,
  rememberMe,
  onToggleRememberMe,
  onSubmit,
  isSubmitting = false,
  errorMessage = "",
  onGoogleSignIn,
  onForgotPassword,
}: LoginProps) => {
  return (
    <div
      className="min-h-screen relative overflow-hidden flex items-center"
      style={{ background: "#05050f" }}
    >
      <style>{`
        @keyframes lg-pulse { 0%,100%{opacity:0.25} 50%{opacity:1} }
        @keyframes lg-glow {
          0%,100% { transform: translate(0,0) scale(1); }
          50% { transform: translate(20px,-15px) scale(1.05); }
        }
        @keyframes lg-float {
          0%,100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-10px) scale(1.05); }
        }
        @keyframes btn-shine {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
        @keyframes ring-spin {
          to { transform: translate(-50%,-50%) rotate(360deg); }
        }
        @keyframes dot-pulse {
          0%,100% { opacity:1; transform: scale(1); }
          50% { opacity:0.5; transform: scale(0.7); }
        }

        /* Browser autofill fix - inputs stay dark */
        input:-webkit-autofill,
        input:-webkit-autofill:hover,
        input:-webkit-autofill:focus,
        input:-webkit-autofill:active {
          -webkit-box-shadow: 0 0 0 30px rgba(15,15,30,0.95) inset !important;
          -webkit-text-fill-color: #fff !important;
          caret-color: #fff !important;
          transition: background-color 5000s ease-in-out 0s;
        }
      `}</style>

      {/* ═══════════ BACKGROUND ATMOSPHERE ═══════════ */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute" style={{
          top:"5%", right:"-10%", width:"60%", height:"80%",
          background:"radial-gradient(ellipse at center, rgba(168,85,247,0.18) 0%, rgba(124,58,237,0.10) 35%, transparent 65%)",
          animation:"lg-glow 14s ease-in-out infinite",
        }}/>
        <div className="absolute" style={{
          bottom:"-10%", left:"-5%", width:"55%", height:"60%",
          background:"radial-gradient(ellipse at center, rgba(139,92,246,0.18) 0%, transparent 60%)",
        }}/>
        <div className="absolute" style={{
          top:"30%", left:"30%", width:"40%", height:"40%",
          background:"radial-gradient(ellipse at center, rgba(59,130,246,0.10) 0%, transparent 65%)",
        }}/>
      </div>

      {/* ═══════════ PARTICLES ═══════════ */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 60 }).map((_, i) => (
          <div key={i} className="absolute rounded-full bg-white" style={{
            width: `${Math.random()*1.5+0.5}px`,
            height:`${Math.random()*1.5+0.5}px`,
            left:  `${Math.random()*100}%`,
            top:   `${Math.random()*100}%`,
            opacity: Math.random()*0.5+0.1,
            animation:`lg-pulse ${3+Math.random()*4}s ease-in-out infinite`,
            animationDelay:`${Math.random()*5}s`,
          }}/>
        ))}
      </div>

      {/* ═══════════ MAIN CONTENT ═══════════ */}
      <main className="flex-1 grid lg:grid-cols-2 gap-10 lg:gap-16 items-center container mx-auto px-6 lg:px-10 py-12 relative z-10">

        {/* ═══════ LEFT: Marketing + 3D illustration ═══════ */}
        <div className="hidden lg:flex flex-col gap-6 max-w-xl mt-20 ml-10">

          {/* Small label with dot */}
          <motion.div
            initial={{ opacity:0, x:-20 }}
            animate={{ opacity:1, x:0 }}
            transition={{ duration:0.6, delay:0.1 }}
            className="flex items-center gap-2"
          >
            <span
              className="inline-block w-2 h-2 rounded-full"
              style={{
                background:"#a78bfa",
                boxShadow:"0 0 10px #a78bfa, 0 0 18px rgba(167,139,250,0.5)",
                animation:"dot-pulse 2s ease-in-out infinite",
              }}
            />
            <p className="hero-font text-xs font-bold tracking-[0.18em] uppercase"
              style={{ color:"#a78bfa" }}>
              Welcome Back
            </p>
          </motion.div>

          {/* Heading */}
          <motion.h2
            initial={{ opacity:0, y:20 }}
            animate={{ opacity:1, y:0 }}
            transition={{ duration:0.6, delay:0.2 }}
            className="hero-font text-white"
            style={{
              fontSize:"clamp(2.25rem, 4.2vw, 3.5rem)",
              fontWeight:800,
              letterSpacing:"-0.02em",
              lineHeight:1.05,
            }}
          >
            <span className="block font-syne-bold">Sign in to your</span>
            <span className="block font-syne-bold">
              Neo{" "}
              <span style={{
                background:"linear-gradient(90deg, #22d3ee 0%, #3b82f6 100%)",
                WebkitBackgroundClip:"text",
                WebkitTextFillColor:"transparent",
                backgroundClip:"text",
              }}>
                Scripting
              </span>
            </span>
          </motion.h2>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity:0, y:16 }}
            animate={{ opacity:1, y:0 }}
            transition={{ duration:0.5, delay:0.3 }}
            className="body-font text-[15px] leading-relaxed max-w-md"
            style={{ color:"rgba(255,255,255,0.55)" }}
          >
            Access your dashboard, manage scripts,<br/>
            and grow your digital presence.
          </motion.p>

          {/* 3D illustration container */}
          <motion.div
            initial={{ opacity:0, scale:0.95 }}
            animate={{ opacity:1, scale:1 }}
            transition={{ duration:0.7, delay:0.4 }}
            className="relative w-full h-[420px] mt-2 flex items-center justify-center"
          >
            {/* Glow rings behind illustration */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div style={{
                position:"absolute", width:"72%", aspectRatio:"1",
                top:"55%", left:"50%",
                transform:"translate(-50%,-50%)",
                borderRadius:"50%",
                border:"1px solid rgba(168,85,247,0.18)",
                animation:"ring-spin 28s linear infinite",
              }}>
                <div style={{
                  position:"absolute", top:0, left:"50%",
                  transform:"translate(-50%,-50%)",
                  width:"8px", height:"8px", borderRadius:"50%",
                  background:"#a855f7",
                  boxShadow:"0 0 10px #a855f7, 0 0 22px #a855f7",
                }}/>
              </div>
              <div style={{
                position:"absolute", width:"50%", aspectRatio:"1",
                top:"55%", left:"50%",
                transform:"translate(-50%,-50%)",
                borderRadius:"50%",
                border:"1px dashed rgba(124,58,237,0.20)",
                animation:"ring-spin 18s linear infinite reverse",
              }}/>
            </div>

            {/* Center glow */}
            <div
              className="absolute pointer-events-none"
              style={{
                top:"50%", left:"50%",
                transform:"translate(-50%,-50%)",
                width:"60%", aspectRatio:"1",
                background:"radial-gradient(ellipse at center, rgba(168,85,247,0.40) 0%, rgba(59,130,246,0.18) 40%, transparent 70%)",
                filter:"blur(40px)",
              }}
            />

            {/* Actual image - your /LoginImage.png loads here */}
            <img
              src={cubeImg}
              alt="Neo Scripting 3D illustration"
              draggable={false}
              className="relative z-10 w-full max-w-[460px] h-auto object-contain select-none pointer-events-none"
              style={{
                maxHeight:"440px",
                filter:"drop-shadow(0 0 35px rgba(168,85,247,0.55)) drop-shadow(0 0 15px rgba(59,130,246,0.30))",
                animation:"lg-float 6s ease-in-out infinite",
              }}
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = "none";
                const fb = document.getElementById("img-fallback");
                if (fb) fb.style.display = "flex";
              }}
            />

            {/* SVG fallback (random placeholder - code editor on podium vibe) */}
            <div
              id="img-fallback"
              className="relative z-10 hidden items-center justify-center"
              style={{ width:"400px", height:"360px" }}
            >
              <svg viewBox="0 0 400 360" width="400" height="360" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="window-grad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#1e1b4b" stopOpacity="0.95"/>
                    <stop offset="100%" stopColor="#312e81" stopOpacity="0.85"/>
                  </linearGradient>
                  <linearGradient id="podium-grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.5"/>
                    <stop offset="100%" stopColor="#1e1b4b" stopOpacity="0.2"/>
                  </linearGradient>
                  <filter id="glow-f">
                    <feGaussianBlur stdDeviation="4"/>
                  </filter>
                </defs>

                {/* Podium rings */}
                <ellipse cx="200" cy="310" rx="140" ry="22" fill="url(#podium-grad)" opacity="0.7"/>
                <ellipse cx="200" cy="300" rx="115" ry="18" fill="rgba(124,58,237,0.45)"/>
                <ellipse cx="200" cy="290" rx="90"  ry="14" fill="rgba(168,85,247,0.55)"/>
                <ellipse cx="200" cy="280" rx="60"  ry="9"  fill="rgba(196,181,253,0.6)" filter="url(#glow-f)"/>

                {/* Floating cubes */}
                <rect x="60"  y="240" width="40" height="40" fill="rgba(124,58,237,0.45)" rx="4" transform="rotate(15 80 260)"/>
                <rect x="300" y="240" width="40" height="40" fill="rgba(124,58,237,0.45)" rx="4" transform="rotate(-15 320 260)"/>

                {/* Code window */}
                <rect x="80" y="60" width="240" height="180" fill="url(#window-grad)" rx="10" stroke="rgba(168,85,247,0.55)" strokeWidth="1.5" filter="url(#glow-f)"/>
                <rect x="80" y="60" width="240" height="180" fill="url(#window-grad)" rx="10" stroke="rgba(196,181,253,0.4)" strokeWidth="1"/>

                {/* Window dots */}
                <circle cx="98"  cy="78" r="4" fill="#ef4444"/>
                <circle cx="113" cy="78" r="4" fill="#eab308"/>
                <circle cx="128" cy="78" r="4" fill="#22c55e"/>

                {/* Code lines */}
                <rect x="100" y="105" width="60"  height="6" fill="#f472b6" rx="2"/>
                <rect x="165" y="105" width="100" height="6" fill="#60a5fa" rx="2"/>
                <rect x="110" y="125" width="40"  height="6" fill="#a78bfa" rx="2"/>
                <rect x="155" y="125" width="80"  height="6" fill="#fbbf24" rx="2"/>
                <rect x="100" y="145" width="120" height="6" fill="#34d399" rx="2"/>
                <rect x="110" y="165" width="50"  height="6" fill="#f472b6" rx="2"/>
                <rect x="165" y="165" width="70"  height="6" fill="#60a5fa" rx="2"/>
                <rect x="100" y="185" width="90"  height="6" fill="#a78bfa" rx="2"/>
                <rect x="100" y="205" width="40"  height="6" fill="#34d399" rx="2"/>

                {/* Center glow on podium */}
                <ellipse cx="200" cy="280" rx="40" ry="6" fill="rgba(196,181,253,0.85)" filter="url(#glow-f)"/>
              </svg>
            </div>
          </motion.div>
        </div>

        {/* ═══════ RIGHT: Login form ═══════ */}
        <motion.div
          initial={{ opacity:0, x:30 }}
          animate={{ opacity:1, x:0 }}
          transition={{ duration:0.6, delay:0.2 }}
          className="w-full max-w-md mx-auto lg:ml-auto"
        >
          {/* Gradient border wrapper */}
          <div
            className="rounded-2xl p-[1.5px]"
            style={{
              background:"linear-gradient(135deg, rgba(34,211,238,0.55) 0%, rgba(168,85,247,0.55) 100%)",
              boxShadow:"0 30px 80px rgba(0,0,0,0.5), 0 0 40px rgba(168,85,247,0.15)",
            }}
          >
            <div
              className="rounded-2xl p-7 lg:p-8 relative"
              style={{
                background:"linear-gradient(135deg, rgba(8,12,28,0.95) 0%, rgba(12,18,40,0.95) 100%)",
                backdropFilter:"blur(16px)",
                WebkitBackdropFilter:"blur(16px)",
              }}
            >
              {/* Top inner highlight */}
              <div
                className="absolute top-0 left-8 right-8 h-[1px] pointer-events-none"
                style={{ background:"linear-gradient(90deg, transparent, rgba(196,181,253,0.5), transparent)" }}
              />

              {/* Lock icon at top */}
              <motion.div
                initial={{ opacity:0, scale:0.8, y:-10 }}
                animate={{ opacity:1, scale:1, y:0 }}
                transition={{ delay:0.3, duration:0.5 }}
                className="flex justify-center mb-4"
              >
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center"
                  style={{
                    background:"linear-gradient(135deg, rgba(30,20,55,0.9), rgba(50,30,90,0.9))",
                    border:"1.5px solid rgba(168,85,247,0.55)",
                    boxShadow:"0 0 24px rgba(139,92,246,0.45), inset 0 0 12px rgba(168,85,247,0.20)",
                  }}
                >
                  <Lock className="w-6 h-6 text-violet-300" strokeWidth={2.2}/>
                </div>
              </motion.div>

              {/* Title */}
              <div className="text-center mb-6">
                <motion.h3
                  initial={{ opacity:0, y:10 }}
                  animate={{ opacity:1, y:0 }}
                  transition={{ delay:0.35, duration:0.5 }}
                  className="hero-font text-white"
                  style={{
                    fontSize:"clamp(1.5rem, 2.5vw, 1.85rem)",
                    fontWeight:800,
                    letterSpacing:"-0.01em",
                  }}
                >
                  Welcome Back
                </motion.h3>
                <motion.p
                  initial={{ opacity:0, y:8 }}
                  animate={{ opacity:1, y:0 }}
                  transition={{ delay:0.4, duration:0.5 }}
                  className="body-font text-[13.5px] mt-2"
                  style={{ color:"rgba(255,255,255,0.55)" }}
                >
                  Please enter your details to sign in to your account
                </motion.p>
              </div>

              <form onSubmit={onSubmit} className="flex flex-col gap-4">

                {/* Email field */}
                <motion.div
                  initial={{ opacity:0, y:10 }}
                  animate={{ opacity:1, y:0 }}
                  transition={{ delay:0.45, duration:0.5 }}
                >
                  <label htmlFor="email" className="body-font text-[13px] font-semibold text-white block mb-1.5">
                    Email Address
                  </label>
                  <div
                    className="relative rounded-lg overflow-hidden transition-all"
                    style={{
                      background:"rgba(15,15,30,0.6)",
                      border:"1px solid rgba(255,255,255,0.10)",
                    }}
                  >
                    <Mail
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4"
                      style={{ color:"rgba(255,255,255,0.4)" }}
                      strokeWidth={2}
                    />
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => onEmailChange(e.target.value)}
                      placeholder="Enter your email address"
                      autoComplete="email"
                      className="body-font w-full h-11 pl-10 pr-4 bg-transparent text-[14px] text-white placeholder:text-white/35 outline-none"
                      onFocus={(e) => (e.currentTarget.parentElement!.style.borderColor = "rgba(34,211,238,0.5)")}
                      onBlur={(e)  => (e.currentTarget.parentElement!.style.borderColor = "rgba(255,255,255,0.10)")}
                    />
                  </div>
                </motion.div>

                {/* Password field */}
                <motion.div
                  initial={{ opacity:0, y:10 }}
                  animate={{ opacity:1, y:0 }}
                  transition={{ delay:0.5, duration:0.5 }}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <label htmlFor="password" className="body-font text-[13px] font-semibold text-white">
                      Password
                    </label>
                    <a
                      href="/forgot-password"
                      onClick={(e) => {
                        if (onForgotPassword) {
                          e.preventDefault();
                          onForgotPassword();
                        }
                      }}
                      className="body-font text-[12.5px] font-medium transition-colors hover:underline"
                      style={{ color:"#a78bfa" }}
                    >
                      Forgot Password?
                    </a>
                  </div>
                  <div
                    className="relative rounded-lg overflow-hidden transition-all"
                    style={{
                      background:"rgba(15,15,30,0.6)",
                      border:"1px solid rgba(255,255,255,0.10)",
                    }}
                  >
                    <Lock
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4"
                      style={{ color:"rgba(255,255,255,0.4)" }}
                      strokeWidth={2}
                    />
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => onPasswordChange(e.target.value)}
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      className="body-font w-full h-11 pl-10 pr-10 bg-transparent text-[14px] text-white placeholder:text-white/35 outline-none"
                      onFocus={(e) => (e.currentTarget.parentElement!.style.borderColor = "rgba(34,211,238,0.5)")}
                      onBlur={(e)  => (e.currentTarget.parentElement!.style.borderColor = "rgba(255,255,255,0.10)")}
                    />
                    <button
                      type="button"
                      onClick={onTogglePassword}
                      className="absolute right-3 top-1/2 -translate-y-1/2 hover:text-white/80 transition-colors"
                      style={{ color:"rgba(255,255,255,0.5)" }}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword
                        ? <EyeOff className="w-4 h-4" strokeWidth={2}/>
                        : <Eye    className="w-4 h-4" strokeWidth={2}/>}
                    </button>
                  </div>
                </motion.div>

                {/* Remember me row */}
                <motion.div
                  initial={{ opacity:0, y:8 }}
                  animate={{ opacity:1, y:0 }}
                  transition={{ delay:0.55, duration:0.5 }}
                  className="flex items-center justify-between"
                >
                  <label className="flex items-center gap-2.5 cursor-pointer select-none">
                    <button
                      type="button"
                      onClick={onToggleRememberMe}
                      className="w-[18px] h-[18px] rounded flex items-center justify-center transition-all flex-shrink-0"
                      style={{
                        background: rememberMe
                          ? "linear-gradient(135deg, #a855f7, #7c3aed)"
                          : "rgba(15,15,30,0.6)",
                        border: rememberMe
                          ? "1px solid rgba(168,85,247,0.6)"
                          : "1px solid rgba(255,255,255,0.15)",
                        boxShadow: rememberMe ? "0 0 8px rgba(168,85,247,0.4)" : "none",
                      }}
                      aria-checked={rememberMe}
                      role="checkbox"
                    >
                      {rememberMe && <Check className="w-3 h-3 text-white" strokeWidth={3.5}/>}
                    </button>
                    <span className="body-font text-[13px] font-medium" style={{ color:"rgba(255,255,255,0.85)" }}>
                      Remember me
                    </span>
                  </label>
                  <span className="body-font text-[12px]" style={{ color:"rgba(255,255,255,0.45)" }}>
                    Keep me signed in
                  </span>
                </motion.div>

                {/* Sign In button */}
                <motion.button
                  initial={{ opacity:0, y:10 }}
                  animate={{ opacity:1, y:0 }}
                  transition={{ delay:0.6, duration:0.5 }}
                  whileHover={isSubmitting ? undefined : { scale:1.01, boxShadow:"0 0 36px rgba(99,102,241,0.6)" }}
                  whileTap={isSubmitting ? undefined : { scale:0.99 }}
                  type="submit"
                  disabled={isSubmitting}
                  className="body-font relative w-full h-11 rounded-lg overflow-hidden text-white font-bold text-[14px] mt-1 disabled:opacity-80 disabled:cursor-default"
                  style={{
                    background:"linear-gradient(90deg, #3b82f6 0%, #6366f1 50%, #a855f7 100%)",
                    boxShadow:"0 6px 24px rgba(99,102,241,0.45)",
                  }}
                >
                  <span className="relative z-10 inline-flex items-center justify-center gap-2 w-full h-full">
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" strokeWidth={2.5}/>
                        Signing in...
                      </>
                    ) : (
                      <>
                        Sign In
                        <ArrowRight className="w-4 h-4" strokeWidth={2.5}/>
                      </>
                    )}
                  </span>
                  {!isSubmitting && (
                    <span
                      className="pointer-events-none absolute top-0 bottom-0 w-1/3"
                      style={{
                        background:"linear-gradient(90deg, transparent, rgba(255,255,255,0.28), transparent)",
                        animation:"btn-shine 2.5s ease-in-out infinite",
                      }}
                    />
                  )}
                </motion.button>

                {/* Inline error banner */}
                <AnimatePresence>
                  {errorMessage && (
                    <motion.div
                      initial={{ opacity:0, y:-6, height:0 }}
                      animate={{ opacity:1, y:0, height:"auto" }}
                      exit={{ opacity:0, y:-6, height:0 }}
                      className="body-font text-[13px] rounded-lg px-3 py-2.5"
                      style={{
                        background:"rgba(239,68,68,0.10)",
                        border:"1px solid rgba(239,68,68,0.30)",
                        color:"#fca5a5",
                      }}
                    >
                      {errorMessage}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* OR divider */}
                <motion.div
                  initial={{ opacity:0 }}
                  animate={{ opacity:1 }}
                  transition={{ delay:0.65, duration:0.4 }}
                  className="flex items-center gap-3 my-1"
                >
                  <div className="flex-1 h-[1px]" style={{ background:"rgba(255,255,255,0.12)" }}/>
                  <span className="body-font text-[12px] font-medium tracking-[0.15em]" style={{ color:"rgba(255,255,255,0.4)" }}>
                    OR
                  </span>
                  <div className="flex-1 h-[1px]" style={{ background:"rgba(255,255,255,0.12)" }}/>
                </motion.div>

                {/* Social buttons - Google + Apple stacked */}
                <motion.div
                  initial={{ opacity:0, y:8 }}
                  animate={{ opacity:1, y:0 }}
                  transition={{ delay:0.7, duration:0.5 }}
                  className="flex flex-col gap-2.5"
                >
                  <button
                    type="button"
                    onClick={onGoogleSignIn}
                    disabled={isSubmitting}
                    className="body-font w-full inline-flex items-center justify-center gap-2.5 h-11 rounded-lg font-semibold text-[13.5px] text-white transition-all disabled:opacity-70 disabled:cursor-default"
                    style={{
                      background:"rgba(15,15,30,0.6)",
                      border:"1px solid rgba(255,255,255,0.12)",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.borderColor="rgba(34,211,238,0.45)")}
                    onMouseLeave={(e) => (e.currentTarget.style.borderColor="rgba(255,255,255,0.12)")}
                  >
                    <GoogleLogo size={17}/>
                    Continue with Google
                  </button>

                  
                </motion.div>

                {/* Sign up link */}
                <motion.p
                  initial={{ opacity:0 }}
                  animate={{ opacity:1 }}
                  transition={{ delay:0.78, duration:0.4 }}
                  className="body-font text-center text-[13px] mt-1"
                  style={{ color:"rgba(255,255,255,0.55)" }}
                >
                  Don't have an account?{" "}
                  <a
                    href="/get-started"
                    className="font-semibold transition-colors hover:underline"
                    style={{ color:"#a78bfa" }}
                  >
                    Sign up
                  </a>
                </motion.p>
              </form>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default Login;