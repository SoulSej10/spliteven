import { useEffect, useState } from "react";
import { Stack } from "expo-router";
import * as Sentry from "@sentry/react-native";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { colorScheme } from "nativewind";
import { I18nManager } from "react-native";
import {
  useFonts,
  Sora_400Regular,
  Sora_500Medium,
  Sora_600SemiBold,
  Sora_700Bold,
  Sora_800ExtraBold,
} from "@expo-google-fonts/sora";
import "../global.css";
import { Providers } from "@/components/Providers";
import { loadStoredColorScheme } from "@/lib/appearance";

SplashScreen.preventAutoHideAsync().catch(() => {});

// No-ops entirely if EXPO_PUBLIC_SENTRY_DSN isn't set (e.g. local dev, or
// before a Sentry project exists) - drop a DSN in .env.local (or the EAS
// project's env vars) whenever a Sentry project exists to turn this on, no
// code change needed.
if (process.env.EXPO_PUBLIC_SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
    tracesSampleRate: 0.1,
  });
}

// This app has no RTL design at all - force LTR unconditionally so a
// stale forceRTL(true) from an earlier debugging session (persisted
// natively, survives JS reloads and even `adb install -r`) can't silently
// flip every `left`/`right`/absolute-positioned layout in the app (this is
// what caused the settings drawer to render pinned to the right instead of
// the left it's coded for).
if (I18nManager.isRTL) {
  I18nManager.allowRTL(false);
  I18nManager.forceRTL(false);
}

// Light until the user picks otherwise, regardless of the device's system
// setting, per direct feedback. The saved choice (Settings > Dark mode) is
// restored below before anything renders.
colorScheme.set("light");

function RootLayout() {
  const [fontsLoaded] = useFonts({
    Sora_400Regular,
    Sora_500Medium,
    Sora_600SemiBold,
    Sora_700Bold,
    Sora_800ExtraBold,
  });
  const [schemeRestored, setSchemeRestored] = useState(false);

  // Restore the saved light/dark choice while the splash screen is still up, so a
  // dark-mode user never sees a light flash and the choice survives app restarts.
  useEffect(() => {
    let active = true;
    loadStoredColorScheme().then((scheme) => {
      colorScheme.set(scheme);
      if (active) setSchemeRestored(true);
    });
    return () => {
      active = false;
    };
  }, []);

  const ready = fontsLoaded && schemeRestored;

  useEffect(() => {
    if (ready) void SplashScreen.hideAsync();
  }, [ready]);

  if (!ready) return null;

  return (
    <Providers>
      <StatusBar style="auto" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(app)" />
        <Stack.Screen name="invite/[code]" options={{ presentation: "modal", headerShown: true, title: "Join group" }} />
      </Stack>
    </Providers>
  );
}

// Only wrap when Sentry is actually initialized above - Sentry.wrap()
// unconditionally expects a prior Sentry.init() and warns ("App Start Span
// could not be finished") if it never ran, which is the normal case in dev
// without a DSN configured.
export default process.env.EXPO_PUBLIC_SENTRY_DSN ? Sentry.wrap(RootLayout) : RootLayout;
