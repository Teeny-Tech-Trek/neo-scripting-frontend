import type { FormEvent } from "react";
import { Mail, ArrowRight, Loader2, CheckCircle2, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export type ForgotPasswordProps = {
  email: string;
  onEmailChange: (value: string) => void;
  onSubmit: (e: FormEvent) => void;
  isSubmitting: boolean;
  status: "idle" | "success" | "error";
  message: string;
  onNavigateToLogin: () => void;
};

const ForgotPassword = ({
  email,
  onEmailChange,
  onSubmit,
  isSubmitting,
  status,
  message,
  onNavigateToLogin,
}: ForgotPasswordProps) => {
  return (
    <div
      className="min-h-screen relative overflow-hidden flex items-center"
      style={{ background: "#05050f" }}
    >
      <style>{`
        @keyframes fp-pulse { 0%,100%{opacity:0.25} 50%{opacity:1} }
        @keyframes fp-glow {
          0%,100% { transform: translate(0,0) scale(1); }
          50% { transform: translate(20px,-15px) scale(1.05); }
        }
        @keyframes btn-shine {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
        input:-webkit-autofill,
        input:-webkit-autofill:hover,
        input:-webkit-autofill:focus {
          -webkit-box-shadow: 0 0 0 30px rgba(15,15,30,0.95) inset !important;
          -webkit-text-fill-color: #fff !important;
          caret-color: #fff !important;
        }
      `}</style>

      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute" style={{
          top:"5%", right:"-10%", width:"60%", height:"80%",
          background:"radial-gradient(ellipse at center, rgba(168,85,247,0.18) 0%, rgba(124,58,237,0.10) 35%, transparent 65%)",
          animation:"fp-glow 14s ease-in-out infinite",
        }}/>
        <div className="absolute" style={{
          bottom:"-10%", left:"-5%", width:"55%", height:"60%",
          background:"radial-gradient(ellipse at center, rgba(139,92,246,0.18) 0%, transparent 60%)",
        }}/>
      </div>

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 50 }).map((_, i) => (
          <div key={i} className="absolute rounded-full bg-white" style={{
            width: `${Math.random()*1.5+0.5}px`,
            height:`${Math.random()*1.5+0.5}px`,
            left:  `${Math.random()*100}%`,
            top:   `${Math.random()*100}%`,
            opacity: Math.random()*0.5+0.1,
            animation:`fp-pulse ${3+Math.random()*4}s ease-in-out infinite`,
            animationDelay:`${Math.random()*5}s`,
          }}/>
        ))}
      </div>

      <main className="flex-1 container mx-auto px-6 lg:px-10 py-12 relative z-10 flex items-center justify-center">
        <motion.div
          initial={{ opacity:0, y:24 }}
          animate={{ opacity:1, y:0 }}
          transition={{ duration:0.6 }}
          className="w-full max-w-md"
        >
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
              }}
            >
              <div className="flex justify-center mb-4">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center"
                  style={{
                    background:"linear-gradient(135deg, rgba(30,20,55,0.9), rgba(50,30,90,0.9))",
                    border:"1.5px solid rgba(168,85,247,0.55)",
                    boxShadow:"0 0 24px rgba(139,92,246,0.45)",
                  }}
                >
                  <Mail className="w-6 h-6 text-violet-300" strokeWidth={2.2}/>
                </div>
              </div>

              <div className="text-center mb-6 font-syne-bold">
                <h3 className="text-white" style={{ fontSize:"1.3rem", fontWeight:800, letterSpacing:"-0.01em" }}>
                  Forgot Password?
                </h3>
                <p className="text-[13.5px] mt-2" style={{ color:"rgba(255,255,255,0.55)" }}>
                  Enter your email and we'll send you a reset link.
                </p>
              </div>

              <form onSubmit={onSubmit} className="flex flex-col gap-4">
                <div>
                  <label htmlFor="fp-email" className="text-[13px] font-semibold text-white block mb-1.5">
                    Email Address
                  </label>
                  <div
                    className="relative rounded-lg overflow-hidden"
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
                      id="fp-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => onEmailChange(e.target.value)}
                      placeholder="you@example.com"
                      autoComplete="email"
                      className="w-full h-11 pl-10 pr-4 bg-transparent text-[14px] text-white placeholder:text-white/35 outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || status === "success"}
                  className="relative w-full h-11 rounded-lg overflow-hidden text-white font-bold text-[14px] mt-1 disabled:opacity-80"
                  style={{
                    background: status === "success"
                      ? "linear-gradient(90deg, #059669 0%, #10b981 50%, #34d399 100%)"
                      : "linear-gradient(90deg, #3b82f6 0%, #6366f1 50%, #a855f7 100%)",
                    boxShadow: status === "success"
                      ? "0 6px 24px rgba(16,185,129,0.45)"
                      : "0 6px 24px rgba(99,102,241,0.45)",
                  }}
                >
                  <span className="relative z-10 inline-flex items-center justify-center gap-2 w-full h-full">
                    {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" strokeWidth={2.5}/>}
                    {status === "success" && !isSubmitting && <CheckCircle2 className="w-4 h-4" strokeWidth={2.5}/>}
                    {isSubmitting
                      ? "Sending..."
                      : status === "success"
                      ? "Email sent"
                      : "Send Reset Link"}
                    {!isSubmitting && status !== "success" && <ArrowRight className="w-4 h-4" strokeWidth={2.5}/>}
                  </span>
                  {!isSubmitting && status !== "success" && (
                    <span
                      className="pointer-events-none absolute top-0 bottom-0 w-1/3"
                      style={{
                        background:"linear-gradient(90deg, transparent, rgba(255,255,255,0.28), transparent)",
                        animation:"btn-shine 2.5s ease-in-out infinite",
                      }}
                    />
                  )}
                </button>

                <AnimatePresence>
                  {message && (
                    <motion.div
                      initial={{ opacity:0, y:-6 }}
                      animate={{ opacity:1, y:0 }}
                      exit={{ opacity:0 }}
                      className="text-[13px] rounded-lg px-3 py-2.5"
                      style={
                        status === "error"
                          ? { background:"rgba(239,68,68,0.10)", border:"1px solid rgba(239,68,68,0.30)", color:"#fca5a5" }
                          : { background:"rgba(16,185,129,0.10)", border:"1px solid rgba(16,185,129,0.30)", color:"#6ee7b7" }
                      }
                    >
                      {message}
                    </motion.div>
                  )}
                </AnimatePresence>

                <button
                  type="button"
                  onClick={onNavigateToLogin}
                  className="text-center text-[13px] mt-1 inline-flex items-center justify-center gap-1.5"
                  style={{ color:"#a78bfa", background:"none", border:"none", cursor:"pointer" }}
                >
                  <ArrowLeft className="w-3.5 h-3.5" strokeWidth={2.4}/>
                  Back to sign in
                </button>
              </form>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default ForgotPassword;
