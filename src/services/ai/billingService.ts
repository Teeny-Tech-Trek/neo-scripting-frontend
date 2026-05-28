// Billing service — talks to FastAPI /billing/*. FastAPI in turn talks to
// the central TTT payment service over HTTP and receives a webhook callback
// when Razorpay confirms capture. This client never talks to TTT directly.

import { aiFetch } from "./aiClient";

export type BillingPlanOption = {
  id: "starter" | "pro" | "enterprise";
  name: string;
  credits: number;
  daily_mcp_limit: number;
  competitor_research: boolean;
  max_brands: number;
  max_docs_per_brand: number;
  ttt_plan_id: string | null;
  price: number | null;         // paise
  currency: string | null;
  formatted_price: string | null;
  purchasable: boolean;
};

export type BillingPlansResponse = {
  plans: BillingPlanOption[];
  razorpay_key_id: string | null;
};

export type UserPlanSnapshot = {
  plan_id: string;
  plan_name: string;
  monthly_credits: number;      // == credits_per_purchase under the top-up model
  daily_mcp_limit: number;
  competitor_research: boolean;
  max_brands: number;
  max_docs_per_brand: number;
  balance: number;              // lifetime — credits don't expire
  used_this_period: number;
  period_end: string;           // always "" under top-up
  unlimited: boolean;
  last_purchased_plan_id: string | null;
  last_purchased_at: string | null;
};

export type CreateOrderResponse = {
  payment_id: string;
  order_id: string;
  amount: number;
  currency: string;
  razorpay_key: string;
  plan_slug: string;
};

export type VerifyPaymentResponse = {
  payment_id: string;
  status: "pending" | "paid" | "failed";
  amount?: number | null;
  currency?: string | null;
};

export const billingService = {
  listPlans: () => aiFetch<BillingPlansResponse>("/billing/plans"),

  getMyPlan: () => aiFetch<UserPlanSnapshot>("/user/plan"),

  createOrder: (planSlug: BillingPlanOption["id"]) =>
    aiFetch<CreateOrderResponse>("/billing/create-order", {
      method: "POST",
      body: JSON.stringify({ plan_slug: planSlug }),
    }),

  verifyPayment: (paymentId: string) =>
    aiFetch<VerifyPaymentResponse>("/billing/verify-payment", {
      method: "POST",
      body: JSON.stringify({ payment_id: paymentId }),
    }),
};
