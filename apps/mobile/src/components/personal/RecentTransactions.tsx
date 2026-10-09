import { useMemo } from "react";
import { Pressable, View } from "react-native";
import { Text } from "@/components/ui/typography";
import { router } from "expo-router";
import { ArrowRight } from "phosphor-react-native";
import { Card } from "@/components/ui/Card";
import { MoneyText } from "@/components/ui/MoneyText";
import { usePersonalAccounts, usePersonalCategories, usePersonalTransactions } from "@/hooks/use-personal";
import { formatDate } from "@/lib/format";
import { TransactionIcon, transactionLabel } from "./RecordsTabView";
import { palette } from "@/theme/palette";
import { TransactionAmount } from "@/components/personal/TransactionAmount";

const RECENT_COUNT = 6;

/** The latest personal transactions - the heart of the Home screen, since this is the cash flow. */
export function RecentTransactions() {
  const { data: transactions } = usePersonalTransactions();
  const { data: accounts } = usePersonalAccounts();
  const { data: categories } = usePersonalCategories();

  const recent = useMemo(
    () =>
      [...(transactions ?? [])]
        .sort((a, b) => (a.occurred_at < b.occurred_at ? 1 : a.occurred_at > b.occurred_at ? -1 : 0))
        .slice(0, RECENT_COUNT),
    [transactions]
  );

  function accountName(id: string) {
    return accounts?.find((a) => a.id === id)?.name ?? "Account";
  }

  return (
    <View className="mb-6 gap-2">
      <View className="flex-row items-center justify-between">
        <Text className="text-base font-bold text-neutral-900 dark:text-neutral-100">Recent transactions</Text>
        <Pressable
          onPress={() => router.navigate({ pathname: "/(app)/(tabs)/finances", params: { tab: "records" } })}
          className="flex-row items-center gap-1 active:opacity-70"
        >
          <Text className="text-sm font-semibold text-primary-deep">See all</Text>
          <ArrowRight color={palette.primary} size={14} />
        </Pressable>
      </View>

      {recent.length === 0 && (
        <Text className="text-sm text-neutral-500">
          Nothing logged yet. Tap Income or Expense above to add your first transaction.
        </Text>
      )}

      {recent.map((tx) => {
        const account = accounts?.find((a) => a.id === tx.account_id);
        const category = categories?.find((c) => c.id === tx.category_id)?.name ?? null;
        const isDebit = tx.kind === "expense" || tx.kind === "group_advance";
        const isCredit = tx.kind === "income" || tx.kind === "group_reimbursement";
        return (
          <Card key={tx.id} className="flex-row items-center gap-3 py-3">
            <TransactionIcon kind={tx.kind} />
            <View className="min-w-0 flex-1">
              <Text className="font-medium text-neutral-900 dark:text-neutral-100" numberOfLines={1}>
                {transactionLabel(tx, category, accountName)}
              </Text>
              <Text className="text-xs text-neutral-500" numberOfLines={1}>
                {formatDate(tx.occurred_at)} · {accountName(tx.account_id)}
              </Text>
            </View>
            <TransactionAmount
              amount={isDebit ? -tx.amount : tx.amount}
              accountId={tx.account_id}
              tone={isCredit || isDebit ? "auto" : "neutral"}
            />
          </Card>
        );
      })}
    </View>
  );
}
