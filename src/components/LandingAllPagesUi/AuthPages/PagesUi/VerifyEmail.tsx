import { CheckCircle2, Loader2, XCircle, MailCheck, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export type VerifyEmailProps = {
  status: "loading" | "success" | "error" | "missing";
  message: string;
  onGoHome: () => void;
  onGoLogin: () => void;
  // Resend section is only shown when user is logged in (we have isAuthenticated true)
  canResend: boolean;
  isResending: boolean;
  resendStatus: "idle" | "success" | "error";
  resendMessage: string;
  onResend: () => void;
};

const VerifyEmail = ({
  status,
  message,
  onGoHome,
  onGoLogin,
  canResend,
  isResending,
  resendStatus,
  resendMessage,
  onResend,
}: VerifyEmailProps) => {
  return (
    <div
      className="min-h-screen relative overflow-hidden flex items-center"
      style={{ background: "#05050f" }}
    >
      <style>{`
        @keyframes ve-pulse { 0%,100%{opacity:0.25} 50%{opacity:1} }
        @keyframes ve-glow {
          0%,100% { transform: translate(0,0) scale(1); }
          50% { transform: translate(20px,-15px) scale(1.05); }
        }
      `}</style>

      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute" style={{
          top:"5%", right:"-10%", width:"60%", height:"80%",
          background:"radial-gradient(ellipse at center, rgba(168,85,247,0.18) 0%, rgba(124,58,237,0.10) 35%, transparent 65%)",
          animation:"ve-glow 14s ease-in-out infinite",
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
            animation:`ve-pulse ${3+Math.random()*4}s ease-in-out infinite`,
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
              className="rounded-2xl p-8 relative text-center"
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
                  {status === "loading" && <Loader2 className="w-6 h-6 text-violet-300 animate-spin" strokeWidth={2.2}/>}
                  {status === "success" && <CheckCircle2 className="w-6 h-6 text-emerald-300" strokeWidth={2.2}/>}
                  {status === "error" && <XCircle className="w-6 h-6 text-rose-300" strokeWidth={2.2}/>}
                  {status === "missing" && <MailCheck className="w-6 h-6 text-violet-300" strokeWidth={2.2}/>}
                </div>
              </div>

              <h3 className="text-white" style={{ fontSize:"1.6rem", fontWeight:800, letterSpacing:"-0.01em" }}>
                {status === "loading" && "Verifying email..."}
                {status === "success" && "Email verified"}
                {status === "error" && "Verification failed"}
                {status === "missing" && "Verify your email"}
              </h3>
              <p className="text-[13.5px] mt-2 mb-5" style={{ color:"rgba(255,255,255,0.55)" }}>
                {message}
              </p>

              {(status === "success" || status === "error") && (
                <button
                  type="button"
                  onClick={onGoHome}
                  className="relative w-full h-11 rounded-lg overflow-hidden text-white font-bold text-[14px]"
                  style={{
                    background:"linear-gradient(90deg, #3b82f6 0%, #6366f1 50%, #a855f7 100%)",
                    boxShadow:"0 6px 24px rgba(99,102,241,0.45)",
                  }}
                >
                  <span className="relative z-10 inline-flex items-center justify-center gap-2 w-full h-full">
                    Continue
                    <ArrowRight className="w-4 h-4" strokeWidth={2.5}/>
                  </span>
                </button>
              )}

              {status === "missing" && !canResend && (
                <button
                  type="button"
                  onClick={onGoLogin}
                  className="relative w-full h-11 rounded-lg overflow-hidden text-white font-bold text-[14px]"
                  style={{
                    background:"linear-gradient(90deg, #3b82f6 0%, #6366f1 50%, #a855f7 100%)",
                    boxShadow:"0 6px 24px rgba(99,102,241,0.45)",
                  }}
                >
                  <span className="relative z-10 inline-flex items-center justify-center gap-2 w-full h-full">
                    Sign in to resend
                    <ArrowRight className="w-4 h-4" strokeWidth={2.5}/>
                  </span>
                </button>
              )}

              {canResend && (
                <div className="mt-4 flex flex-col gap-2.5">
                  <button
                    type="button"
                    onClick={onResend}
                    disabled={isResending || resendStatus === "success"}
                    className="w-full h-11 rounded-lg font-semibold text-[13.5px] text-white transition-colors disabled:opacity-70"
                    style={{
                      background:"rgba(15,15,30,0.6)",
                      border:"1px solid rgba(168,85,247,0.4)",
                    }}
                  >
                    {isResending
                      ? "Sending..."
                      : resendStatus === "success"
                      ? "Verification email sent"
                      : "Resend verification email"}
                  </button>
                  {resendMessage && (
                    <div
                      className="text-[13px] rounded-lg px-3 py-2.5 text-left"
                      style={
                        resendStatus === "error"
                          ? { background:"rgba(239,68,68,0.10)", border:"1px solid rgba(239,68,68,0.30)", color:"#fca5a5" }
                          : { background:"rgba(16,185,129,0.10)", border:"1px solid rgba(16,185,129,0.30)", color:"#6ee7b7" }
                      }
                    >
                      {resendMessage}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default VerifyEmail;
