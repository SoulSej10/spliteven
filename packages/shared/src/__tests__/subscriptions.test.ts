import { describe, expect, it } from "vitest";
import {
  PLAN_LIMITS,
  SUBSCRIPTION_ADMIN_EMAIL,
  canJoinAnotherGroup,
  effectiveTier,
  planAllows,
  planLimitFeatureFromError,
} from "../subscriptions";

describe("plan limits", () => {
  it("caps Free at 2 active groups and leaves paid plans unlimited", () => {
    expect(canJoinAnotherGroup("free", 0)).toBe(true);
    expect(canJoinAnotherGroup("free", 1)).toBe(true);
    expect(canJoinAnotherGroup("free", 2)).toBe(false);
    expect(canJoinAnotherGroup("free", 5)).toBe(false);
    expect(canJoinAnotherGroup("pro", 50)).toBe(true);
    expect(canJoinAnotherGroup("premium", 50)).toBe(true);
  });

  it("gates features by tier", () => {
    expect(planAllows("free", "receipts")).toBe(false);
    expect(planAllows("free", "insights")).toBe(false);
    expect(planAllows("free", "recurringExpenses")).toBe(false);
    expect(planAllows("pro", "receipts")).toBe(true);
    expect(planAllows("pro", "insights")).toBe(true);
    expect(planAllows("pro", "recurringExpenses")).toBe(false);
    expect(planAllows("premium", "recurringExpenses")).toBe(true);
  });

  it("only ever widens access as the tier goes up", () => {
    for (const feature of ["receipts", "insights", "recurringExpenses"] as const) {
      if (PLAN_LIMITS.free[feature]) expect(PLAN_LIMITS.pro[feature]).toBe(true);
      if (PLAN_LIMITS.pro[feature]) expect(PLAN_LIMITS.premium[feature]).toBe(true);
    }
  });

  it("treats the owner account as premium and defaults unknown tiers to free", () => {
    expect(effectiveTier("free", SUBSCRIPTION_ADMIN_EMAIL, true)).toBe("premium");
    expect(effectiveTier("pro", "someone@example.com", true)).toBe("pro");
    expect(effectiveTier(undefined, null, true)).toBe("free");
    expect(effectiveTier("free", "someone@example.com", false)).toBe("premium");
  });

  it("maps server plan_limit errors to features", () => {
    expect(planLimitFeatureFromError(new Error("plan_limit:groups"))).toBe("groups");
    expect(planLimitFeatureFromError({ message: "plan_limit:receipts" })).toBe("receipts");
    expect(planLimitFeatureFromError({ message: "plan_limit:recurring" })).toBe("recurringExpenses");
    expect(planLimitFeatureFromError(new Error("something else"))).toBeNull();
    expect(planLimitFeatureFromError(null)).toBeNull();
  });
});
