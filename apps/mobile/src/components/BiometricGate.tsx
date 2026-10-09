import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { ActivityIndicator, AppState, View } from "react-native";
import { Fingerprint } from "phosphor-react-native";
import { Button } from "@/components/ui/Button";
import { Text } from "@/components/ui/typography";
import { useAuth } from "@/hooks/use-auth";
import { promptUnlock, setBiometricEnabled, useBiometricEnabled } from "@/lib/biometrics";
import { palette } from "@/theme/palette";

/** How long the app can sit in the background before it asks again. */
const RELOCK_AFTER_MS = 30_000;

/**
 * Covers the signed-in app with a lock screen until the person passes the
 * phone's biometric prompt, when they have turned that on in Settings. Locks
 * on every cold start and after the app has been in the background for a while.
 */
export function BiometricGate({ children }: { children: ReactNode }) {
  const enabled = useBiometricEnabled();
  const { signOut } = useAuth();
  const [locked, setLocked] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const backgroundedAt = useRef<number | null>(null);
  const prompting = useRef(false);

  const unlock = useCallback(async () => {
    if (prompting.current) return;
    prompting.current = true;
    setBusy(true);
    setMessage(null);
    const result = await promptUnlock();
    prompting.current = false;
    setBusy(false);
    if (result.success) setLocked(false);
    else if (result.message) setMessage(result.message);
  }, []);

  // Ask straight away whenever the app is locked and the feature is on.
  useEffect(() => {
    if (enabled && locked) void unlock();
  }, [enabled, locked, unlock]);

  // Re-lock after a stay in the background.
  useEffect(() => {
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "background" || state === "inactive") {
        if (backgroundedAt.current === null) backgroundedAt.current = Date.now();
      } else if (state === "active") {
        const since = backgroundedAt.current;
        backgroundedAt.current = null;
        if (since !== null && Date.now() - since > RELOCK_AFTER_MS) setLocked(true);
      }
    });
    return () => sub.remove();
  }, []);

  // Still reading the saved choice: show nothing rather than flashing private content.
  if (enabled === null) {
    return (
      <View className="flex-1 items-center justify-center bg-neutral-100 dark:bg-neutral-900">
        <ActivityIndicator color={palette.primary} />
      </View>
    );
  }

  if (!enabled || !locked) return <>{children}</>;

  return (
    <View className="flex-1 items-center justify-center gap-5 bg-neutral-100 px-8 dark:bg-neutral-900">
      <View className="h-20 w-20 items-center justify-center rounded-full bg-primary-light">
        <Fingerprint color={palette.primary} size={40} />
      </View>
      <View className="items-center gap-1">
        <Text className="text-xl font-bold text-neutral-900 dark:text-neutral-100">SplitEven is locked</Text>
        <Text className="text-center text-sm text-neutral-500">
          {message ?? "Use your fingerprint or face to continue."}
        </Text>
      </View>
      <View className="w-full gap-3">
        <Button size="lg" onPress={() => void unlock()} loading={busy}>
          Unlock
        </Button>
        <Button
          size="lg"
          variant="outline"
          onPress={async () => {
            // Can't pass the prompt (new phone, changed fingerprints): sign out and use the password.
            await setBiometricEnabled(false);
            await signOut();
          }}
        >
          Sign out
        </Button>
      </View>
    </View>
  );
}
