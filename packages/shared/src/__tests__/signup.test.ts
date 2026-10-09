import { describe, expect, it } from "vitest";
import { signupHitExistingAccount } from "../signup";

describe("signupHitExistingAccount", () => {
  it("flags the empty-identities response Supabase returns for an existing email", () => {
    expect(signupHitExistingAccount({ identities: [] })).toBe(true);
  });
  it("does not flag a genuinely new account", () => {
    expect(signupHitExistingAccount({ identities: [{ id: "x" }] })).toBe(false);
    expect(signupHitExistingAccount({})).toBe(false);
    expect(signupHitExistingAccount(null)).toBe(false);
  });
});
