import { checkPwnedPasswordByHash, type PwnedPasswordResult } from "@evensplit/shared";

async function sha1Hex(text: string): Promise<string> {
  const data = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest("SHA-1", data);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase();
}

/**
 * Free stand-in for Supabase's Pro-only leaked-password-protection: hashes
 * the password locally (Web Crypto, never leaves the browser) and checks it
 * against HaveIBeenPwned via k-anonymity. See packages/shared/pwnedPassword.ts.
 */
export async function isPasswordPwned(password: string): Promise<PwnedPasswordResult> {
  const hash = await sha1Hex(password);
  return checkPwnedPasswordByHash(hash);
}
