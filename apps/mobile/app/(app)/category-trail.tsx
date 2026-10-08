import { useMemo } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { Text } from "@/components/ui/typography";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { useColorScheme } from "nativewind";
import { ArrowLeft, CheckCircle, UsersThree } from "phosphor-react-native";
import { computeCategoryBreakdown, computeCategoryTrail } from "@evensplit/shared";
import { AppIcon } from "@/components/ui/AppIcon";
import { Card } from "@/components/ui/Card";
import { usePersonalAccounts, usePersonalCategories } from "@/hooks/use-personal";
import { useBaseTransactions } from "@/hooks/use-personal-totals";
import { formatDate, formatMoney } from "@/lib/format";
import { palette } from "@/theme/palette";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/**
 * The trail behind one Analysis number: every transaction that was added up
 * to produce a category's total for the month, oldest first, with the
 * running total after each one, ending at the figure that was tapped.
 */
export default function CategoryTrailScreen() {
  const { categoryId, month, kind: kindParam } = useLocalSearchParams<{
    categoryId: string;
    month: string;
    kind: string;
  }>();
  const { colorScheme } = useColorScheme();
  const iconColor = palette.ink;

  const { base: currency, transactions, isLoading } = useBaseTransactions();
  const { data: accounts } = usePersonalAccounts();
  const { data: categories } = usePersonalCategories();

  const kind: "income" | "expense" = kindParam === "income" ? "income" : "expense";
  const category = categoryId && categoryId !== "none" ? categoryId : null;

  const monthTransactions = useMemo(
    () => transactions.filter((t) => month && t.occurred_at.slice(0, 7) === month),
    [transactions, month]
  );

  const trail = useMemo(() => computeCategoryTrail(monthTransactions, category, kind), [monthTransactions, category, kind]);

  const share = useMemo(() => {
    const row = computeCategoryBreakdown(monthTransactions, categories ?? [], kind).find((b) => b.category_id === category);
    return row?.percent ?? 0;
  }, [monthTransactions, categories, kind, category]);

  const categoryInfo = categories?.find((c) => c.id === category);
  const name = categoryInfo?.name ?? "Uncategorized";
  const monthLabel = month ? `${MONTH_NAMES[Number(month.slice(5, 7)) - 1] ?? ""} ${month.slice(0, 4)}` : "";
  const accountName = (id: string) => accounts?.find((a) => a.id === id)?.name ?? "Account";

  return (
    <SafeAreaView className="flex-1 bg-neutral-100 dark:bg-neutral-900">
      <View className="flex-row items-center gap-3 px-5 pt-2">
        <Pressable
          onPress={() => router.back()}
          className="h-9 w-9 items-center justify-center rounded-full bg-white dark:bg-surface-dark"
          accessibilityLabel="Back"
        >
          <ArrowLeft size={18} color={iconColor} />
        </Pressable>
        <Text className="text-xl font-bold text-neutral-900 dark:text-neutral-100">How we got here</Text>
      </View>

      <ScrollView contentContainerClassName="gap-4 px-5 py-5" showsVerticalScrollIndicator={false}>
        <Card className="gap-3">
          <View className="flex-row items-center gap-3">
            <AppIcon value={categoryInfo?.icon} fallback="🏷️" size={28} />
            <View className="flex-1">
              <Text className="text-base font-bold capitalize text-neutral-900 dark:text-neutral-100" numberOfLines={1}>
                {name}
              </Text>
              <Text className="text-xs text-neutral-500">
                {kind === "expense" ? "Spending" : "Income"} in {monthLabel}
              </Text>
            </View>
          </View>
          <Text className="text-3xl font-extrabold text-neutral-900 dark:text-neutral-100">
            {formatMoney(trail.total, currency)}
          </Text>
          <Text className="text-xs text-neutral-500">
            {share.toFixed(0)}% of your {kind === "expense" ? "spending" : "income"} this month
          </Text>
          <View className="flex-row gap-3 pt-1">
            <View className="flex-1 rounded-lg bg-neutral-500/10 px-3 py-2">
              <Text className="text-[11px] text-neutral-500">Transactions</Text>
              <Text className="text-sm font-bold text-neutral-900 dark:text-neutral-100">{trail.count}</Text>
            </View>
            <View className="flex-1 rounded-lg bg-neutral-500/10 px-3 py-2">
              <Text className="text-[11px] text-neutral-500">Average</Text>
              <Text className="text-sm font-bold text-neutral-900 dark:text-neutral-100" numberOfLines={1}>
                {formatMoney(trail.average, currency)}
              </Text>
            </View>
            <View className="flex-1 rounded-lg bg-neutral-500/10 px-3 py-2">
              <Text className="text-[11px] text-neutral-500">Largest</Text>
              <Text className="text-sm font-bold text-neutral-900 dark:text-neutral-100" numberOfLines={1}>
                {formatMoney(trail.largest?.amount ?? 0, currency)}
              </Text>
            </View>
          </View>
        </Card>

        <Text className="text-base font-bold text-neutral-900 dark:text-neutral-100">How this adds up</Text>

        {isLoading && <Text className="text-sm text-neutral-500">Loading…</Text>}

        {!isLoading && trail.entries.length === 0 && (
          <Text className="text-sm text-neutral-500">No transactions found for this category in {monthLabel}.</Text>
        )}

        <View>
          {trail.entries.map((entry, i) => {
            const isLast = i === trail.entries.length - 1;
            const group = entry.groups;
            return (
              <View key={entry.id} className="flex-row gap-3">
                <View className="w-4 items-center">
                  <View className="mt-1.5 h-3 w-3 rounded-full bg-primary" />
                  {!isLast && <View className="w-0.5 flex-1 bg-neutral-500/25" />}
                </View>
                <Pressable
                  disabled={!entry.linked_group_id}
                  onPress={() => entry.linked_group_id && router.push(`/(app)/groups/${entry.linked_group_id}`)}
                  className="mb-3 flex-1"
                >
                  <Card className="gap-1 py-3">
                    <View className="flex-row items-center justify-between gap-3">
                      <Text className="flex-1 text-sm font-semibold text-neutral-900 dark:text-neutral-100" numberOfLines={1}>
                        {entry.note?.trim() ? entry.note : name}
                      </Text>
                      <Text className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                        {kind === "expense" ? "-" : "+"}
                        {formatMoney(entry.amount, currency)}
                      </Text>
                    </View>
                    <Text className="text-xs text-neutral-500" numberOfLines={1}>
                      {formatDate(entry.occurred_at)} · {accountName(entry.account_id)}
                    </Text>
                    {group && (
                      <View className="flex-row items-center gap-1">
                        <UsersThree size={12} color={palette.muted} />
                        <Text className="text-xs font-medium text-primary-deep" numberOfLines={1}>
                          Your share from {group.name}
                        </Text>
                      </View>
                    )}
                    <View className="mt-1 flex-row items-center justify-between border-t border-neutral-500/15 pt-1.5">
                      <Text className="text-[11px] text-neutral-500">Running total</Text>
                      <Text className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">
                        {formatMoney(entry.running_total, currency)}
                      </Text>
                    </View>
                  </Card>
                </Pressable>
              </View>
            );
          })}
        </View>

        {trail.entries.length > 0 && (
          <Card className="flex-row items-center gap-3 border border-primary/30 bg-primary-light dark:bg-primary/15">
            <CheckCircle size={22} color={palette.primary} weight="fill" />
            <View className="flex-1">
              <Text className="text-xs text-neutral-500">Total, matching Analysis</Text>
              <Text className="text-lg font-extrabold text-neutral-900 dark:text-neutral-100">
                {formatMoney(trail.total, currency)}
              </Text>
            </View>
          </Card>
        )}

        <Text className="text-xs text-neutral-500">
          Only {kind === "expense" ? "expense" : "income"} transactions dated in {monthLabel} count here. Transfers between
          your own accounts, and money you advance for a group or get repaid, are tracked separately and never included.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
