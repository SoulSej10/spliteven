import * as WebBrowser from "expo-web-browser";
import { getSupabaseClient } from "@/lib/supabase/client";
import { applyAuthCallbackUrl } from "@/lib/supabase/authDeepLink";

const REDIRECT_URL = "evensplit://auth/callback";

/**
 * "Continue with Google": opens Supabase's Google OAuth page in an in-app browser
 * and, when it redirects back to evensplit://auth/callback, turns the token
 * fragment into a session. Returns "success", "cancelled", or an error message.
 */
export async function signInWithGoogle(): Promise<"success" | "cancelled" | { error: string }> {
  const { data, error } = await getSupabaseClient().auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: REDIRECT_URL, skipBrowserRedirect: true },
  });
  if (error || !data.url) return { error: error?.message ?? "Could not start Google sign-in." };

  const result = await WebBrowser.openAuthSessionAsync(data.url, REDIRECT_URL);
  if (result.type !== "success") return "cancelled";
  const ok = await applyAuthCallbackUrl(result.url);
  return ok ? "success" : { error: "Google sign-in did not finish. Please try again." };
}
