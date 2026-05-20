const pipelineImg =
"/HowItWorkPageImage.png"; 

import { motion, useInView } from "framer-motion";
import {
  Users,
  MessageSquare,
  Target,
  RefreshCw,
} from "lucide-react";
import { useRef } from "react";
import React from "react";

/* ============================================================
   IMAGE PLACEHOLDER — apni pipeline visualization image lagao
   ============================================================
   Example:
     import pipelineImg from "@/Images/pipeline-visualization.png";


/* ============================================================
   Numbered step (left side)
============================================================ */
interface StepItemProps {
  number: number;
  title: string;
  description: string;
  delay: number;
  isInView: boolean;
}

const StepItem: React.FC<StepItemProps> = ({
  number,
  title,
  description,
  delay,
  isInView,
}) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
    transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
    className="flex items-start gap-4"
  >
    <div
      className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-base font-bold mt-0.5"
      style={{
        background:
          "linear-gradient(135deg, rgba(34,211,238,0.2) 0%, rgba(59,130,246,0.12) 100%)",
        border: "1px solid rgba(96,165,250,0.45)",
        color: "#22d3ee",
        boxShadow: "0 0 14px rgba(34,211,238,0.3)",
      }}
    >
      {number}
    </div>

    <div className="flex-1 min-w-0">
      <h4 className="text-lg font-bold text-white leading-tight mb-1">
        {title}
      </h4>
      <p
        className="text-sm leading-relaxed"
        style={{ color: "rgba(255,255,255,0.55)" }}
      >
        {description}
      </p>
    </div>
  </motion.div>
);

/* ============================================================
   Feature card (right side)
============================================================ */
interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay: number;
  isInView: boolean;
}

const FeatureCard: React.FC<FeatureCardProps> = ({
  icon,
  title,
  description,
  delay,
  isInView,
}) => (
  <motion.div
    initial={{ opacity: 0, x: 20 }}
    animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }}
    transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
    whileHover={{ x: -3 }}
    className="flex items-start gap-3.5 p-4 rounded-2xl group cursor-pointer"
    style={{
      background: "rgba(8,12,28,0.55)",
      border: "1px solid rgba(96,165,250,0.18)",
      backdropFilter: "blur(14px)",
      WebkitBackdropFilter: "blur(14px)",
      transition: "border-color 0.3s ease, background 0.3s ease",
    }}
  >
    <div
      className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center"
      style={{
        background:
          "linear-gradient(135deg, rgba(34,211,238,0.18) 0%, rgba(59,130,246,0.10) 100%)",
        border: "1px solid rgba(96,165,250,0.35)",
        boxShadow: "0 0 14px rgba(59,130,246,0.22)",
      }}
    >
      {icon}
    </div>

    <div className="flex-1 min-w-0 pt-0.5">
      <h4 className="text-[15px] font-bold text-white leading-tight mb-1">
        {title}
      </h4>
      <p
        className="text-[13px] leading-relaxed"
        style={{ color: "rgba(255,255,255,0.55)" }}
      >
        {description}
      </p>
    </div>
  </motion.div>
);

/* ============================================================
   Main Section
============================================================ */
const HowItWorks = () => {
  const sectionRef = useRef(null);
  const leftRef = useRef(null);
  const centerRef = useRef(null);
  const rightRef = useRef(null);

  const isLeftInView = useInView(leftRef, {
    once: true,
    margin: "-100px",
    amount: 0.2,
  });
  const isCenterInView = useInView(centerRef, {
    once: true,
    margin: "-100px",
    amount: 0.15,
  });
  const isRightInView = useInView(rightRef, {
    once: true,
    margin: "-100px",
    amount: 0.2,
  });

  const steps = [
    {
      number: 1,
      title: "Input",
      description: "You provide a topic or keyword.",
    },
    {
      number: 2,
      title: "Research & Plan",
      description: "Agents research the web and create a strategic outline.",
    },
    {
      number: 3,
      title: "Write & Refine",
      description:
        "Content is drafted, fact-checked against your sources, and polished.",
    },
    {
      number: 4,
      title: "Distribute & Publish",
      description:
        "Social agents create posts and make it ready to publish anywhere.",
    },
  ];

  const features = [
    {
      icon: (
        <Users
          className="w-5 h-5"
          style={{ color: "#60a5fa" }}
          strokeWidth={2}
        />
      ),
      title: "Scalable",
      description: "Create content at scale without compromising quality.",
    },
    {
      icon: (
        <MessageSquare
          className="w-5 h-5"
          style={{ color: "#60a5fa" }}
          strokeWidth={2}
        />
      ),
      title: "Consistent",
      description: "Maintain brand voice and quality across all platforms.",
    },
    {
      icon: (
        <Target
          className="w-5 h-5"
          style={{ color: "#60a5fa" }}
          strokeWidth={2}
        />
      ),
      title: "Optimized",
      description: "Built for AI search, SEO, and user experience.",
    },
    {
      icon: (
        <RefreshCw
          className="w-5 h-5"
          style={{ color: "#60a5fa" }}
          strokeWidth={2}
        />
      ),
      title: "Automated",
      description: "End-to-end automation saves time and boosts productivity.",
    },
  ];

  return (
    <section
      ref={sectionRef}
      id="how-it-works"
      className="relative  overflow-hidden"
      style={{ background: "#05050f" }}
    >
      <style>{`
        @keyframes hiw-pulse { 0%,100%{opacity:0.25} 50%{opacity:1} }
        @keyframes hiw-glow {
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
            animation: "hiw-glow 14s ease-in-out infinite",
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

      {/* Tiny particles */}
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
              animation: `hiw-pulse ${
                3 + Math.random() * 4
              }s ease-in-out infinite`,
              animationDelay: `${Math.random() * 5}s`,
            }}
          />
        ))}
      </div>

      <div className="container mx-auto  relative z-10">
        {/*
          ⚠️ LAYERED GRID: All 3 elements share row-start-1 on lg screens.
          - Image spans col 1-12 (full width, behind)
          - Left content sits at col 1-4 (z-10, on top of image)
          - Right content sits at col 9-12 (z-10, on top of image)
          - On mobile: stacks vertically (image, left, right via order)
        */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-0 lg:items-center  mx-auto">
          {/* ────── LEFT — Heading + steps (overlays on image) ────── */}
          <motion.div
            ref={leftRef}
            initial={{ opacity: 0, x: -30 }}
            animate={
              isLeftInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }
            }
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-start-1 lg:col-span-4 lg:row-start-1 lg:z-10 flex flex-col gap-6 order-1 lg:order-none pl-16"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={
                isLeftInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }
              }
              transition={{ duration: 0.4, delay: 0.1 }}
              className="inline-flex items-center w-fit px-4 py-1.5 rounded-full"
              style={{
                background: "rgba(15,15,30,0.6)",
                border: "1px solid rgba(96,165,250,0.25)",
                backdropFilter: "blur(10px)",
              }}
            >
              <span
                className="text-[12px] font-bold tracking-[0.18em]"
                style={{ color: "#22d3ee" }}
              >
                HOW THEY WORK TOGETHER
              </span>
            </motion.div>

            {/* Heading — bigger size now */}
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={
                isLeftInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }
              }
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-white"
              style={{
                fontSize: "clamp(1.8rem, 2.8vw, 2.6rem)",
                fontWeight: 900,
                letterSpacing: "-0.02em",
                lineHeight: 1.08,
              }}
            >
              <span className="block whitespace-nowrap font-syne-bold">
                A Unified Pipeline.
              </span>
              <span className="block whitespace-nowrap font-syne-bold">Maximum Impact.</span>
            </motion.h2>

            {/* Steps */}
            <div className="flex flex-col gap-5 mt-2">
              {steps.map((step, index) => (
                <StepItem
                  key={step.number}
                  number={step.number}
                  title={step.title}
                  description={step.description}
                  delay={0.3 + index * 0.1}
                  isInView={isLeftInView}
                />
              ))}
            </div>
          </motion.div>

          {/* ────── CENTER — Pipeline image (BEHIND, full width) ────── */}
          <motion.div
            ref={centerRef}
            initial={{ opacity: 0, scale: 0.92 }}
            animate={
              isCenterInView
                ? { opacity: 1, scale: 1 }
                : { opacity: 0, scale: 0.92 }
            }
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-start-1 lg:col-span-12 lg:row-start-1 relative flex items-center justify-center order-2 lg:order-none"
          >
            <motion.div
              animate={{
                scale: [1, 1.06, 1],
                opacity: [0.5, 0.8, 0.5],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute pointer-events-none"
              style={{
                top: "10%",
                left: "20%",
                right: "20%",
                bottom: "10%",
                background:
                  "radial-gradient(circle at center, rgba(59,130,246,0.4) 0%, rgba(139,92,246,0.2) 40%, transparent 70%)",
                filter: "blur(60px)",
              }}
            />

            <img
              src={pipelineImg}
              alt="Pipeline Visualization"
              draggable={false}
              className="img-bounce relative w-full h-auto  select-none"
              style={{
                pointerEvents: "none",
                filter: "drop-shadow(0 20px 50px rgba(59,130,246,0.3))",
                maxWidth: "670px",
              }}
            />
          </motion.div>

          {/* ────── RIGHT — Feature cards (overlays on image) ────── */}
          <motion.div
            ref={rightRef}
            initial={{ opacity: 0, x: 30 }}
            animate={
              isRightInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 30 }
            }
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="hidden lg:flex lg:col-start-9 lg:col-span-4 lg:row-start-1 lg:z-10 flex-col gap-3 order-3 lg:order-none pl-8"
          >
            {features.map((feature, index) => (
              <FeatureCard
                key={feature.title}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                delay={0.2 + index * 0.1}
                isInView={isRightInView}
              />
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
