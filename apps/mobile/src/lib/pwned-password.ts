import * as Crypto from "expo-crypto";
import { checkPwnedPasswordByHash, type PwnedPasswordResult } from "@evensplit/shared";

/**
 * Free stand-in for Supabase's Pro-only leaked-password-protection: hashes
 * the password locally (expo-crypto, never leaves the device) and checks it
 * against HaveIBeenPwned via k-anonymity. See packages/shared/pwnedPassword.ts.
 */
export async function isPasswordPwned(password: string): Promise<PwnedPasswordResult> {
  const hash = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA1, password, {
    encoding: Crypto.CryptoEncoding.HEX,
  });
  return checkPwnedPasswordByHash(hash.toUpperCase());
}
