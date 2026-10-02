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
      "Priority settle-up suggestions",
    ],
  },
  premium: {
    tier: "premium",
    name: "Premium",
    priceLabel: "₱199/month",
    priceValue: 199,
    features: [
      "Everything in Pro",
      "Multi-currency per group",
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
