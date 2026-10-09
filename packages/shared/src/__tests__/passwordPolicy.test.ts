import { describe, expect, it } from "vitest";
import { describeWeakPassword } from "../passwordPolicy";

const LOWER = "abcdefghijklmnopqrstuvwxyz";
const UPPER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const DIGITS = "0123456789";

describe("describeWeakPassword", () => {
  it("explains the full default policy", () => {
    const msg = `Password should contain at least one character of each: ${LOWER}, ${UPPER}, ${DIGITS}, !@#$%^&*()_+-=[]{};':"|<>?,./\`~.`;
    expect(describeWeakPassword(msg)).toBe(
      "Your password needs at least a lowercase letter, a capital letter, a number and a symbol (such as ! @ # $ %)."
    );
  });

  it("names the exact symbol when the server only accepts one", () => {
    const msg = `Password should contain at least one character of each: ${LOWER}, ${UPPER}, ${DIGITS}, @`;
    expect(describeWeakPassword(msg)).toBe(
      "Your password needs at least a lowercase letter, a capital letter, a number and one of these symbols: @."
    );
  });

  it("ignores other errors", () => {
    expect(describeWeakPassword("Invalid login credentials")).toBeNull();
    expect(describeWeakPassword(null)).toBeNull();
  });
});
