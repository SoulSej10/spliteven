import { Alert } from "react-native";
import { router } from "expo-router";
import { PLAN_FEATURE_COPY, planLimitFeatureFromError, type PlanFeature } from "@evensplit/shared";

export function showUpgradePrompt(feature: PlanFeature) {
  const copy = PLAN_FEATURE_COPY[feature];
  Alert.alert(copy.title, copy.message, [
    { text: "Not now", style: "cancel" },
    { text: "See plans", onPress: () => router.push("/(app)/upgrade") },
  ]);
}

/** Shows the upgrade prompt if `error` is a server plan-limit rejection; returns whether it handled it. */
export function handlePlanLimitError(error: unknown): boolean {
  const feature = planLimitFeatureFromError(error);
  if (!feature) return false;
  showUpgradePrompt(feature);
  return true;
}
