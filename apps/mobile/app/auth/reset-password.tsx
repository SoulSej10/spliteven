import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import * as Linking from "expo-linking";
import { LockKey } from "phosphor-react-native";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import { Text } from "@/components/ui/typography";
import { applyAuthCallbackUrl, deepLinkReportsError, recentDeepLink } from "@/lib/supabase/authDeepLink";
import { getSupabaseClient } from "@/lib/supabase/client";
import { isPasswordPwned } from "@/lib/pwned-password";
import { disableBiometricLogin, enableBiometricLogin } from "@/lib/biometric-login";
import { palette } from "@/theme/palette";
import { describeWeakPassword } from "@evensplit/shared";

type LinkState = "checking" | "ready" | "invalid";

/**
 * Landing screen for the password-reset email (evensplit://auth/reset-password#access_token=...&type=recovery).
 * The link carries a short-lived recovery session in its URL fragment: this screen
 * establishes it, then lets the person choose a new password. Without a valid
 * link it says so and offers to send a new one, instead of an unmatched-route page.
 */
export default function ResetPasswordScreen() {
  // Opened from "Reset with fingerprint": the scan already signed them in, so no email link is involved.
  const { via } = useLocalSearchParams<{ via?: string }>();
  const viaBiometric = via === "biometric";
  const [state, setState] = useState<LinkState>(viaBiometric ? "ready" : "checking");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const settled = useRef(false);

  useEffect(() => {
    let active = true;

    function settle(next: LinkState) {
      if (!active || settled.current) return;
      settled.current = true;
      setState(next);
    }

    async function handle(url: string) {
      if (deepLinkReportsError(url)) {
        settle("invalid");
        return;
      }
      try {
        if (await applyAuthCallbackUrl(url)) settle("ready");
      } catch (err) {
        console.error("EvenSplit: reset link failed", err);
      }
    }

    if (viaBiometric) return;

    // The link usually arrived before this screen mounted, so read the remembered one first.
    const remembered = recentDeepLink();
    if (remembered) void handle(remembered);
    void Linking.getInitialURL().then((url) => {
      if (url) void handle(url);
    });
    const subscription = Linking.addEventListener("url", (event) => void handle(event.url));

    // No usable link within a few seconds (expired, already used, or opened by hand): say so.
    // An existing sign-in does not count - the form must only open from the reset link itself.
    const timeout = setTimeout(() => settle("invalid"), 6000);

    return () => {
      active = false;
      clearTimeout(timeout);
      subscription.remove();
    };
  }, [viaBiometric]);

  async function onSubmit() {
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    if (password !== confirm) {
      setError("The two passwords don't match");
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      try {
        const { pwned, count } = await isPasswordPwned(password);
        if (pwned) {
          setError(
            `This password has appeared in ${count.toLocaleString()} data breach${count === 1 ? "" : "es"}. Please choose a different one.`
          );
          return;
        }
      } catch {
        // Best-effort check - never block a reset if HaveIBeenPwned is unreachable.
      }

      const { error: updateError } = await getSupabaseClient().auth.updateUser({ password });
      if (updateError) throw updateError;
      if (viaBiometric) {
        // Re-save the new password behind the fingerprint so the next scan works with it.
        const { data } = await getSupabaseClient().auth.getUser();
        const email = data.user?.email;
        if (email) await enableBiometricLogin(email, password);
        else await disableBiometricLogin();
      } else {
        await disableBiometricLogin(); // the saved password is now out of date
      }
      Alert.alert("Password updated", "You're signed in with your new password.", [
        { text: "Continue", onPress: () => router.replace("/") },
      ]);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Try again";
      Alert.alert("Could not update password", describeWeakPassword(message) ?? message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      className="flex-1 bg-neutral-100 dark:bg-neutral-900"
    >
      <ScrollView contentContainerClassName="flex-1 justify-center gap-6 px-6 py-10" keyboardShouldPersistTaps="handled">
        <View className="items-center gap-3">
          <View className="h-14 w-14 items-center justify-center rounded-card bg-primary-light">
            <LockKey color={palette.primary} size={24} />
          </View>
          <Text className="text-xl font-bold text-neutral-900 dark:text-neutral-100">Choose a new password</Text>
          {viaBiometric && <Text className="text-sm text-neutral-500">Verified with your fingerprint</Text>}
        </View>

        {state === "checking" && (
          <View className="items-center gap-3">
            <ActivityIndicator color={palette.primary} />
            <Text className="text-sm text-neutral-500">Checking your reset link…</Text>
          </View>
        )}

        {state === "invalid" && (
          <View className="gap-4">
            <Text className="text-center text-neutral-500">
              This reset link is invalid or has expired. Request a new one and open it on this device.
            </Text>
            <Button size="lg" onPress={() => router.replace("/(auth)/forgot-password")}>
              Send a new reset link
            </Button>
            <Button size="lg" variant="outline" onPress={() => router.replace("/(auth)/login")}>
              Back to log in
            </Button>
          </View>
        )}

        {state === "ready" && (
          <View className="gap-4">
            <TextField
              label="New password"
              autoComplete="new-password"
              textContentType="newPassword"
              importantForAutofill="yes"
              secureTextEntry
              autoCapitalize="none"
              value={password}
              onChangeText={setPassword}
            />
            <TextField
              label="Confirm new password"
              autoComplete="new-password"
              textContentType="newPassword"
              importantForAutofill="yes"
              secureTextEntry
              autoCapitalize="none"
              value={confirm}
              onChangeText={setConfirm}
              error={error ?? undefined}
            />
            <Button size="lg" onPress={onSubmit} loading={submitting}>
              Update password
            </Button>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
