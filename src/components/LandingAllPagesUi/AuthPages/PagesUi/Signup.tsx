const cubeImg = "/LoginImage.png";

import type { ChangeEvent, FormEvent } from "react";
import { Mail, Lock, Eye, EyeOff, ArrowRight, User, Loader2, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { SignupFormData } from "../PagesLogic/SignupLogic";

export type SignupProps = {
  formData: SignupFormData;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  showPassword: boolean;
  onTogglePassword: () => void;
  showConfirmPassword: boolean;
  onToggleConfirmPassword: () => void;
  isSubmitting: boolean;
  submitStatus: "idle" | "success" | "error";
  onSubmit: (e: FormEvent) => void;
  onNavigateToLogin: () => void;
  onGoogleSignIn?: () => void;
  errorMessage?: string;
};

const GoogleLogo = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24">
    <path fill="#EA4335" d="M12 5.04c1.84 0 3.51.65 4.81 1.93l3.57-3.57C18.32 1.51 15.43.32 12 .32 7.31.32 3.26 3.05 1.28 7.06l4.16 3.22C6.4 7.34 8.94 5.04 12 5.04z" />
    <path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.28 1.45-1.13 2.68-2.41 3.5l3.93 3.05c2.3-2.13 3.5-5.27 3.5-8.79z" />
    <path fill="#FBBC05" d="M5.44 14.28c-.27-.79-.41-1.62-.41-2.48s.14-1.69.4-2.48L1.28 6.1C.46 7.74 0 9.81 0 12s.46 4.26 1.28 5.9l4.16-3.22z" />
    <path fill="#34A853" d="M12 23.68c3.24 0 5.95-1.07 7.93-2.91l-3.93-3.05c-1.09.73-2.49 1.16-4 1.16-3.06 0-5.66-2.3-6.55-5.39L1.28 16.7c1.98 4.01 6.03 6.98 10.72 6.98z" />
  </svg>
);

const inputShellStyle = {
  background: "rgba(15,15,30,0.6)",
  border: "1px solid rgba(255,255,255,0.10)",
};

const Signup = ({
  formData,
  onChange,
  showPassword,
  onTogglePassword,
  showConfirmPassword,
  onToggleConfirmPassword,
  isSubmitting,
  submitStatus,
  onSubmit,
  onNavigateToLogin,
  onGoogleSignIn,
  errorMessage = "",
}: SignupProps) => {
  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col" style={{ background: "#05050f" }}>
      <style>{`
        @keyframes su-pulse { 0%,100%{opacity:0.25} 50%{opacity:1} }
        @keyframes su-glow {
          0%,100% { transform: translate(0,0) scale(1); }
          50% { transform: translate(20px,-15px) scale(1.05); }
        }
        @keyframes su-float {
          0%,100% { transform: translate(-50%,-50%) scale(1); }
          50% { transform: translate(-50%,calc(-50% - 8px)) scale(1.05); }
        }
      `}</style>

      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute"
          style={{
            top: "5%",
            right: "-10%",
            width: "60%",
            height: "80%",
            background:
              "radial-gradient(ellipse at center, rgba(59,130,246,0.18) 0%, rgba(99,102,241,0.10) 35%, transparent 65%)",
            animation: "su-glow 14s ease-in-out infinite",
          }}
        />
        <div
          className="absolute"
          style={{
            bottom: "-10%",
            left: "-5%",
            width: "55%",
            height: "60%",
            background: "radial-gradient(ellipse at center, rgba(139,92,246,0.18) 0%, transparent 60%)",
          }}
        />
      </div>

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 60 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              width: `${Math.random() * 1.5 + 0.5}px`,
              height: `${Math.random() * 1.5 + 0.5}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              opacity: Math.random() * 0.5 + 0.1,
              animation: `su-pulse ${3 + Math.random() * 4}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 5}s`,
            }}
          />
        ))}
      </div>

      <main className="flex-1 grid lg:grid-cols-2 lg:gap-10 items-start container mx-auto px-6 sm:px-10 lg:px-10 pt-24 lg:pt-28 pb-12 relative z-10">
        <div className="hidden lg:flex flex-col gap-7 max-w-xl">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-white"
            style={{
              fontSize: "clamp(2.5rem, 4.5vw, 3.75rem)",
              fontWeight: 900,
              lineHeight: 1.05,
            }}
          >
            <span className="block font-syne-bold">Start. Build. Launch.</span>
            <span className="block font-syne-bold">
              Together.{" "}
              <span
                style={{
                  background: "linear-gradient(90deg, #22d3ee 0%, #3b82f6 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Faster.
              </span>
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-[16px] leading-relaxed max-w-md"
            style={{ color: "rgba(255,255,255,0.55)" }}
          >
            Create your free account to deploy AI agents, manage projects, and grow your business all in one place.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="relative w-full h-[380px] mt-2"
          >
            <div
              className="absolute pointer-events-none"
              style={{
                top: "10%",
                left: "20%",
                right: "20%",
                bottom: "10%",
                background:
                  "radial-gradient(ellipse at center, rgba(168,85,247,0.35) 0%, rgba(59,130,246,0.18) 40%, transparent 70%)",
                filter: "blur(40px)",
              }}
            />
            <img
              src={cubeImg}
              alt="3D Cube"
              draggable={false}
              className="absolute left-1/2 top-1/2 w-[520px] h-[420px] object-contain select-none pointer-events-none"
              style={{
                filter: "drop-shadow(0 0 30px rgba(168,85,247,0.5))",
                animation: "su-float 6s ease-in-out infinite",
              }}
            />
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="w-full max-w-2xl mx-auto lg:ml-auto px-0 lg:px-4"
        >
          <div
            className="rounded-2xl p-[1.5px]"
            style={{
              background: "linear-gradient(135deg, rgba(34,211,238,0.55) 0%, rgba(168,85,247,0.55) 100%)",
              boxShadow: "0 30px 80px rgba(0,0,0,0.5), 0 0 40px rgba(168,85,247,0.15)",
            }}
          >
            <div
              className="rounded-2xl p-6 sm:p-8 lg:p-10"
              style={{
                background: "linear-gradient(135deg, rgba(8,12,28,0.92) 0%, rgba(12,18,40,0.92) 100%)",
                backdropFilter: "blur(16px)",
                WebkitBackdropFilter: "blur(16px)",
              }}
            >
              <div className="text-center mb-6">
                <h3
                  className="text-white inline-flex items-center gap-2 font-syne-bold"
                  style={{ fontSize: "clamp(1.5rem, 2.5vw, 1.85rem)", fontWeight: 800 }}
                >
                  Get Started
                </h3>
                <p className="text-[14px] mt-2" style={{ color: "rgba(255,255,255,0.55)" }}>
                  Create your account to start your free trial
                </p>
              </div>

              <form onSubmit={onSubmit} className="flex flex-col gap-4">
                <div className="grid sm:grid-cols-2 gap-3">
                  {[
                    { name: "firstName" as const, label: "First Name", placeholder: "John" },
                    { name: "lastName" as const, label: "Last Name", placeholder: "Doe" },
                  ].map((field) => (
                    <div key={field.name}>
                      <label htmlFor={field.name} className="text-[13px] font-semibold text-white block mb-2">
                        {field.label}
                      </label>
                      <div className="relative rounded-lg overflow-hidden" style={inputShellStyle}>
                        <User
                          className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4"
                          style={{ color: "rgba(255,255,255,0.4)" }}
                          strokeWidth={2}
                        />
                        <input
                          id={field.name}
                          name={field.name}
                          type="text"
                          required
                          value={formData[field.name] || ""}
                          onChange={onChange}
                          placeholder={field.placeholder}
                          className="w-full h-11 pl-10 pr-3 bg-transparent text-[14px] text-white outline-none"
                          autoComplete={field.name === "firstName" ? "given-name" : "family-name"}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div>
                  <label htmlFor="email" className="text-[13px] font-semibold text-white block mb-2">
                    Email Address
                  </label>
                  <div className="relative rounded-lg overflow-hidden" style={inputShellStyle}>
                    <Mail
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4"
                      style={{ color: "rgba(255,255,255,0.4)" }}
                      strokeWidth={2}
                    />
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={formData.email || ""}
                      onChange={onChange}
                      placeholder="you@example.com"
                      className="w-full h-11 pl-10 pr-4 bg-transparent text-[14px] text-white outline-none"
                      autoComplete="email"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="password" className="text-[13px] font-semibold text-white block mb-2">
                      Password
                    </label>
                    <div className="relative rounded-lg overflow-hidden" style={inputShellStyle}>
                      <Lock
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4"
                        style={{ color: "rgba(255,255,255,0.4)" }}
                        strokeWidth={2}
                      />
                      <input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        required
                        value={formData.password || ""}
                        onChange={onChange}
                        placeholder="Create a strong password"
                        className="w-full h-11 pl-10 pr-10 bg-transparent text-[14px] text-white outline-none"
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        onClick={onTogglePassword}
                        className="absolute right-3 top-1/2 -translate-y-1/2"
                        style={{ color: "rgba(255,255,255,0.4)" }}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" strokeWidth={2} /> : <Eye className="w-4 h-4" strokeWidth={2} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="confirmPassword" className="text-[13px] font-semibold text-white block mb-2">
                      Confirm Password
                    </label>
                    <div className="relative rounded-lg overflow-hidden" style={inputShellStyle}>
                      <Lock
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4"
                        style={{ color: "rgba(255,255,255,0.4)" }}
                        strokeWidth={2}
                      />
                      <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        required
                        value={formData.confirmPassword || ""}
                        onChange={onChange}
                        placeholder="Confirm your password"
                        className="w-full h-11 pl-10 pr-10 bg-transparent text-[14px] text-white outline-none"
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        onClick={onToggleConfirmPassword}
                        className="absolute right-3 top-1/2 -translate-y-1/2"
                        style={{ color: "rgba(255,255,255,0.4)" }}
                        aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" strokeWidth={2} /> : <Eye className="w-4 h-4" strokeWidth={2} />}
                      </button>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || submitStatus === "success"}
                  className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-lg font-bold text-[15px] text-white transition-transform hover:scale-[1.01] active:scale-[0.99] disabled:cursor-default mt-1"
                  style={{
                    background:
                      submitStatus === "success"
                        ? "linear-gradient(90deg, #059669 0%, #10b981 50%, #34d399 100%)"
                        : "linear-gradient(90deg, #3b82f6 0%, #6366f1 50%, #a855f7 100%)",
                    boxShadow:
                      submitStatus === "success"
                        ? "0 0 24px rgba(16,185,129,0.45)"
                        : "0 0 24px rgba(99,102,241,0.45)",
                    opacity: isSubmitting ? 0.85 : 1,
                  }}
                >
                  <AnimatePresence mode="wait" initial={false}>
                    {isSubmitting ? (
                      <motion.span
                        key="loading"
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="flex items-center gap-2"
                      >
                        <Loader2 className="w-4 h-4 animate-spin" strokeWidth={2.5} />
                        Creating account...
                      </motion.span>
                    ) : submitStatus === "success" ? (
                      <motion.span
                        key="success"
                        initial={{ opacity: 0, scale: 0.92 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center gap-2"
                      >
                        <CheckCircle2 className="w-4 h-4" strokeWidth={2.5} />
                        Account created!
                      </motion.span>
                    ) : (
                      <motion.span
                        key="idle"
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="flex items-center gap-2"
                      >
                        Create Account
                        <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
                      </motion.span>
                    )}
                  </AnimatePresence>
                </button>

                <AnimatePresence>
                  {submitStatus === "error" && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, height: 0 }}
                      animate={{ opacity: 1, y: 0, height: "auto" }}
                      exit={{ opacity: 0, y: -8, height: 0 }}
                      className="text-[13px] rounded-lg px-3 py-2.5"
                      style={{
                        background: "rgba(239,68,68,0.10)",
                        border: "1px solid rgba(239,68,68,0.30)",
                        color: "#fca5a5",
                      }}
                    >
                      {errorMessage || "Something went wrong. Please check your details and try again."}
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex items-center gap-3 my-1">
                  <div
                    className="flex-1 h-[1px]"
                    style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.15), rgba(255,255,255,0.15))" }}
                  />
                  <span className="text-[12px] font-medium tracking-[0.15em]" style={{ color: "rgba(255,255,255,0.4)" }}>
                    OR
                  </span>
                  <div
                    className="flex-1 h-[1px]"
                    style={{ background: "linear-gradient(90deg, rgba(255,255,255,0.15), rgba(255,255,255,0.15), transparent)" }}
                  />
                </div>

                <button
                  type="button"
                  onClick={onGoogleSignIn}
                  disabled={isSubmitting}
                  className="w-full inline-flex items-center justify-center gap-3 py-2.5 rounded-lg font-semibold text-[14px] text-white transition-colors disabled:opacity-70 disabled:cursor-default"
                  style={{
                    background: "rgba(15,15,30,0.6)",
                    border: "1px solid rgba(255,255,255,0.12)",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = "rgba(34,211,238,0.4)")}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)")}
                >
                  <GoogleLogo size={17} />
                  Continue with Google
                </button>

                <p className="text-center text-[13.5px] mt-2" style={{ color: "rgba(255,255,255,0.55)" }}>
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={onNavigateToLogin}
                    className="font-semibold"
                    style={{ color: "#22d3ee", background: "none", border: "none", cursor: "pointer" }}
                  >
                    Sign in
                  </button>
                </p>
              </form>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default Signup;
