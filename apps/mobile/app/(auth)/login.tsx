import { useState } from "react";
import { Alert, Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, View } from "react-native";
import { Text } from "@/components/ui/typography";
import { Link, router } from "expo-router";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { logInSchema, type LogInInput } from "@evensplit/shared";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import { BottomActionBar } from "@/components/ui/BottomActionBar";
import { getSupabaseClient } from "@/lib/supabase/client";
import { signInWithGoogle } from "@/lib/google-signin";
import { useBiometricSignIn } from "@/hooks/use-biometric-signin";
import {
  canOfferBiometricLogin,
  declineBiometricLogin,
  enableBiometricLogin,
  getBiometricLoginState,
} from "@/lib/biometric-login";

/** After a password sign-in, offers to use the fingerprint next time (once, unless they change their mind in Settings). */
async function offerBiometricLogin(email: string, password: string) {
  if ((await getBiometricLoginState()) !== "off") return;
  if (!(await canOfferBiometricLogin())) return;
  const turnOn = await new Promise<boolean>((resolve) =>
    Alert.alert(
      "Sign in with your fingerprint?",
      "Next time, use your fingerprint or face instead of typing your password. Your password is kept encrypted on this phone, and you can turn this off in Settings.",
      [
        { text: "Not now", style: "cancel", onPress: () => resolve(false) },
        { text: "Turn on", onPress: () => resolve(true) },
      ],
      { cancelable: false }
    )
  );
  if (!turnOn) {
    await declineBiometricLogin();
    return;
  }
  await enableBiometricLogin(email, password);
}

export default function LoginScreen() {
  const [submitting, setSubmitting] = useState(false);
  const [googleBusy, setGoogleBusy] = useState(false);
  const biometric = useBiometricSignIn();

  async function onGoogle() {
    setGoogleBusy(true);
    try {
      const result = await signInWithGoogle();
      if (result === "success") router.replace("/");
      else if (result !== "cancelled") Alert.alert("Google sign-in", result.error);
    } finally {
      setGoogleBusy(false);
    }
  }
  const { handleSubmit, formState, setValue, watch } = useForm<LogInInput>({
    resolver: zodResolver(logInSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: LogInInput) {
    setSubmitting(true);
    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase.auth.signInWithPassword(values);
      if (error) throw error;
      await offerBiometricLogin(values.email, values.password);
      router.replace("/");
    } catch (err) {
      Alert.alert("Could not sign in", err instanceof Error ? err.message : "Try again");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      className="flex-1 bg-neutral-100 dark:bg-neutral-900"
    >
      <ScrollView
        contentContainerClassName="flex-1 justify-center px-6 py-10 pb-40"
        keyboardShouldPersistTaps="handled"
      >
        <View className="mb-10 items-center gap-3">
          <Image source={require("../../assets/icon.png")} className="h-16 w-16 rounded-card" />
          <Text className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">SplitEven</Text>
          <Text className="text-neutral-500">Split expenses. Stay even.</Text>
        </View>

        <View className="gap-4">
          <TextField
            label="Email"
            keyboardType="email-address"
            autoCapitalize="none"
            onChangeText={(t) => setValue("email", t)}
            value={watch("email")}
            error={formState.errors.email?.message}
          />
          <TextField
            label="Password"
            secureTextEntry
            onChangeText={(t) => setValue("password", t)}
            value={watch("password")}
            error={formState.errors.password?.message}
          />
          <Pressable onPress={() => router.push("/(auth)/forgot-password")} className="self-end">
            <Text className="text-sm font-medium text-primary-deep">Forgot password?</Text>
          </Pressable>

          <View className="mt-2 flex-row items-center justify-center gap-1">
            <Text className="text-neutral-500">Don't have an account?</Text>
            <Link href="/(auth)/signup" asChild>
              <Pressable>
                <Text className="font-semibold text-primary-deep">Sign up</Text>
              </Pressable>
            </Link>
          </View>
        </View>
      </ScrollView>

      <BottomActionBar className="flex-col gap-3">
        <Button onPress={handleSubmit(onSubmit)} loading={submitting} size="lg">
          Log in
        </Button>
        <Button variant="outline" onPress={() => void onGoogle()} loading={googleBusy} size="lg">
          Continue with Google
        </Button>
        {biometric.available && (
          <Button variant="outline" onPress={() => void biometric.signIn()} loading={biometric.busy} size="lg">
            Sign in with fingerprint
          </Button>
        )}
      </BottomActionBar>
    </KeyboardAvoidingView>
  );
}
