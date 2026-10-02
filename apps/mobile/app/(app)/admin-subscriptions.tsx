import { Alert, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useColorScheme } from "nativewind";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft } from "phosphor-react-native";
import { PAYMENT_METHODS, SUBSCRIPTION_ADMIN_EMAIL, SUBSCRIPTION_PLANS } from "@evensplit/shared";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/hooks/use-auth";
import { listPendingSubscriptionRequests, reviewSubscriptionRequest } from "@/lib/api/subscriptions";

export default function AdminSubscriptionsScreen() {
  const { colorScheme } = useColorScheme();
  const iconColor = colorScheme === "dark" ? "#F4F5F3" : "#0A0A0A";
  const { authUser } = useAuth();
  const queryClient = useQueryClient();
  const isAdmin = authUser?.email === SUBSCRIPTION_ADMIN_EMAIL;

  const { data: requests, isLoading } = useQuery({
    queryKey: ["pending-subscription-requests"],
    queryFn: listPendingSubscriptionRequests,
    enabled: isAdmin,
  });

  async function onReview(id: string, status: "approved" | "rejected") {
    if (!authUser) return;
    try {
      await reviewSubscriptionRequest(id, status, authUser.id);
      await queryClient.invalidateQueries({ queryKey: ["pending-subscription-requests"] });
    } catch (err) {
      Alert.alert("Could not update", err instanceof Error ? err.message : "Try again");
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-neutral-100 dark:bg-neutral-900">
      <View className="flex-row items-center gap-3 px-5 pt-2">
        <Pressable
          onPress={() => router.back()}
          className="h-9 w-9 items-center justify-center rounded-full bg-white dark:bg-surface-dark"
        >
          <ArrowLeft size={18} color={iconColor} />
        </Pressable>
        <Text className="text-xl font-bold text-neutral-900 dark:text-neutral-100">Subscription requests</Text>
      </View>

      <ScrollView contentContainerClassName="gap-3 px-5 py-5" showsVerticalScrollIndicator={false}>
        {!isAdmin ? (
          <Text className="text-sm text-neutral-500">Not available.</Text>
        ) : isLoading ? (
          <Text className="text-sm text-neutral-500">Loading…</Text>
        ) : !requests || requests.length === 0 ? (
          <Text className="text-sm text-neutral-500">No pending requests.</Text>
        ) : (
          requests.map((req) => (
            <Card key={req.id} className="gap-2">
              <View className="flex-row items-center justify-between">
                <Text className="font-semibold text-neutral-900 dark:text-neutral-100">
                  {req.users.display_name}
                </Text>
                <Text className="font-mono text-sm font-semibold text-primary">
                  {SUBSCRIPTION_PLANS[req.plan].priceLabel}
                </Text>
              </View>
              <Text className="text-xs text-neutral-500">
                {SUBSCRIPTION_PLANS[req.plan].name} via {PAYMENT_METHODS[req.payment_method].label} · ref{" "}
                {req.reference_number}
              </Text>
              <Text className="text-[11px] text-neutral-500">
                Submitted {new Date(req.created_at).toLocaleString()}
              </Text>
              <View className="mt-1 flex-row gap-2">
                <Button size="sm" className="flex-1" onPress={() => onReview(req.id, "approved")}>
                  Approve
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 border-negative/40"
                  textClassName="text-negative"
                  onPress={() => onReview(req.id, "rejected")}
                >
                  Reject
                </Button>
              </View>
            </Card>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
