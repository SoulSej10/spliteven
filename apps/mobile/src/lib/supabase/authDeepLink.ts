import { getSupabaseClient } from "./client";

/**
 * Supabase's email-confirmation and OAuth redirect links carry the session
 * as a URL hash fragment (#access_token=...&refresh_token=...&type=signup),
 * not a query string - the client is created with `detectSessionInUrl:
 * false`, so nothing establishes that session automatically. This pulls
 * the tokens out of the fragment and sets the session directly, letting
 * `useAuth`'s onAuthStateChange listener take it from there.
 */
export async function applyAuthCallbackUrl(url: string): Promise<boolean> {
  const hashIndex = url.indexOf("#");
  if (hashIndex === -1) return false;

  const params = new URLSearchParams(url.slice(hashIndex + 1));
  const access_token = params.get("access_token");
  const refresh_token = params.get("refresh_token");
  if (!access_token || !refresh_token) return false;

  const supabase = getSupabaseClient();
  const { error } = await supabase.auth.setSession({ access_token, refresh_token });
  return !error;
}

/** True when the link's fragment reports a failure (expired, already used...) instead of tokens. */
export function deepLinkReportsError(url: string): boolean {
  const hashIndex = url.indexOf("#");
  if (hashIndex === -1) return false;
  const params = new URLSearchParams(url.slice(hashIndex + 1));
  return params.has("error") || params.has("error_code");
}

// The newest deep link the app received. A screen opened by a link mounts after
// the link event has already fired, so it reads the link from here instead of
// racing the event. Registered once from the root layout.
let lastLink: { url: string; at: number } | null = null;

export function rememberDeepLink(url: string) {
  lastLink = { url, at: Date.now() };
}

/** The most recent deep link, if it arrived within `maxAgeMs`. */
export function recentDeepLink(maxAgeMs = 120_000): string | null {
  return lastLink && Date.now() - lastLink.at <= maxAgeMs ? lastLink.url : null;
}
