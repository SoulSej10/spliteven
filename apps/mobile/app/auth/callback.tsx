import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { Text } from "@/components/ui/typography";
import { router } from "expo-router";
import * as Linking from "expo-linking";
import { applyAuthCallbackUrl, recentDeepLink } from "@/lib/supabase/authDeepLink";
import { palette } from "@/theme/palette";

/**
 * Landing target for Supabase email-confirmation and OAuth redirect links
 * (evensplit://auth/callback#access_token=...). Establishes the session
 * from the URL's token fragment, then hands off to the root SplashGate
 * (app/index.tsx) to route based on the now-authenticated state. Handles
 * both a cold start (link tapped while the app wasn't running) and a warm
 * one (app already running/backgrounded).
 *
 * Previously this screen could get stuck on its own spinner forever: if
 * applyAuthCallbackUrl threw (or no URL/token ever arrived - e.g. expo-
 * router's own linking handling races with a manual getInitialURL() call),
 * the unhandled rejection just left the screen showing its ActivityIndicator
 * with nothing to navigate away from it. Every path now always resolves to
 * router.replace("/") - on failure SplashGate correctly falls through to the
 * login screen instead of leaving the user stuck - and a timeout guarantees
 * that even if no URL/event ever arrives at all.
 */
export default function AuthCallbackScreen() {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let settled = false;

    function finish(success: boolean) {
      if (settled) return;
      settled = true;
      if (!success) setFailed(true);
      router.replace("/");
    }

    async function handle(url: string) {
      try {
        const ok = await applyAuthCallbackUrl(url);
        finish(ok);
      } catch (err) {
        console.error("EvenSplit: auth callback failed", err);
        finish(false);
      }
    }

    // Safety net: never leave the user stuck on this screen, even if no URL
    // or "url" event ever arrives with a usable token fragment.
    const timeout = setTimeout(() => finish(false), 10000);

    // The link may have arrived before this screen mounted (app already open): read the remembered one too.
    const remembered = recentDeepLink();
    if (remembered) void handle(remembered);
    void Linking.getInitialURL().then((url) => {
      if (url) void handle(url);
    });
    const subscription = Linking.addEventListener("url", (event) => void handle(event.url));

    return () => {
      clearTimeout(timeout);
      subscription.remove();
    };
  }, []);

  return (
    <View className="flex-1 items-center justify-center gap-3 bg-neutral-100 px-8 dark:bg-neutral-900">
      <ActivityIndicator color={palette.primary} size="large" />
      {failed && (
        <Text className="text-center text-sm text-neutral-500">
          Couldn&apos;t confirm automatically - redirecting you to log in…
        </Text>
      )}
    </View>
  );
}
