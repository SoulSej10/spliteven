import { toast } from "sonner";
import { PLAN_FEATURE_COPY, planLimitFeatureFromError, type PlanFeature } from "@evensplit/shared";

export function showUpgradePrompt(feature: PlanFeature, navigate: (path: string) => void) {
  const copy = PLAN_FEATURE_COPY[feature];
  toast(copy.title, {
    description: copy.message,
    action: { label: "See plans", onClick: () => navigate("/upgrade") },
  });
}

/** Shows the upgrade prompt if `error` is a server plan-limit rejection; returns whether it handled it. */
export function handlePlanLimitError(error: unknown, navigate: (path: string) => void): boolean {
  const feature = planLimitFeatureFromError(error);
  if (!feature) return false;
  showUpgradePrompt(feature, navigate);
  return true;
}
