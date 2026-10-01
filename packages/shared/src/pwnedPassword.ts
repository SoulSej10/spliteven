export interface PwnedPasswordResult {
  /** True if this password's hash appears in the HaveIBeenPwned breach corpus. */
  pwned: boolean;
  /** How many times it's been seen across known breaches (0 when not pwned). */
  count: number;
}

/**
 * Checks a password against the HaveIBeenPwned "Pwned Passwords" API using
 * k-anonymity: callers pass the password's uppercase-hex SHA-1 digest (never
 * the raw password), and only the first 5 characters of that hash are ever
 * sent over the network. HIBP returns every suffix sharing that prefix; we
 * match the remainder locally, so the full hash - and the real password -
 * never leaves the caller.
 *
 * Free, no API key, no account - this is the same public data source
 * Supabase's own (Pro-plan-only) leaked-password-protection feature uses,
 * reimplemented client-side since that feature isn't available on the free
 * tier. SHA-1 hashing is intentionally left to the caller: it's computed
 * differently on web (Web Crypto) vs. React Native (expo-crypto), so this
 * function stays platform-agnostic and easy to unit test.
 */
export async function checkPwnedPasswordByHash(sha1HexUppercase: string): Promise<PwnedPasswordResult> {
  const prefix = sha1HexUppercase.slice(0, 5);
  const suffix = sha1HexUppercase.slice(5);

  const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`, {
    headers: { "Add-Padding": "true" },
  });
  if (!response.ok) {
    throw new Error(`Pwned Passwords API returned ${response.status}`);
  }

  const text = await response.text();
  for (const line of text.split("\n")) {
    const [hashSuffix, count] = line.trim().split(":");
    if (hashSuffix === suffix) {
      return { pwned: true, count: Number(count) || 0 };
    }
  }
  return { pwned: false, count: 0 };
}
