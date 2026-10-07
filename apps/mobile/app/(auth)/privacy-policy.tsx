import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { AcceptTermsGate } from "@/components/legal/AcceptTermsGate";
import { setPrivacyPolicyAccepted } from "@/lib/device-flags";

/**
 * First-run gate shown once before a new device ever reaches login/signup,
 * per direct feedback ("standard privacy policy things where users get to
 * read that thing before going in the app"). Acceptance is persisted
 * per-device (AsyncStorage) so it's shown exactly once, not on every launch.
 * Signup reads the same flag and only shows the policy if it's still unset
 * (see (auth)/signup.tsx).
 */
export default function PrivacyPolicyGateScreen() {
  async function onAgree() {
    await setPrivacyPolicyAccepted();
    router.replace("/(auth)/login");
  }

  return (
    <SafeAreaView className="flex-1 bg-neutral-100 dark:bg-neutral-900">
      <View className="px-5 pt-4">
        <Text className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
          Privacy Policy &amp; Terms
        </Text>
        <Text className="mt-1 text-sm text-neutral-500">Please review before continuing.</Text>
      </View>
      <AcceptTermsGate onAgree={onAgree} />
    </SafeAreaView>
  );
}
