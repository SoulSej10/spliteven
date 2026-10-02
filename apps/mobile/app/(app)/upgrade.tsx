import { useState } from "react";
import { Alert, Image, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useColorScheme } from "nativewind";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Check } from "phosphor-react-native";
import {
  PAYABLE_PLANS,
  PAYMENT_METHODS,
  SUBSCRIPTION_PLANS,
  type SubscriptionPaymentMethod,
  type SubscriptionTier,
} from "@evensplit/shared";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { useAuth } from "@/hooks/use-auth";
import { listMySubscriptionRequests, submitSubscriptionRequest } from "@/lib/api/subscriptions";

const MAYA_QR = require("../../assets/payments/maya-qr.jpg");

export default function UpgradeScreen() {
  const { colorScheme } = useColorScheme();
  const iconColor = colorScheme === "dark" ? "#F4F5F3" : "#0A0A0A";
  const { authUser, profile } = useAuth();
  const queryClient = useQueryClient();

  const [selectedPlan, setSelectedPlan] = useState<Exclude<SubscriptionTier, "free"> | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<SubscriptionPaymentMethod>("gcash");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { data: requests } = useQuery({
    queryKey: ["subscription-requests", authUser?.id],
    queryFn: () => listMySubscriptionRequests(authUser!.id),
    enabled: !!authUser?.id,
  });

  const pendingRequest = requests?.find((r) => r.status === "pending");
  const currentTier = profile?.subscription_tier ?? "free";

  async function onSubmit() {
    if (!authUser || !selectedPlan) return;
    if (referenceNumber.trim().length < 4) {
      Alert.alert("Enter a reference number", "Use the reference number from your payment receipt.");
      return;
    }
    setSubmitting(true);
    try {
      await submitSubscriptionRequest(
        authUser.id,
        selectedPlan,
        selectedMethod,
        SUBSCRIPTION_PLANS[selectedPlan].priceValue,
        referenceNumber.trim()
      );
      await queryClient.invalidateQueries({ queryKey: ["subscription-requests", authUser.id] });
      setSelectedPlan(null);
      setReferenceNumber("");
      Alert.alert(
        "Submitted",
        "We'll review your payment and activate your plan shortly - usually within a day."
      );
    } catch (err) {
      Alert.alert("Could not submit", err instanceof Error ? err.message : "Try again");
    } finally {
      setSubmitting(false);
    }
  }

  const method = PAYMENT_METHODS[selectedMethod];

  return (
    <SafeAreaView className="flex-1 bg-neutral-100 dark:bg-neutral-900">
      <View className="flex-row items-center gap-3 px-5 pt-2">
        <Pressable
          onPress={() => router.back()}
          className="h-9 w-9 items-center justify-center rounded-full bg-white dark:bg-surface-dark"
        >
          <ArrowLeft size={18} color={iconColor} />
        </Pressable>
        <Text className="text-xl font-bold text-neutral-900 dark:text-neutral-100">Upgrade</Text>
      </View>

      <ScrollView contentContainerClassName="gap-4 px-5 py-5" showsVerticalScrollIndicator={false}>
        {pendingRequest ? (
          <Card className="border border-accent/40 bg-accent/10">
            <Text className="font-semibold text-neutral-900 dark:text-neutral-100">
              Your {SUBSCRIPTION_PLANS[pendingRequest.plan].name} upgrade is pending review
            </Text>
            <Text className="mt-1 text-xs text-neutral-500">
              Submitted {new Date(pendingRequest.created_at).toLocaleDateString()} · ref{" "}
              {pendingRequest.reference_number}
            </Text>
          </Card>
        ) : null}

        {(Object.keys(SUBSCRIPTION_PLANS) as SubscriptionTier[]).map((tier) => {
          const plan = SUBSCRIPTION_PLANS[tier];
          const isCurrent = currentTier === tier;
          const isPayable = (PAYABLE_PLANS as readonly string[]).includes(tier);
          return (
            <Card
              key={tier}
              className={cn(
                "gap-3",
                selectedPlan === tier && "border-2 border-primary"
              )}
            >
              <View className="flex-row items-center justify-between">
                <Text className="text-lg font-bold text-neutral-900 dark:text-neutral-100">{plan.name}</Text>
                <Text className="font-mono text-base font-semibold text-primary">{plan.priceLabel}</Text>
              </View>
              <View className="gap-1.5">
                {plan.features.map((feature) => (
                  <View key={feature} className="flex-row items-center gap-2">
                    <Check size={14} color="#2F8F7D" />
                    <Text className="flex-1 text-sm text-neutral-700 dark:text-neutral-300">{feature}</Text>
                  </View>
                ))}
              </View>
              {isCurrent ? (
                <View className="rounded-pill bg-neutral-100 px-4 py-2 dark:bg-white/10">
                  <Text className="text-center text-sm font-semibold text-neutral-500">Current plan</Text>
                </View>
              ) : isPayable ? (
                <Button
                  variant={selectedPlan === tier ? "primary" : "outline"}
                  size="sm"
                  disabled={!!pendingRequest}
                  onPress={() => setSelectedPlan(tier as Exclude<SubscriptionTier, "free">)}
                >
                  {selectedPlan === tier ? "Selected" : `Choose ${plan.name}`}
                </Button>
              ) : null}
            </Card>
          );
        })}

        {selectedPlan ? (
          <Card className="gap-4">
            <Text className="font-semibold text-neutral-900 dark:text-neutral-100">
              Pay {SUBSCRIPTION_PLANS[selectedPlan].priceLabel} via
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {Object.values(PAYMENT_METHODS).map((m) => (
                <Pressable
                  key={m.id}
                  onPress={() => setSelectedMethod(m.id)}
                  className={cn(
                    "rounded-pill border px-3.5 py-2",
                    selectedMethod === m.id ? "border-primary bg-primary-light" : "border-neutral-500/20"
                  )}
                >
                  <Text
                    className={cn(
                      "text-xs font-medium",
                      selectedMethod === m.id ? "text-primary" : "text-neutral-500"
                    )}
                  >
                    {m.label}
                  </Text>
                </Pressable>
              ))}
            </View>

            <View className="gap-1 rounded-2xl bg-neutral-100 p-4 dark:bg-white/5">
              <Text className="text-xs text-neutral-500">Send to</Text>
              <Text className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
                {method.accountName}
              </Text>
              <Text className="font-mono text-base text-neutral-900 dark:text-neutral-100">
                {method.accountNumber}
              </Text>
            </View>

            {selectedMethod === "maya" ? (
              <Image source={MAYA_QR} className="h-56 w-full rounded-2xl" resizeMode="contain" />
            ) : null}

            <View className="gap-1.5">
              <Text className="text-xs font-medium text-neutral-500">Reference number</Text>
              <TextInput
                value={referenceNumber}
                onChangeText={setReferenceNumber}
                placeholder="From your payment receipt"
                className="rounded-xl border border-neutral-500/20 px-3 py-2.5 text-neutral-900 dark:text-neutral-100"
                placeholderTextColor="#6B7169"
              />
            </View>

            <Button onPress={onSubmit} loading={submitting}>
              Submit for review
            </Button>
            <Text className="text-center text-[11px] text-neutral-500">
              Your plan activates once the payment is verified, usually within a day.
            </Text>
          </Card>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}
