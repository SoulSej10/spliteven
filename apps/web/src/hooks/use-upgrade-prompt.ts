"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import type { PlanFeature } from "@evensplit/shared";
import { handlePlanLimitError, showUpgradePrompt } from "@/lib/plan-prompt";

/** Upgrade prompts wired to the Next router, so "See plans" navigates client-side. */
export function useUpgradePrompt() {
  const router = useRouter();
  return useMemo(() => {
    const navigate = (path: string) => router.push(path);
    return {
      showUpgradePrompt: (feature: PlanFeature) => showUpgradePrompt(feature, navigate),
      handlePlanLimitError: (error: unknown) => handlePlanLimitError(error, navigate),
    };
  }, [router]);
}
