import { useState } from "react";
import { ScrollView, Text, View, type NativeScrollEvent, type NativeSyntheticEvent } from "react-native";
import { Button } from "@/components/ui/Button";
import { PrivacyPolicyContent } from "./PrivacyPolicyContent";
import { TermsOfServiceContent } from "./TermsOfServiceContent";

const BOTTOM_THRESHOLD = 24;

/**
 * Privacy Policy + Terms of Service, with the accept button disabled until
 * the user has actually scrolled to the bottom of both documents - a
 * one-tap "I agree" that nobody reads isn't real consent. Used both as the
 * device's first-run gate ((auth)/privacy-policy.tsx) and embedded directly
 * in the signup flow, since account creation should never be reachable
 * without this regardless of any earlier device-level acceptance.
 */
export function AcceptTermsGate({
  onAgree,
  agreeing,
  agreeLabel = "I agree, continue",
}: {
  onAgree: () => void;
  agreeing?: boolean;
  agreeLabel?: string;
}) {
  const [reachedBottom, setReachedBottom] = useState(false);

  function handleScroll(e: NativeSyntheticEvent<NativeScrollEvent>) {
    if (reachedBottom) return;
    const { contentOffset, contentSize, layoutMeasurement } = e.nativeEvent;
    const distanceFromBottom = contentSize.height - layoutMeasurement.height - contentOffset.y;
    if (distanceFromBottom <= BOTTOM_THRESHOLD) setReachedBottom(true);
  }

  return (
    <View className="flex-1">
      <ScrollView
        contentContainerClassName="gap-8 px-5 py-5"
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        // A fling that lands exactly at the scroll limit doesn't always emit
        // a final onScroll callback on Android - onMomentumScrollEnd and
        // onScrollEndDrag fire reliably once the gesture actually settles,
        // so the gate doesn't get stuck open right at the true bottom.
        onMomentumScrollEnd={handleScroll}
        onScrollEndDrag={handleScroll}
        scrollEventThrottle={64}
      >
        <View className="gap-5">
          <Text className="text-lg font-bold text-neutral-900 dark:text-neutral-100">Privacy Policy</Text>
          <PrivacyPolicyContent />
        </View>
        <View className="gap-5">
          <Text className="text-lg font-bold text-neutral-900 dark:text-neutral-100">Terms of Service</Text>
          <TermsOfServiceContent />
        </View>
      </ScrollView>
      <View className="border-t border-neutral-500/10 px-5 py-4">
        {!reachedBottom && (
          <Text className="mb-2 text-center text-xs text-neutral-500">
            Scroll to the bottom to continue
          </Text>
        )}
        <Button size="lg" onPress={onAgree} disabled={!reachedBottom} loading={agreeing}>
          {agreeLabel}
        </Button>
      </View>
    </View>
  );
}
