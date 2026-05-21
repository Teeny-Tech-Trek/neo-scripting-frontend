


import { motion, useInView } from "framer-motion";
import { useRef } from "react";

/* ============================================================
   IMAGE PLACEHOLDER — apni agent network image yahan lagao
   ============================================================
   Example:
     import agentNetworkImg from "@/Images/agent-network.png";
*/
const agentNetworkImg =
  "/how_neo_script_works.png";

const AgentNetwork = () => {
  const sectionRef = useRef(null);
  const headerRef = useRef(null);
  const imageRef = useRef(null);

  const isHeaderInView = useInView(headerRef, { once: true, margin: "-50px" });
  const isImageInView = useInView(imageRef, {
    once: true,
    margin: "-100px",
    amount: 0.15,
  });

  return (
    <section
      ref={sectionRef}
      id="agents"
      className="relative pt-20 pb-8 lg:pt-24 lg:pb-10 overflow-hidden"
      style={{ background: "#05050f" }}
    >
      <style>{`
        @keyframes ag-pulse { 0%,100%{opacity:0.25} 50%{opacity:1} }
        @keyframes ag-glow {
          0%,100% { transform: translate(0,0) scale(1); }
          50% { transform: translate(20px,-15px) scale(1.05); }
        }
      `}</style>

      {/* Background atmosphere */}
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
            animation: "ag-glow 14s ease-in-out infinite",
          }}
        />
        <div
          className="absolute"
          style={{
            bottom: "-10%",
            left: "-5%",
            width: "55%",
            height: "60%",
            background:
              "radial-gradient(ellipse at center, rgba(139,92,246,0.15) 0%, transparent 60%)",
          }}
        />
      </div>

      {/* Particles */}
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
              animation: `ag-pulse ${
                3 + Math.random() * 4
              }s ease-in-out infinite`,
              animationDelay: `${Math.random() * 5}s`,
            }}
          />
        ))}
      </div>

      <div className="container mx-auto px-6 lg:px-10 relative z-10">
        {/* ════════════ HEADER ════════════ */}
        <motion.div
          ref={headerRef}
          className="text-center mb-12 lg:mb-14 max-w-4xl mx-auto"
        >
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={
              isHeaderInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }
            }
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-white"
            style={{
              fontSize: "clamp(2rem,4vw,3.25rem)",
              fontWeight: 900,
              letterSpacing: "-0.02em",
              lineHeight: 1.08,
            }}
          >
            <span className="block font-syne-bold">
              A Team of{" "}
              <span
              style={{
                background:
                  "linear-gradient(90deg, #22d3ee 0%, #3b82f6 50%, #a855f7 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
                AI Agents.
            </span>
            </span>
            <span className="block font-syne-bold">
              One{" "}
            <span
              style={{
                background:
                  "linear-gradient(90deg, #22d3ee 0%, #3b82f6 50%, #a855f7 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
             Unified Engine.
            </span>
                
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={
              isHeaderInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }
            }
            transition={{ duration: 0.5, delay: 0.25 }}
            className="text-base sm:text-lg leading-relaxed max-w-2xl mx-auto mt-5"
            style={{ color: "rgba(255,255,255,0.55)" }}
          >
            Each agent has a single purpose. Together, they research, plan,
            write, and refine trusted content at scale — citation-backed and
            ready for your website or social channels.
          </motion.p>
        </motion.div>

        {/* ════════════ AGENT NETWORK IMAGE ════════════ */}
        <motion.div
          ref={imageRef}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={
            isImageInView
              ? { opacity: 1, scale: 1 }
              : { opacity: 0, scale: 0.95 }
          }
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="relative max-w-[1300px] mx-auto"
        >
          {/* Glow behind image */}
          <motion.div
            animate={{
              scale: [1, 1.05, 1],
              opacity: [0.4, 0.7, 0.4],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute pointer-events-none"
            style={{
              top: "10%",
              left: "10%",
              right: "10%",
              bottom: "10%",
              background:
                "radial-gradient(ellipse at center, rgba(59,130,246,0.3) 0%, rgba(139,92,246,0.18) 40%, transparent 70%)",
              filter: "blur(60px)",
            }}
          />

          {/* Image */}
        <img
  src={agentNetworkImg}
  alt="AI Agent Network"
  draggable={false}
  className="img-bounce relative w-[80%] mx-auto h-auto select-none"
  style={{
    pointerEvents: "none",
    filter: "drop-shadow(0 20px 60px rgba(59,130,246,0.3))",
  }}
/>
        </motion.div>

        {/* ════════════ BRIDGE TAGLINE → live preview below ════════════ */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={isImageInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 }}
          transition={{ duration: 0.6, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="mt-6 sm:mt-8 text-center px-6"
        >
          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] px-2.5 py-1 rounded-full"
            style={{
              background: "rgba(124,58,237,0.12)",
              border: "1px solid rgba(124,58,237,0.28)",
              color: "#c4b5fd",
            }}>
            <span className="w-1 h-1 rounded-full bg-violet-300"
              style={{ animation: "ag-pulse 2.5s ease-in-out infinite" }}/>
            See it in action
          </span>
          <h3 className="mt-4 text-[22px] sm:text-[30px] font-extrabold tracking-tight text-white leading-[1.15] max-w-[760px] mx-auto">
            This isn't a mockup.{" "}
            <span
              style={{
                background:
                  "linear-gradient(90deg, #a78bfa 0%, #c4b5fd 50%, #f0abfc 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              It's the actual interface.
            </span>
          </h3>
          <p className="mt-3 text-[14px] sm:text-[15px] leading-relaxed max-w-[640px] mx-auto"
            style={{ color: "rgba(255,255,255,0.55)" }}>
            Drop a topic, pick your tone, watch ten agents go to work, or skip the dashboard entirely and run it from Claude, Cursor, or any MCP-aware client.
          </p>
        </motion.div>

      </div>
    </section>
  );
};

export default AgentNetwork;