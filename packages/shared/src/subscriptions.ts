import type { SubscriptionPaymentMethod, SubscriptionTier } from "./types";

// Matches the `public.is_admin()` check in supabase/migrations/0020_subscriptions.sql.
export const SUBSCRIPTION_ADMIN_EMAIL = "jesstahil10@gmail.com";

export interface SubscriptionPlanInfo {
  tier: SubscriptionTier;
  name: string;
  priceLabel: string;
  priceValue: number;
  features: string[];
}

export const SUBSCRIPTION_PLANS: Record<SubscriptionTier, SubscriptionPlanInfo> = {
  free: {
    tier: "free",
    name: "Free",
    priceLabel: "₱0",
    priceValue: 0,
    features: [
      "Up to 2 active groups",
      "Personal accounts, budgets, and transactions",
      "CSV export",
    ],
  },
  pro: {
    tier: "pro",
    name: "Pro",
    priceLabel: "₱99/month",
    priceValue: 99,
    features: [
      "Unlimited groups",
      "Receipt photo attachments",
      "Spending insights (charts + calendar)",
    ],
  },
  premium: {
    tier: "premium",
    name: "Premium",
    priceLabel: "₱199/month",
    priceValue: 199,
    features: [
      "Everything in Pro",
      "Recurring expense automation",
      "Early access to new features",
    ],
  },
};

export const PAYABLE_PLANS = ["pro", "premium"] as const;

export interface PaymentMethodInfo {
  id: SubscriptionPaymentMethod;
  label: string;
  accountName: string;
  accountNumber: string;
}

export const PAYMENT_METHODS: Record<SubscriptionPaymentMethod, PaymentMethodInfo> = {
  gcash: {
    id: "gcash",
    label: "GCash",
    accountName: "Jess Anthony Tahil",
    accountNumber: "09911997675",
  },
  maya: {
    id: "maya",
    label: "Maya",
    accountName: "Jess Anthony Tahil",
    accountNumber: "802489448893",
  },
  bdo: {
    id: "bdo",
    label: "BDO",
    accountName: "Jess Anthony Tahil",
    accountNumber: "003440460856",
  },
  maribank: {
    id: "maribank",
    label: "Maribank",
    accountName: "Jess Anthony Tahil",
    accountNumber: "17545279960",
  },
};

export interface PlanLimits {
  /** Max non-archived groups a member can belong to; null means unlimited. Mirrors enforce_group_limit() in migration 0021. */
  maxActiveGroups: number | null;
  receipts: boolean;
  insights: boolean;
  recurringExpenses: boolean;
}

export const PLAN_LIMITS: Record<SubscriptionTier, PlanLimits> = {
  free: { maxActiveGroups: 2, receipts: false, insights: false, recurringExpenses: false },
  pro: { maxActiveGroups: null, receipts: true, insights: true, recurringExpenses: false },
  premium: { maxActiveGroups: null, receipts: true, insights: true, recurringExpenses: true },
};

export type PlanFeature = "receipts" | "insights" | "recurringExpenses" | "groups";

/**
 * Master switch for subscription plans. While false, every account gets every
 * feature and the plan UI (upgrade banner, pricing) is hidden. Flip to true
 * together with re-applying the real tier_of() from migration 0021 - the
 * database side is switched off by migration 0022.
 */
export const PLANS_ENABLED = false;

/** The owner account always has every feature, matching tier_of() in migration 0021. */
export function effectiveTier(
  tier: SubscriptionTier | null | undefined,
  email?: string | null,
  plansEnabled: boolean = PLANS_ENABLED
): SubscriptionTier {
  if (!plansEnabled) return "premium";
  if (email && email === SUBSCRIPTION_ADMIN_EMAIL) return "premium";
  return tier ?? "free";
}

export function planAllows(tier: SubscriptionTier, feature: Exclude<PlanFeature, "groups">): boolean {
  return PLAN_LIMITS[tier][feature];
}

export function canJoinAnotherGroup(tier: SubscriptionTier, activeGroupCount: number): boolean {
  const max = PLAN_LIMITS[tier].maxActiveGroups;
  return max === null || activeGroupCount < max;
}

export const PLAN_FEATURE_COPY: Record<
  PlanFeature,
  { required: Exclude<SubscriptionTier, "free">; title: string; message: string }
> = {
  groups: {
    required: "pro",
    title: "Group limit reached",
    message: "The Free plan includes up to 2 active groups. Upgrade to Pro for unlimited groups.",
  },
  receipts: {
    required: "pro",
    title: "Receipt photos are a Pro feature",
    message: "Upgrade to Pro to attach receipt photos to your expenses.",
  },
  insights: {
    required: "pro",
    title: "Insights is a Pro feature",
    message: "Upgrade to Pro to see your spending charts and calendar.",
  },
  recurringExpenses: {
    required: "premium",
    title: "Recurring expenses are a Premium feature",
    message: "Upgrade to Premium to automate rent, subscriptions, and other repeating bills.",
  },
};

const PLAN_LIMIT_ERROR_TO_FEATURE: Record<string, PlanFeature> = {
  groups: "groups",
  receipts: "receipts",
  recurring: "recurringExpenses",
};

/** Maps a server "plan_limit:<name>" error (raised by the migration 0021 triggers) to the feature it refers to. */
export function planLimitFeatureFromError(error: unknown): PlanFeature | null {
  const message =
    error instanceof Error
      ? error.message
      : typeof error === "object" && error !== null && "message" in error
        ? String((error as { message: unknown }).message)
        : "";
  const match = /plan_limit:(\w+)/.exec(message);
  return match ? (PLAN_LIMIT_ERROR_TO_FEATURE[match[1]] ?? null) : null;
}
