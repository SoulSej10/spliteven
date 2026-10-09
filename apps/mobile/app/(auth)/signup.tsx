import { useEffect, useState } from "react";
import { Alert, Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, View } from "react-native";
import { Text } from "@/components/ui/typography";
import { Link, router } from "expo-router";
import * as Linking from "expo-linking";
import { useColorScheme } from "nativewind";
import { ArrowLeft } from "phosphor-react-native";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { signUpSchema, signupHitExistingAccount, type SignUpInput, describeWeakPassword } from "@evensplit/shared";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import { BottomActionBar } from "@/components/ui/BottomActionBar";
import { AlertModal } from "@/components/ui/AlertModal";
import { AcceptTermsGate } from "@/components/legal/AcceptTermsGate";
import { getSupabaseClient } from "@/lib/supabase/client";
import { isPasswordPwned } from "@/lib/pwned-password";
import { hasAcceptedPrivacyPolicy, setPrivacyPolicyAccepted } from "@/lib/device-flags";
import { CURRENCIES } from "@/lib/format";
import { cn } from "@/lib/cn";
import { palette } from "@/theme/palette";

export default function SignUpScreen() {
  const [submitting, setSubmitting] = useState(false);
  const [checkEmailVisible, setCheckEmailVisible] = useState(false);
  // Acceptance is remembered per device (app/(auth)/privacy-policy.tsx), so
  // signup only shows the policy when this device hasn't accepted it yet
  // (e.g. reached via a deep link). null = still reading the saved flag.
  const [agreedToTerms, setAgreedToTerms] = useState<boolean | null>(null);
  useEffect(() => {
    let active = true;
    hasAcceptedPrivacyPolicy()
      .then((accepted) => active && setAgreedToTerms(accepted))
      .catch(() => active && setAgreedToTerms(false));
    return () => {
      active = false;
    };
  }, []);
  // Collected here because the account (and its starter Cash account) is created with these values;
  // otherwise everyone silently ended up on USD with a name taken from their email.
  const [displayName, setDisplayName] = useState("");
  const [currency, setCurrency] = useState<string>("PHP");
  const [nameError, setNameError] = useState<string | null>(null);
  const { colorScheme } = useColorScheme();
  const iconColor = palette.ink;
  const { handleSubmit, formState, setValue, watch } = useForm<SignUpInput>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { email: "", password: "", confirmPassword: "" },
  });

  async function onSubmit(values: SignUpInput) {
    const name = displayName.trim();
    if (!name) {
      setNameError("Tell us what to call you");
      return;
    }
    setNameError(null);
    setSubmitting(true);
    try {
      try {
        const { pwned, count } = await isPasswordPwned(values.password);
        if (pwned) {
          Alert.alert(
            "Choose a different password",
            `This password has appeared in ${count.toLocaleString()} data breach${count === 1 ? "" : "es"}. Please choose a different one.`
          );
          return;
        }
      } catch {
        // Best-effort check - never block signup if HaveIBeenPwned is unreachable.
      }

      const supabase = getSupabaseClient();
      const { data, error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          emailRedirectTo: Linking.createURL("auth/callback"),
          data: { display_name: name, default_currency: currency },
        },
      });
      if (error) throw error;
      if (signupHitExistingAccount(data.user)) {
        // Supabase sends no email for an address that is already registered, so say so
        // instead of asking them to wait for a confirmation that will never arrive.
        Alert.alert(
          "This email is already registered",
          "No confirmation email is sent for an existing account. Log in instead, or reset your password if you have forgotten it.",
          [
            { text: "Reset password", onPress: () => router.replace("/(auth)/forgot-password") },
            { text: "Log in", onPress: () => router.replace("/(auth)/login") },
          ]
        );
        return;
      }
      if (!data.session) {
        // Email confirmation is required: signUp() succeeds but returns no
        // session, so there's no authenticated user yet to run profile
        // setup for. The confirmation link now points back at
        // evensplit://auth/callback (app/auth/callback.tsx), which signs
        // them straight in - but they may confirm from another device, so
        // send them to log in as a fallback in the meantime.
        setCheckEmailVisible(true);
        return;
      }
      router.replace("/(auth)/profile-setup");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Try again";
      Alert.alert("Could not sign up", describeWeakPassword(message) ?? message);
    } finally {
      setSubmitting(false);
    }
  }

  if (agreedToTerms === null) {
    return <View className="flex-1 bg-neutral-100 dark:bg-neutral-900" />;
  }

  if (!agreedToTerms) {
    return (
      <View className="flex-1 bg-neutral-100 pt-14 dark:bg-neutral-900">
        <View className="flex-row items-center gap-3 px-5 pb-3">
          <Pressable
            onPress={() => router.back()}
            className="h-9 w-9 items-center justify-center rounded-full bg-white dark:bg-surface-dark"
          >
            <ArrowLeft size={18} color={iconColor} />
          </Pressable>
          <Text className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
            Privacy Policy &amp; Terms
          </Text>
        </View>
        <AcceptTermsGate
          onAgree={async () => {
            await setPrivacyPolicyAccepted();
            setAgreedToTerms(true);
          }}
        />
      </View>
    );
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
        <Pressable onPress={() => router.back()} className="absolute left-6 top-14 h-9 w-9 items-center justify-center rounded-full bg-white dark:bg-surface-dark">
          <ArrowLeft size={18} color={iconColor} />
        </Pressable>

        <View className="mb-10 items-center gap-3">
          <Image source={require("../../assets/icon.png")} className="h-16 w-16 rounded-card" />
          <Text className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">Create account</Text>
          <Text className="text-neutral-500">Start splitting expenses in seconds</Text>
        </View>

        <View className="gap-4">
          <TextField
            label="Your name"
            autoCapitalize="words"
            autoComplete="name"
            onChangeText={(t) => {
              setDisplayName(t);
              if (nameError) setNameError(null);
            }}
            value={displayName}
            error={nameError ?? undefined}
          />
          <TextField
            label="Email"
            keyboardType="email-address"
            autoCapitalize="none"
            onChangeText={(t) => setValue("email", t)}
            value={watch("email")}
            error={formState.errors.email?.message}
          />
          <View className="gap-1.5">
            <Text className="text-sm font-medium text-neutral-900 dark:text-neutral-100">Your currency</Text>
            <View className="flex-row flex-wrap gap-2">
              {CURRENCIES.map((c) => (
                <Pressable
                  key={c}
                  onPress={() => setCurrency(c)}
                  className={cn(
                    "rounded-pill border px-3 py-1.5",
                    currency === c ? "border-primary bg-primary-light" : "border-neutral-500/20"
                  )}
                >
                  <Text className={cn("text-sm font-medium", currency === c ? "text-primary-deep" : "text-neutral-500")}>{c}</Text>
                </Pressable>
              ))}
            </View>
            <Text className="text-xs text-neutral-500">Used for your accounts and totals. You can change it later in Settings.</Text>
          </View>
          <TextField
            label="Password"
            secureTextEntry
            onChangeText={(t) => setValue("password", t)}
            value={watch("password")}
            error={formState.errors.password?.message}
          />
          <TextField
            label="Confirm password"
            secureTextEntry
            onChangeText={(t) => setValue("confirmPassword", t)}
            value={watch("confirmPassword")}
            error={formState.errors.confirmPassword?.message}
          />

          <View className="mt-2 flex-row items-center justify-center gap-1">
            <Text className="text-neutral-500">Already have an account?</Text>
            <Link href="/(auth)/login" asChild>
              <Pressable>
                <Text className="font-semibold text-primary-deep">Log in</Text>
              </Pressable>
            </Link>
          </View>
        </View>
      </ScrollView>

      <BottomActionBar className="flex-col gap-3">
        <Button onPress={handleSubmit(onSubmit)} loading={submitting} size="lg">
          Create account
        </Button>
        <Text className="text-center text-xs text-neutral-500">
          By creating an account, you agree to our{" "}
          <Text
            className="font-semibold text-primary-deep"
            onPress={() => Linking.openURL("https://evensplit-eight.vercel.app/terms-of-service")}
          >
            Terms of Service
          </Text>{" "}
          and{" "}
          <Text
            className="font-semibold text-primary-deep"
            onPress={() => Linking.openURL("https://evensplit-eight.vercel.app/privacy-policy")}
          >
            Privacy Policy
          </Text>
          .
        </Text>
      </BottomActionBar>

      <AlertModal
        visible={checkEmailVisible}
        tone="success"
        title="Check your email"
        message="We've sent a confirmation link to your email. Tap it to finish creating your account."
        onDismiss={() => {
          setCheckEmailVisible(false);
          router.replace("/(auth)/login");
        }}
      />
    </KeyboardAvoidingView>
  );
}
