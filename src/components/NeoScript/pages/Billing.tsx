import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  Check, Sparkles, Zap, Crown, ArrowRight, ShieldCheck, MessageCircle,
  Loader2,
} from "lucide-react";
import Navbar from "../Navbar";
import Footer from "../Footer";
import {
  billingService,
  type BillingPlanOption,
  type UserPlanSnapshot,
} from "../../../services/ai/billingService";
import { ApiError } from "../../../services/ai/aiClient";
import { useCredits } from "../../../context/CreditsContext";

/* ════════════════════════════════════════════════════════════════════════
   BILLING PAGE — three-tier pricing wired to the central TTT billing
   service via FastAPI. Visuals unchanged from the presentational version;
   data + the purchase flow are real.
   ════════════════════════════════════════════════════════════════════════ */

type PlanPresentation = {
  tagline: string;
  blurb: string;
  features: string[];
  cta: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  highlight?: boolean;
};

const PRESENTATION: Record<BillingPlanOption["id"], PlanPresentation> = {
  starter: {
    tagline: "For solo creators kicking the tires",
    blurb: "Everything you need to ship a handful of polished posts.",
    features: [
      "Top-up credit bundle — never expires",
      "MCP access for Claude / Cursor",
      "Up to 3 brands",
      "5 reference docs per brand",
      "Inline citations + keyword highlights",
      "Generation history & retry",
      "Community support",
    ],
    cta: "Start with Starter",
    icon: Sparkles,
  },
  pro: {
    tagline: "For operators shipping daily",
    blurb: "Adds competitor research, more brands, and faster MCP.",
    features: [
      "5× the credits of Starter",
      "Higher daily MCP cap",
      "Unlimited brands",
      "25 reference docs per brand",
      "Competitor research pipeline",
      "Per-document citation tracking",
      "Email support, < 24h response",
    ],
    cta: "Go Pro",
    highlight: true,
    icon: Zap,
  },
  enterprise: {
    tagline: "For teams running this in production",
    blurb: "Generous limits, team seats, and a reliability layer.",
    features: [
      "Largest credit bundle — fair-use unlimited generations",
      "Unlimited MCP calls",
      "Unlimited brands & docs",
      "SSO + audit log",
      "Dedicated Slack channel",
      "SLA-backed uptime",
    ],
    cta: "Buy Enterprise",
    icon: Crown,
  },
};

// Razorpay Checkout.js is loaded on demand from CDN. We add a single script
// tag the first time someone clicks "Buy" and reuse window.Razorpay after.
declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => { open: () => void };
  }
}

type RazorpayOptions = {
  key: string;
  amount: number;
  currency: string;
  order_id: string;
  name: string;
  description: string;
  prefill?: { email?: string; contact?: string; name?: string };
  notes?: Record<string, string>;
  theme?: { color?: string };
  handler?: (response: { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string }) => void;
  modal?: { ondismiss?: () => void };
};

const RAZORPAY_SCRIPT_URL = "https://checkout.razorpay.com/v1/checkout.js";

const loadRazorpay = (): Promise<boolean> =>
  new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const s = document.createElement("script");
    s.src = RAZORPAY_SCRIPT_URL;
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.head.appendChild(s);
  });

export default function Billing() {
  const [plans, setPlans] = useState<BillingPlanOption[] | null>(null);
  const [userPlan, setUserPlan] = useState<UserPlanSnapshot | null>(null);
  const [razorpayKey, setRazorpayKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [purchasingId, setPurchasingId] = useState<BillingPlanOption["id"] | null>(null);
  const [flash, setFlash] = useState<{ kind: "ok" | "err"; msg: string } | null>(null);
  const credits = useCredits();

  // Don't double-fire the initial load if React StrictMode mounts twice in dev.
  const loadedRef = useRef(false);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const [plansResp, planSnap] = await Promise.all([
        billingService.listPlans(),
        billingService.getMyPlan(),
      ]);
      setPlans(plansResp.plans);
      setRazorpayKey(plansResp.razorpay_key_id);
      setUserPlan(planSnap);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to load billing data.";
      setLoadError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (loadedRef.current) return;
    loadedRef.current = true;
    loadAll();
  }, [loadAll]);

  const handlePurchase = useCallback(async (planId: BillingPlanOption["id"]) => {
    setFlash(null);
    setPurchasingId(planId);
    try {
      const ok = await loadRazorpay();
      if (!ok || !window.Razorpay) {
        throw new Error("Couldn't load Razorpay checkout. Check your connection and try again.");
      }
      const order = await billingService.createOrder(planId);
      const rzpKey = order.razorpay_key || razorpayKey;
      if (!rzpKey) {
        throw new Error("Razorpay key missing — server isn't configured for checkout yet.");
      }

      const opts: RazorpayOptions = {
        key: rzpKey,
        amount: order.amount,
        currency: order.currency,
        order_id: order.order_id,
        name: "Neo Script",
        description: `${planId.charAt(0).toUpperCase() + planId.slice(1)} credit bundle`,
        theme: { color: "#7c3aed" },
        handler: async (_resp) => {
          // Synchronous UX poll. The authoritative state flip happens on the
          // server-side webhook from TTT; this is just so the user doesn't see
          // a stale "free" plan while the webhook lands.
          try {
            const verify = await billingService.verifyPayment(order.payment_id);
            if (verify.status === "paid") {
              setFlash({ kind: "ok", msg: "Payment confirmed — credits added to your account." });
            } else if (verify.status === "failed") {
              setFlash({ kind: "err", msg: "Payment failed. Please try again or use a different card." });
            } else {
              setFlash({ kind: "ok", msg: "Payment received. Credits will appear in a few seconds…" });
            }
          } catch (e) {
            // Verify failed but Razorpay says payment_id exists — the webhook
            // will still credit on its own. Reassure the user.
            setFlash({ kind: "ok", msg: "Payment received. Credits will appear in a few seconds…" });
          }
          // Refresh balance + last-purchased state — locally for this page,
          // and globally so the navbar pill updates immediately.
          loadAll();
          credits.refresh();
        },
        modal: {
          ondismiss: () => {
            setPurchasingId(null);
          },
        },
      };

      const rzp = new window.Razorpay(opts);
      rzp.open();
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : (e instanceof Error ? e.message : "Purchase failed.");
      setFlash({ kind: "err", msg });
    } finally {
      setPurchasingId(null);
    }
  }, [loadAll, razorpayKey, credits]);

  // ─── Compose card rows. Iterate in canonical order even if API order differs. ─
  const orderedPlans = useMemo(() => {
    if (!plans) return null;
    const byId: Record<string, BillingPlanOption> = {};
    for (const p of plans) byId[p.id] = p;
    return (["starter", "pro", "enterprise"] as BillingPlanOption["id"][])
      .map((id) => byId[id])
      .filter(Boolean);
  }, [plans]);

  const currentPlanId = userPlan?.last_purchased_plan_id ?? null;

  return (
    <div className="min-h-screen flex flex-col bg-bg-base pt-10">
      <Navbar />

      <main className="relative flex-1 px-4 sm:px-6 pt-12 pb-16 overflow-hidden">
        {/* Ambient violet glow */}
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
              Generate, cite, and publish at the cadence that fits you. Credits
              never expire — when you run low, top up.
            </p>
          </motion.div>

          {/* ─── BALANCE PANEL ─── */}
          {userPlan && (
            <div className="mb-8 grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-[820px] mx-auto">
              <BalanceCell label="Current plan" value={userPlan.plan_name} />
              <BalanceCell label="Credit balance" value={userPlan.unlimited ? "Unlimited" : `${userPlan.balance}`} />
              <BalanceCell label="Used so far" value={`${userPlan.used_this_period}`} />
            </div>
          )}

          {/* ─── FLASH MESSAGE ─── */}
          {flash && (
            <div
              className={[
                "mb-6 text-center text-[13px] rounded-xl border px-4 py-2.5 mx-auto max-w-[680px]",
                flash.kind === "ok"
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-200"
                  : "border-red-500/30 bg-red-500/10 text-red-200",
              ].join(" ")}
            >
              {flash.msg}
            </div>
          )}

          {/* ─── ERROR / LOADING ─── */}
          {loading && (
            <div className="flex items-center justify-center py-14 text-white/55 text-sm">
              <Loader2 className="animate-spin mr-2" size={14} /> Loading plans…
            </div>
          )}
          {!loading && loadError && (
            <div className="mb-8 mx-auto max-w-[680px] text-center text-[13px] rounded-xl border border-red-500/30 bg-red-500/10 text-red-200 px-4 py-2.5">
              {loadError}{" "}
              <button onClick={loadAll} className="underline ml-2">retry</button>
            </div>
          )}

          {/* ─── PLAN GRID ─── */}
          {!loading && orderedPlans && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 lg:gap-6 items-stretch">
              {orderedPlans.map((plan, idx) => {
                const pres = PRESENTATION[plan.id];
                const Icon = pres.icon;
                const isCurrent = plan.id === currentPlanId;
                const isPurchasing = purchasingId === plan.id;
                const priceLabel = plan.formatted_price || (plan.purchasable ? "—" : "Unavailable");

                return (
                  <motion.div
                    key={plan.id}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.05 + idx * 0.07, ease: "easeOut" }}
                    className={[
                      "relative rounded-2xl p-7 flex flex-col h-full",
                      "border transition-colors",
                      pres.highlight
                        ? "border-violet-500/40 bg-gradient-to-b from-violet-500/[0.06] to-white/[0.012]"
                        : "border-white/[0.07] bg-white/[0.015] hover:border-white/15",
                    ].join(" ")}
                    style={
                      pres.highlight
                        ? {
                            boxShadow:
                              "0 0 0 1px rgba(124,58,237,0.25) inset, 0 30px 80px -30px rgba(124,58,237,0.35)",
                          }
                        : undefined
                    }
                  >
                    {pres.highlight && (
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 px-3 py-1 rounded-full bg-violet-600 text-white text-[11px] font-bold uppercase tracking-wider shadow-[0_4px_20px_-4px_rgba(124,58,237,0.7)]">
                        <Sparkles size={11} /> Most popular
                      </span>
                    )}

                    {/* Header */}
                    <div className="flex items-center gap-2.5 mb-1.5">
                      <span
                        className={[
                          "inline-flex w-9 h-9 rounded-lg items-center justify-center border",
                          pres.highlight
                            ? "bg-violet-500/20 border-violet-500/40 text-violet-200"
                            : "bg-white/[0.04] border-white/[0.08] text-white/75",
                        ].join(" ")}
                      >
                        <Icon size={16} />
                      </span>
                      <h2 className="text-[18px] font-bold text-white">{plan.name}</h2>
                    </div>
                    <p className="text-[13px] text-white/50 mb-5">{pres.tagline}</p>

                    {/* Price */}
                    <div className="flex items-baseline gap-1.5 mb-1">
                      <span className="text-[44px] font-extrabold text-white leading-none">
                        {priceLabel}
                      </span>
                      {plan.currency && (
                        <span className="text-[13px] text-white/40">{plan.currency}</span>
                      )}
                    </div>
                    <p className="text-[12.5px] text-white/45 mb-5">one-time top-up</p>

                    {/* Allowance highlights */}
                    <div className="grid grid-cols-2 gap-2 mb-5">
                      <div className="rounded-xl border border-white/[0.06] bg-black/30 px-3 py-2.5">
                        <p className="text-[10.5px] uppercase tracking-wider text-white/40 font-semibold">
                          Credits
                        </p>
                        <p className="text-[15px] font-bold text-white mt-0.5">
                          {plan.id === "enterprise" ? `${plan.credits} (fair use)` : `${plan.credits}`}
                        </p>
                      </div>
                      <div className="rounded-xl border border-white/[0.06] bg-black/30 px-3 py-2.5">
                        <p className="text-[10.5px] uppercase tracking-wider text-white/40 font-semibold">
                          MCP / day
                        </p>
                        <p className="text-[15px] font-bold text-white mt-0.5">
                          {plan.daily_mcp_limit >= 9999 ? "Unlimited" : plan.daily_mcp_limit}
                        </p>
                      </div>
                    </div>

                    <p className="text-[12.5px] text-white/55 leading-relaxed mb-4">
                      {pres.blurb}
                    </p>

                    {/* Feature list */}
                    <ul className="space-y-2 mb-7 flex-1">
                      {pres.features.map((f) => (
                        <li key={f} className="flex items-start gap-2 text-[13px] text-white/75 leading-snug">
                          <Check
                            size={14}
                            className={[
                              "mt-[3px] shrink-0",
                              pres.highlight ? "text-violet-300" : "text-emerald-400/80",
                            ].join(" ")}
                            strokeWidth={2.5}
                          />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>

                    {/* CTA */}
                    <button
                      disabled={!plan.purchasable || isPurchasing}
                      onClick={() => handlePurchase(plan.id)}
                      className={[
                        "w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-[13.5px] font-semibold transition-all duration-200",
                        !plan.purchasable
                          ? "bg-white/[0.04] text-white/40 border border-white/[0.06] cursor-not-allowed"
                          : pres.highlight
                            ? "bg-violet-600 hover:bg-violet-500 text-white shadow-[0_8px_30px_-8px_rgba(124,58,237,0.6)] hover:shadow-[0_8px_30px_-4px_rgba(124,58,237,0.85)]"
                            : "bg-white/[0.06] hover:bg-white/[0.1] text-white border border-white/[0.1] hover:border-white/25",
                      ].join(" ")}
                    >
                      {isPurchasing ? (
                        <>
                          <Loader2 size={14} className="animate-spin" />
                          Opening checkout…
                        </>
                      ) : !plan.purchasable ? (
                        <>Unavailable</>
                      ) : isCurrent ? (
                        <>
                          {pres.cta} again
                          <ArrowRight size={14} />
                        </>
                      ) : (
                        <>
                          {pres.cta}
                          <ArrowRight size={14} />
                        </>
                      )}
                    </button>
                    {isCurrent && (
                      <p className="mt-2 text-center text-[11.5px] text-violet-300/80">
                        Last purchased plan
                      </p>
                    )}
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* ─── REASSURANCE STRIP ─── */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.35, ease: "easeOut" }}
            className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4"
          >
            <ReassureItem
              icon={ShieldCheck}
              title="Pay only when you need"
              body="No subscriptions. Buy a credit bundle, use it at your pace, top up when you run low."
            />
            <ReassureItem
              icon={Sparkles}
              title="Credits never expire"
              body="Your balance is yours forever. Take a month off and your credits are waiting."
            />
            <ReassureItem
              icon={MessageCircle}
              title="Talk to us"
              body="Enterprise needs a different shape? Ping the team — we build custom tiers."
            />
          </motion.div>

          {/* ─── FOOTNOTES ─── */}
          <div className="mt-12 text-center text-[12px] text-white/35">
            Payments processed by Razorpay. Taxes may apply based on your billing country.
            <br />
            * Enterprise "unlimited" is fair-use capped to keep the LLM provider happy;
            we'll reach out if you approach the line.
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

/* ── Small subcomponents ─────────────────────────────────────────────────── */
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

function BalanceCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] px-4 py-3">
      <p className="text-[10.5px] uppercase tracking-wider text-white/40 font-semibold">{label}</p>
      <p className="text-[18px] font-bold text-white mt-0.5">{value}</p>
    </div>
  );
}
