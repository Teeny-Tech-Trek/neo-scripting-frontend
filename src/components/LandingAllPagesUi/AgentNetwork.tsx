// import { motion, useInView } from "framer-motion";
// import {
//   Tag,
//   Search,
//   LayoutList,
//   PenTool,
//   Zap,
//   Globe,
//   MessageCircle,
//   FileCheck,
//   ShieldCheck,
// } from "lucide-react";
// import { useRef } from "react";
// import React from "react";

// /* ============================================================
//    Custom brand icons (lucide-react ne Twitter/Linkedin remove kar diye)
// ============================================================ */
// const LinkedinIcon: React.FC<{ size?: number; color?: string }> = ({
//   size = 16,
//   color = "currentColor",
// }) => (
//   <svg
//     width={size}
//     height={size}
//     viewBox="0 0 24 24"
//     fill={color}
//     xmlns="http://www.w3.org/2000/svg"
//   >
//     <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.36V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.72V1.72C24 .77 23.2 0 22.22 0z" />
//   </svg>
// );

// const TwitterIcon: React.FC<{ size?: number; color?: string }> = ({
//   size = 16,
//   color = "currentColor",
// }) => (
//   <svg
//     width={size}
//     height={size}
//     viewBox="0 0 24 24"
//     fill={color}
//     xmlns="http://www.w3.org/2000/svg"
//   >
//     <path d="M23.643 4.937c-.835.37-1.732.62-2.675.733.962-.576 1.7-1.49 2.048-2.578-.9.534-1.897.922-2.958 1.13-.85-.904-2.06-1.47-3.4-1.47-2.572 0-4.658 2.086-4.658 4.66 0 .364.042.718.12 1.06-3.873-.195-7.304-2.05-9.602-4.868-.4.69-.63 1.49-.63 2.342 0 1.616.823 3.043 2.072 3.878-.764-.025-1.482-.234-2.11-.583v.06c0 2.257 1.605 4.14 3.737 4.568-.392.106-.803.162-1.227.162-.3 0-.593-.028-.877-.082.593 1.85 2.313 3.198 4.352 3.234-1.595 1.25-3.604 1.995-5.786 1.995-.376 0-.747-.022-1.112-.065 2.062 1.323 4.51 2.093 7.14 2.093 8.57 0 13.255-7.098 13.255-13.254 0-.2-.005-.402-.014-.602.91-.658 1.7-1.477 2.323-2.41z" />
//   </svg>
// );

// /* ============================================================
//    AI CORE image placeholder — apni 3D cube image yahan lagao
//    ============================================================
//    Example:
//      import aiCoreImg from "@/Images/ai-core-cube.png";
// */
// const aiCoreImg =
//   "https://placehold.co/400x400/05050f/22d3ee?text=AI+CORE+3D";

// /* ============================================================
//    Agent Card
// ============================================================ */
// type Accent = "blue" | "purple" | "red" | "cyan" | "green";

// interface AgentCardProps {
//   number?: string;
//   title: string;
//   description: string;
//   icon: React.ReactNode;
//   accent?: Accent;
//   delay?: number;
//   isInView: boolean;
//   className?: string;
// }

// const accentMap: Record<
//   Accent,
//   { iconBg: string; iconBorder: string; glow: string; numBg: string }
// > = {
//   blue: {
//     iconBg:
//       "linear-gradient(135deg, rgba(59,130,246,0.2), rgba(34,211,238,0.1))",
//     iconBorder: "rgba(96,165,250,0.4)",
//     glow: "0 0 16px rgba(59,130,246,0.3)",
//     numBg: "rgba(59,130,246,0.15)",
//   },
//   purple: {
//     iconBg:
//       "linear-gradient(135deg, rgba(168,85,247,0.25), rgba(139,92,246,0.12))",
//     iconBorder: "rgba(192,132,252,0.45)",
//     glow: "0 0 16px rgba(168,85,247,0.35)",
//     numBg: "rgba(168,85,247,0.18)",
//   },
//   red: {
//     iconBg:
//       "linear-gradient(135deg, rgba(239,68,68,0.25), rgba(249,115,22,0.12))",
//     iconBorder: "rgba(248,113,113,0.45)",
//     glow: "0 0 16px rgba(239,68,68,0.35)",
//     numBg: "rgba(239,68,68,0.18)",
//   },
//   cyan: {
//     iconBg:
//       "linear-gradient(135deg, rgba(34,211,238,0.22), rgba(59,130,246,0.10))",
//     iconBorder: "rgba(103,232,249,0.45)",
//     glow: "0 0 16px rgba(34,211,238,0.35)",
//     numBg: "rgba(34,211,238,0.18)",
//   },
//   green: {
//     iconBg:
//       "linear-gradient(135deg, rgba(34,197,94,0.22), rgba(20,184,166,0.10))",
//     iconBorder: "rgba(74,222,128,0.45)",
//     glow: "0 0 16px rgba(34,197,94,0.35)",
//     numBg: "rgba(34,197,94,0.18)",
//   },
// };

// const AgentCard: React.FC<AgentCardProps> = ({
//   number,
//   title,
//   description,
//   icon,
//   accent = "blue",
//   delay = 0,
//   isInView,
//   className = "",
// }) => {
//   const a = accentMap[accent];
//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 20, scale: 0.95 }}
//       animate={
//         isInView
//           ? { opacity: 1, y: 0, scale: 1 }
//           : { opacity: 0, y: 20, scale: 0.95 }
//       }
//       transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
//       whileHover={{ y: -4, scale: 1.02 }}
//       className={`relative rounded-2xl p-4 group cursor-pointer ${className}`}
//       style={{
//         background:
//           "linear-gradient(135deg, rgba(15,20,40,0.6) 0%, rgba(8,12,28,0.6) 100%)",
//         border: "1px solid rgba(96,165,250,0.18)",
//         backdropFilter: "blur(12px)",
//         WebkitBackdropFilter: "blur(12px)",
//         transition: "border-color 0.3s ease",
//       }}
//     >
//       {/* Top row: number badge + icon */}
//       <div className="flex items-start justify-between mb-3">
//         {number && (
//           <span
//             className="text-[11px] font-bold px-2 py-0.5 rounded-md tracking-wider"
//             style={{
//               background: a.numBg,
//               color: "rgba(255,255,255,0.85)",
//               border: `1px solid ${a.iconBorder}`,
//             }}
//           >
//             {number}
//           </span>
//         )}
//         <div
//           className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
//           style={{
//             background: a.iconBg,
//             border: `1px solid ${a.iconBorder}`,
//             boxShadow: a.glow,
//           }}
//         >
//           {icon}
//         </div>
//       </div>

//       {/* Title */}
//       <h4 className="text-[15px] font-bold text-white leading-tight mb-1.5">
//         {title}
//       </h4>

//       {/* Description */}
//       <p
//         className="text-[12px] leading-relaxed"
//         style={{ color: "rgba(255,255,255,0.5)" }}
//       >
//         {description}
//       </p>
//     </motion.div>
//   );
// };

// /* ============================================================
//    AI CORE — central feature element
// ============================================================ */
// const AICore: React.FC<{ isInView: boolean }> = ({ isInView }) => {
//   return (
//     <motion.div
//       initial={{ opacity: 0, scale: 0.85 }}
//       animate={
//         isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.85 }
//       }
//       transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
//       className="relative rounded-2xl p-4 col-span-2 flex flex-col items-center justify-center min-h-[220px]"
//       style={{
//         background:
//           "linear-gradient(135deg, rgba(15,20,40,0.5) 0%, rgba(8,12,28,0.5) 100%)",
//         border: "1px solid rgba(34,211,238,0.3)",
//         backdropFilter: "blur(14px)",
//         WebkitBackdropFilter: "blur(14px)",
//         boxShadow:
//           "0 0 30px rgba(34,211,238,0.15), inset 0 0 20px rgba(34,211,238,0.05)",
//       }}
//     >
//       {/* Pulsing radial glow behind cube */}
//       <motion.div
//         className="absolute pointer-events-none"
//         style={{
//           top: "10%",
//           left: "20%",
//           right: "20%",
//           bottom: "30%",
//           background:
//             "radial-gradient(circle at center, rgba(34,211,238,0.4) 0%, rgba(59,130,246,0.2) 40%, transparent 70%)",
//           filter: "blur(30px)",
//         }}
//         animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.9, 0.5] }}
//         transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
//       />

//       {/* 3D cube image */}
//       <img
//         src={aiCoreImg}
//         alt="AI Core"
//         draggable={false}
//         className="relative w-32 h-32 sm:w-40 sm:h-40 object-contain select-none"
//         style={{
//           pointerEvents: "none",
//           filter: "drop-shadow(0 0 30px rgba(34,211,238,0.6))",
//         }}
//       />

//       {/* Text */}
//       <div className="relative text-center mt-2">
//         <h3
//           className="text-white tracking-wider"
//           style={{
//             fontSize: "1.05rem",
//             fontWeight: 900,
//             letterSpacing: "0.08em",
//           }}
//         >
//           AI CORE
//         </h3>
//         <p
//           className="text-[11px] mt-1"
//           style={{ color: "rgba(255,255,255,0.5)" }}
//         >
//           Orchestrates • Thinks • Delivers
//         </p>
//       </div>
//     </motion.div>
//   );
// };

// /* ============================================================
//    Main Section
// ============================================================ */
// const AgentNetwork = () => {
//   const sectionRef = useRef(null);
//   const headerRef = useRef(null);
//   const gridRef = useRef(null);
//   const isHeaderInView = useInView(headerRef, { once: true, margin: "-50px" });
//   const isGridInView = useInView(gridRef, {
//     once: true,
//     margin: "-100px",
//     amount: 0.1,
//   });

//   // ── ROW 1 (top): 01, 02, 03, 04 ──
//   const row1 = [
//     {
//       number: "01",
//       title: "Topic Generator",
//       description:
//         "Converts raw inputs into precise, AEO-optimized topic ideas.",
//       icon: (
//         <Tag className="w-4 h-4" style={{ color: "#60a5fa" }} strokeWidth={2} />
//       ),
//       accent: "blue" as Accent,
//     },
//     {
//       number: "02",
//       title: "Researcher (Blog)",
//       description:
//         "Finds facts, stats, and user questions with live web research.",
//       icon: (
//         <Search
//           className="w-4 h-4"
//           style={{ color: "#c084fc" }}
//           strokeWidth={2}
//         />
//       ),
//       accent: "purple" as Accent,
//     },
//     {
//       number: "03",
//       title: "Planner",
//       description:
//         "Creates AEO-focused outlines with headings and user questions.",
//       icon: (
//         <LayoutList
//           className="w-4 h-4"
//           style={{ color: "#22d3ee" }}
//           strokeWidth={2}
//         />
//       ),
//       accent: "cyan" as Accent,
//     },
//     {
//       number: "04",
//       title: "Writer",
//       description:
//         "Writes detailed, engaging, and on-brand long-form content.",
//       icon: (
//         <PenTool
//           className="w-4 h-4"
//           style={{ color: "#f87171" }}
//           strokeWidth={2}
//         />
//       ),
//       accent: "red" as Accent,
//     },
//   ];

//   // ── ROW 2: 07 (left), AI CORE (center span 2), 05 (right) ──
//   const row2Sides = {
//     left: {
//       number: "07",
//       title: "Researcher (Social)",
//       description: "Gathers platform-specific insights and trending topics.",
//       icon: (
//         <Search
//           className="w-4 h-4"
//           style={{ color: "#60a5fa" }}
//           strokeWidth={2}
//         />
//       ),
//       accent: "blue" as Accent,
//     },
//     right: {
//       number: "05",
//       title: "Optimizer",
//       description:
//         "Refines content for AEO, snippets, direct answers & LLM citations.",
//       icon: (
//         <Zap
//           className="w-4 h-4"
//           style={{ color: "#f87171" }}
//           fill="#f87171"
//           strokeWidth={1}
//         />
//       ),
//       accent: "red" as Accent,
//     },
//   };

//   // ── ROW 3 (bottom): 06, 08, 09, 10 ──
//   const row3 = [
//     {
//       number: "06",
//       title: "Researcher (Social)",
//       description: "Gathers platform-specific insights and trending topics.",
//       icon: (
//         <Globe
//           className="w-4 h-4"
//           style={{ color: "#22d3ee" }}
//           strokeWidth={2}
//         />
//       ),
//       accent: "cyan" as Accent,
//     },
//     {
//       number: "08",
//       title: "LinkedIn Writer",
//       description: "Creates professional, optimized content for LinkedIn.",
//       icon: (
//         <LinkedinIcon size={16} color="#60a5fa" />
//       ),
//       accent: "blue" as Accent,
//     },
//     {
//       number: "09",
//       title: "Twitter Writer",
//       description: "Writes short, punchy tweets with hashtags and hooks.",
//       icon: (
//         <TwitterIcon size={16} color="#22d3ee" />
//       ),
//       accent: "cyan" as Accent,
//     },
//     {
//       number: "10",
//       title: "Reddit Writer",
//       description: "Creates conversational, friendly Reddit-style content.",
//       icon: (
//         <MessageCircle
//           className="w-4 h-4"
//           style={{ color: "#f87171" }}
//           strokeWidth={2}
//         />
//       ),
//       accent: "red" as Accent,
//     },
//   ];

//   return (
//     <section
//       ref={sectionRef}
//       id="agents"
//       className="relative py-20 lg:py-24 overflow-hidden"
//       style={{ background: "#05050f" }}
//     >
//       <style>{`
//         @keyframes ag-pulse { 0%,100%{opacity:0.25} 50%{opacity:1} }
//         @keyframes ag-glow {
//           0%,100% { transform: translate(0,0) scale(1); }
//           50% { transform: translate(20px,-15px) scale(1.05); }
//         }
//       `}</style>

//       {/* Background atmosphere */}
//       <div className="absolute inset-0 pointer-events-none">
//         <div
//           className="absolute"
//           style={{
//             top: "5%",
//             right: "-10%",
//             width: "60%",
//             height: "80%",
//             background:
//               "radial-gradient(ellipse at center, rgba(59,130,246,0.18) 0%, rgba(99,102,241,0.10) 35%, transparent 65%)",
//             animation: "ag-glow 14s ease-in-out infinite",
//           }}
//         />
//         <div
//           className="absolute"
//           style={{
//             bottom: "-10%",
//             left: "-5%",
//             width: "55%",
//             height: "60%",
//             background:
//               "radial-gradient(ellipse at center, rgba(139,92,246,0.15) 0%, transparent 60%)",
//           }}
//         />
//       </div>

//       {/* Particles */}
//       <div className="absolute inset-0 overflow-hidden pointer-events-none">
//         {Array.from({ length: 60 }).map((_, i) => (
//           <div
//             key={i}
//             className="absolute rounded-full bg-white"
//             style={{
//               width: `${Math.random() * 1.5 + 0.5}px`,
//               height: `${Math.random() * 1.5 + 0.5}px`,
//               left: `${Math.random() * 100}%`,
//               top: `${Math.random() * 100}%`,
//               opacity: Math.random() * 0.5 + 0.1,
//               animation: `ag-pulse ${
//                 3 + Math.random() * 4
//               }s ease-in-out infinite`,
//               animationDelay: `${Math.random() * 5}s`,
//             }}
//           />
//         ))}
//       </div>

//       <div className="container mx-auto px-6 lg:px-10 relative z-10">
//         {/* ════════════ HEADER ════════════ */}
//         <motion.div
//           ref={headerRef}
//           className="text-center mb-12 lg:mb-14 max-w-4xl mx-auto"
//         >
//           <motion.h2
//             initial={{ opacity: 0, y: 20 }}
//             animate={
//               isHeaderInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }
//             }
//             transition={{ duration: 0.6, delay: 0.1 }}
//             className="text-white"
//             style={{
//               fontSize: "clamp(2rem,4vw,3.25rem)",
//               fontWeight: 900,
//               letterSpacing: "-0.02em",
//               lineHeight: 1.08,
//             }}
//           >
//             <span className="block">
//               A Team of{" "}
//               <span
//                 style={{
//                   background:
//                     "linear-gradient(90deg, #22d3ee 0%, #3b82f6 100%)",
//                   WebkitBackgroundClip: "text",
//                   WebkitTextFillColor: "transparent",
//                   backgroundClip: "text",
//                 }}
//               >
//                 AI Agents.
//               </span>
//             </span>
//             <span className="block">
//               One{" "}
//               <span
//                 style={{
//                   background:
//                     "linear-gradient(90deg, #22d3ee 0%, #3b82f6 100%)",
//                   WebkitBackgroundClip: "text",
//                   WebkitTextFillColor: "transparent",
//                   backgroundClip: "text",
//                 }}
//               >
//                 Unified Engine.
//               </span>
//             </span>
//           </motion.h2>

//           <motion.p
//             initial={{ opacity: 0, y: 16 }}
//             animate={
//               isHeaderInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }
//             }
//             transition={{ duration: 0.5, delay: 0.25 }}
//             className="text-base sm:text-lg leading-relaxed max-w-2xl mx-auto mt-5"
//             style={{ color: "rgba(255,255,255,0.55)" }}
//           >
//             Each agent has a single purpose. Together, they research, write,
//             optimize, and publish AEO/GEO-optimized content at scale.
//           </motion.p>
//         </motion.div>

//         {/* ════════════ AGENT GRID ════════════ */}
//         <div ref={gridRef} className="max-w-6xl mx-auto">
//           <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
//             {/* ── ROW 1 ── */}
//             {row1.map((agent, i) => (
//               <AgentCard
//                 key={agent.number}
//                 {...agent}
//                 delay={0.05 + i * 0.05}
//                 isInView={isGridInView}
//               />
//             ))}

//             {/* ── ROW 2 ── */}
//             <AgentCard
//               {...row2Sides.left}
//               delay={0.3}
//               isInView={isGridInView}
//             />
//             <AICore isInView={isGridInView} />
//             <AgentCard
//               {...row2Sides.right}
//               delay={0.35}
//               isInView={isGridInView}
//             />

//             {/* ── ROW 3 ── */}
//             {row3.map((agent, i) => (
//               <AgentCard
//                 key={agent.number}
//                 {...agent}
//                 delay={0.45 + i * 0.05}
//                 isInView={isGridInView}
//               />
//             ))}
//           </div>

//           {/* ════════════ SPECIAL CARDS BELOW GRID ════════════ */}
//           <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mt-3 sm:mt-4 max-w-2xl mx-auto">
//             <AgentCard
//               title="Final Editor"
//               description="Polishes the blog into publish-ready, Markdown-perfect structure."
//               icon={
//                 <FileCheck
//                   className="w-4 h-4"
//                   style={{ color: "#4ade80" }}
//                   strokeWidth={2}
//                 />
//               }
//               accent="green"
//               delay={0.7}
//               isInView={isGridInView}
//             />
//             <AgentCard
//               title="Social QA Checker"
//               description="Ensures platform compliance, tone, and quality across posts."
//               icon={
//                 <ShieldCheck
//                   className="w-4 h-4"
//                   style={{ color: "#60a5fa" }}
//                   strokeWidth={2}
//                 />
//               }
//               accent="blue"
//               delay={0.78}
//               isInView={isGridInView}
//             />
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// };

// export default AgentNetwork;

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

/* ============================================================
   IMAGE PLACEHOLDER — apni agent network image yahan lagao
   ============================================================
   Example:
     import agentNetworkImg from "@/Images/agent-network.png";
*/
const agentNetworkImg =
  "/AgentShowCaseImage.png";

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
      className="relative py-20 lg:py-24 overflow-hidden"
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
            className="img-bounce relative w-full h-auto select-none"
            style={{
              pointerEvents: "none",
              filter: "drop-shadow(0 20px 60px rgba(59,130,246,0.3))",
            }}
          />
        </motion.div>
      </div>
    </section>
  );
};

export default AgentNetwork;