import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Check, Sparkles, Zap, Crown, ArrowRight, ShieldCheck, MessageCircle,
} from "lucide-react";
import Navbar from "../Navbar";
import Footer from "../Footer";

/* ════════════════════════════════════════════════════════════════════════
   BILLING PAGE — three-tier pricing with monthly/yearly toggle.
   Visual language mirrors the landing hero: dark bg, violet ambient glow,
   glass card surface, neon-purple accents.
   Dummy numbers throughout — wire to Stripe/Lemon/whatever when ready.
   ════════════════════════════════════════════════════════════════════════ */

type Cadence = "monthly" | "yearly";

type Plan = {
  id: string;
  name: string;
  tagline: string;
  monthlyUsd: number;
  yearlyUsd: number;          // already discounted (typically ~20% off ×12)
  blurb: string;
  credits: string;            // dummy
  mcpCalls: string;           // dummy
  features: string[];
  cta: string;
  highlight?: boolean;        // "Most popular" tier
  icon: React.ComponentType<{ size?: number; className?: string }>;
};

const PLANS: Plan[] = [
  {
    id: "starter",
    name: "Starter",
    tagline: "For solo creators kicking the tires",
    monthlyUsd: 19,
    yearlyUsd: 15,             // billed yearly
    blurb: "Everything you need to ship 2–3 polished posts a week.",
    credits: "50",
    mcpCalls: "6 / day",
    features: [
      "50 generation credits / month",
      "6 MCP calls per day",
      "Up to 3 brands",
      "5 reference docs per brand",
      "Inline citations + keyword highlights",
      "Generation history & retry",
      "Community support",
    ],
    cta: "Start with Starter",
    icon: Sparkles,
  },
  {
    id: "pro",
    name: "Pro",
    tagline: "For operators shipping daily",
    monthlyUsd: 49,
    yearlyUsd: 39,             // billed yearly
    blurb: "Everything in Starter plus competitor research, unlimited brands, and faster MCP.",
    credits: "250",
    mcpCalls: "25 / day",
    features: [
      "250 generation credits / month",
      "25 MCP calls per day",
      "Unlimited brands",
      "25 reference docs per brand",
      "Competitor research pipeline",
      "Per-document citation tracking",
      "Priority generation queue",
      "Email support, < 24h response",
    ],
    cta: "Go Pro",
    highlight: true,
    icon: Zap,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    tagline: "For teams running this in production",
    monthlyUsd: 149,
    yearlyUsd: 119,
    blurb: "Generous limits, team seats, and a dedicated reliability layer.",
    credits: "Unlimited*",
    mcpCalls: "Unlimited",
    features: [
      "Unlimited credits (fair-use 2,500 / mo)",
      "Unlimited MCP calls",
      "Unlimited brands & docs",
      "10 team seats included",
      "SSO + audit log",
      "Custom retention policies",
      "Dedicated Slack channel",
      "SLA-backed uptime",
    ],
    cta: "Contact sales",
    icon: Crown,
  },
];

const formatPrice = (n: number) => n.toLocaleString("en-US");

export default function Billing() {
  const [cadence, setCadence] = useState<Cadence>("monthly");

  // The "Pro" badge in the Navbar is the user's notional current plan.
  // Real plan would come from /me; hardcoded for now.
  const currentPlanId = "pro";

  const cadenceCopy = useMemo(
    () => (cadence === "yearly" ? "/month, billed yearly" : "/month"),
    [cadence],
  );

  return (
    <div className="min-h-screen flex flex-col bg-bg-base pt-10">
      <Navbar />

      <main className="relative flex-1 px-4 sm:px-6 pt-12 pb-16 overflow-hidden">
        {/* Ambient violet glow — same vibe as landing hero */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 flex justify-center"
        >
          <div
            style={{
              width: 1000, height: 540,
              background:
                "radial-gradient(ellipse at center, rgba(124,58,237,0.22) 0%, rgba(124,58,237,0.07) 45%, transparent 70%)",
              filter: "blur(10px)",
            }}
          />
        </div>

        <div className="relative max-w-[1180px] mx-auto">
          {/* ─── HEADER ─── */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            className="text-center mb-10"
          >
            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] px-2.5 py-1 rounded-full bg-violet-500/15 text-violet-300 border border-violet-500/25">
              <Sparkles size={11} />
              Pricing
            </span>
            <h1 className="mt-4 text-[32px] sm:text-[44px] font-extrabold tracking-tight text-white leading-[1.05]">
              Pick the plan that{" "}
              <span
                style={{
                  background:
                    "linear-gradient(90deg, #a78bfa 0%, #c4b5fd 50%, #f0abfc 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                ships your content
              </span>
            </h1>
            <p className="mt-3 text-[14.5px] sm:text-[15.5px] text-white/55 max-w-[640px] mx-auto leading-relaxed">
              Generate, cite, and publish at the cadence that fits you. All plans
              include reference-doc retrieval, citation highlights, and the full
              multi-agent pipeline.
            </p>

            {/* Monthly / Yearly toggle */}
            <div className="mt-7 inline-flex items-center gap-0.5 bg-white/[0.04] border border-white/[0.08] rounded-full p-1">
              {(["monthly", "yearly"] as Cadence[]).map((c) => (
                <button
                  key={c}
                  onClick={() => setCadence(c)}
                  className={[
                    "px-5 py-1.5 text-[13px] font-medium rounded-full transition-all duration-200",
                    cadence === c
                      ? "bg-violet-600 text-white shadow-[0_4px_20px_-6px_rgba(124,58,237,0.6)]"
                      : "text-white/55 hover:text-white",
                  ].join(" ")}
                >
                  {c === "monthly" ? "Monthly" : "Yearly"}
                  {c === "yearly" && (
                    <span className="ml-1.5 inline-flex items-center px-1.5 py-0.5 rounded-md bg-emerald-500/20 border border-emerald-500/30 text-[10px] font-semibold uppercase tracking-wider text-emerald-300">
                      -20%
                    </span>
                  )}
                </button>
              ))}
            </div>
          </motion.div>

          {/* ─── PLAN GRID ─── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 lg:gap-6 items-stretch">
            {PLANS.map((plan, idx) => {
              const Icon = plan.icon;
              const isCurrent = plan.id === currentPlanId;
              const price = cadence === "yearly" ? plan.yearlyUsd : plan.monthlyUsd;

              return (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.05 + idx * 0.07, ease: "easeOut" }}
                  className={[
                    "relative rounded-2xl p-7 flex flex-col h-full",
                    "border transition-colors",
                    plan.highlight
                      ? "border-violet-500/40 bg-gradient-to-b from-violet-500/[0.06] to-white/[0.012]"
                      : "border-white/[0.07] bg-white/[0.015] hover:border-white/15",
                  ].join(" ")}
                  style={
                    plan.highlight
                      ? {
                          boxShadow:
                            "0 0 0 1px rgba(124,58,237,0.25) inset, 0 30px 80px -30px rgba(124,58,237,0.35)",
                        }
                      : undefined
                  }
                >
                  {plan.highlight && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 px-3 py-1 rounded-full bg-violet-600 text-white text-[11px] font-bold uppercase tracking-wider shadow-[0_4px_20px_-4px_rgba(124,58,237,0.7)]">
                      <Sparkles size={11} /> Most popular
                    </span>
                  )}

                  {/* Header */}
                  <div className="flex items-center gap-2.5 mb-1.5">
                    <span
                      className={[
                        "inline-flex w-9 h-9 rounded-lg items-center justify-center border",
                        plan.highlight
                          ? "bg-violet-500/20 border-violet-500/40 text-violet-200"
                          : "bg-white/[0.04] border-white/[0.08] text-white/75",
                      ].join(" ")}
                    >
                      <Icon size={16} />
                    </span>
                    <h2 className="text-[18px] font-bold text-white">{plan.name}</h2>
                  </div>
                  <p className="text-[13px] text-white/50 mb-5">{plan.tagline}</p>

                  {/* Price */}
                  <div className="flex items-baseline gap-1.5 mb-1">
                    <span className="text-[44px] font-extrabold text-white leading-none">
                      ${formatPrice(price)}
                    </span>
                    <span className="text-[13px] text-white/40">USD</span>
                  </div>
                  <p className="text-[12.5px] text-white/45 mb-5">{cadenceCopy}</p>

                  {/* Allowance highlights */}
                  <div className="grid grid-cols-2 gap-2 mb-5">
                    <div className="rounded-xl border border-white/[0.06] bg-black/30 px-3 py-2.5">
                      <p className="text-[10.5px] uppercase tracking-wider text-white/40 font-semibold">
                        Credits
                      </p>
                      <p className="text-[15px] font-bold text-white mt-0.5">
                        {plan.credits}
                      </p>
                    </div>
                    <div className="rounded-xl border border-white/[0.06] bg-black/30 px-3 py-2.5">
                      <p className="text-[10.5px] uppercase tracking-wider text-white/40 font-semibold">
                        MCP calls
                      </p>
                      <p className="text-[15px] font-bold text-white mt-0.5">
                        {plan.mcpCalls}
                      </p>
                    </div>
                  </div>

                  <p className="text-[12.5px] text-white/55 leading-relaxed mb-4">
                    {plan.blurb}
                  </p>

                  {/* Feature list */}
                  <ul className="space-y-2 mb-7 flex-1">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-[13px] text-white/75 leading-snug">
                        <Check
                          size={14}
                          className={[
                            "mt-[3px] shrink-0",
                            plan.highlight ? "text-violet-300" : "text-emerald-400/80",
                          ].join(" ")}
                          strokeWidth={2.5}
                        />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <button
                    disabled={isCurrent}
                    className={[
                      "w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-[13.5px] font-semibold transition-all duration-200",
                      isCurrent
                        ? "bg-white/[0.06] text-white/70 border border-white/[0.1] cursor-default"
                        : plan.highlight
                          ? "bg-violet-600 hover:bg-violet-500 text-white shadow-[0_8px_30px_-8px_rgba(124,58,237,0.6)] hover:shadow-[0_8px_30px_-4px_rgba(124,58,237,0.85)]"
                          : "bg-white/[0.06] hover:bg-white/[0.1] text-white border border-white/[0.1] hover:border-white/25",
                    ].join(" ")}
                  >
                    {isCurrent ? (
                      <>
                        <Check size={14} strokeWidth={2.5} />
                        Current plan
                      </>
                    ) : (
                      <>
                        {plan.cta}
                        <ArrowRight size={14} />
                      </>
                    )}
                  </button>
                </motion.div>
              );
            })}
          </div>

          {/* ─── REASSURANCE STRIP ─── */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.35, ease: "easeOut" }}
            className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4"
          >
            <ReassureItem
              icon={ShieldCheck}
              title="Cancel anytime"
              body="No long-term contracts on Starter or Pro. Switch or cancel from billing settings."
            />
            <ReassureItem
              icon={Sparkles}
              title="Credits roll over"
              body="Unused credits from this month roll into next, up to 2× your monthly allowance."
            />
            <ReassureItem
              icon={MessageCircle}
              title="Talk to us"
              body="Enterprise needs a different shape? Ping the team — we build custom tiers."
            />
          </motion.div>

          {/* ─── FAQ-LIKE FOOTNOTES ─── */}
          <div className="mt-12 text-center text-[12px] text-white/35">
            All prices in USD. Taxes may apply based on your billing country.
            <br />
            * Enterprise "unlimited" is fair-use capped at 2,500 generations / month
            to keep the LLM provider happy; we'll reach out if you approach the line.
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

/* ── Small subcomponent for the reassurance row ─────────────────────────── */
function ReassureItem({
  icon: Icon,
  title,
  body,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.015] p-4">
      <div className="flex items-center gap-2 mb-1.5">
        <Icon size={14} className="text-violet-300" />
        <h3 className="text-[13px] font-semibold text-white">{title}</h3>
      </div>
      <p className="text-[12.5px] text-white/55 leading-relaxed">{body}</p>
    </div>
  );
}
