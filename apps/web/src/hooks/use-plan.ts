"use client";

import { useMemo } from "react";
import { effectiveTier, canJoinAnotherGroup, planAllows, type PlanFeature } from "@evensplit/shared";
import { useAuth } from "@/hooks/use-auth";
import { useMyGroups } from "@/hooks/use-groups";

export function usePlan() {
  const { authUser, profile } = useAuth();
  const { data: groups } = useMyGroups();
  const tier = effectiveTier(profile?.subscription_tier, authUser?.email);

  return useMemo(() => {
    const activeGroupCount = (groups ?? []).filter((g) => !g.archived_at).length;
    return {
      tier,
      activeGroupCount,
      canAddGroup: canJoinAnotherGroup(tier, activeGroupCount),
      allows: (feature: Exclude<PlanFeature, "groups">) => planAllows(tier, feature),
    };
  }, [tier, groups]);
}
