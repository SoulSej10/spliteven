import { useMemo } from "react";
import { Text, View } from "react-native";
import { ArrowDownLeft, ArrowUpRight, TrendDown, TrendUp } from "phosphor-react-native";
import { computeAllAccountBalances, computeMonthlyCashFlow } from "@evensplit/shared";
import { formatMoney } from "@/lib/format";
import { usePersonalAccounts, usePersonalTransactions } from "@/hooks/use-personal";
import { CashFlowBars } from "./CashFlowBars";

/**
 * Home hero: where the money stands (total balance), how this month is going
 * (net cash flow), and the last six months of income vs expense - all from
 * the user's own personal transactions, not group data.
 */
export function CashFlowCard() {
  const { data: accounts } = usePersonalAccounts();
  const { data: transactions } = usePersonalTransactions();

  const { total, currency, months, current } = useMemo(() => {
    const balances = computeAllAccountBalances(accounts ?? [], transactions ?? []);
    const months = computeMonthlyCashFlow(transactions ?? [], 6);
    return {
      total: balances.reduce((sum, b) => sum + b.balance, 0),
      currency: accounts?.[0]?.currency ?? "PHP",
      months,
      current: months[months.length - 1],
    };
  }, [accounts, transactions]);

  if (!accounts || accounts.length === 0) return null;

  const positive = current.net >= 0;
  const TrendIcon = positive ? TrendUp : TrendDown;

  return (
    <View className="mb-4 overflow-hidden rounded-card bg-primary-deep">
      <View className="gap-4 bg-primary/95 px-5 py-5">
        <View className="flex-row items-start justify-between">
          <View className="flex-1">
            <Text className="text-xs font-medium text-white/70">Total balance</Text>
            <Text className="mt-1 text-3xl font-extrabold text-white" numberOfLines={1} adjustsFontSizeToFit>
              {formatMoney(total, currency)}
            </Text>
          </View>
          <View className="flex-row items-center gap-1.5 rounded-pill bg-white/15 px-3 py-1.5">
            <TrendIcon color="white" size={14} weight="bold" />
            <Text className="text-xs font-bold text-white">
              {positive ? "+" : "-"}
              {formatMoney(Math.abs(current.net), currency)} this month
            </Text>
          </View>
        </View>

        <View className="flex-row gap-3">
          <View className="flex-1 flex-row items-center gap-2 rounded-lg bg-white/10 px-3 py-2.5">
            <View className="h-7 w-7 items-center justify-center rounded-lg bg-white/15">
              <ArrowDownLeft color="white" size={14} />
            </View>
            <View className="shrink">
              <Text className="text-[10px] text-white/70">Income (mo.)</Text>
              <Text className="text-sm font-bold text-white" numberOfLines={1}>
                {formatMoney(current.income, currency)}
              </Text>
            </View>
          </View>
          <View className="flex-1 flex-row items-center gap-2 rounded-lg bg-white/10 px-3 py-2.5">
            <View className="h-7 w-7 items-center justify-center rounded-lg bg-white/15">
              <ArrowUpRight color="white" size={14} />
            </View>
            <View className="shrink">
              <Text className="text-[10px] text-white/70">Expense (mo.)</Text>
              <Text className="text-sm font-bold text-white" numberOfLines={1}>
                {formatMoney(current.expense, currency)}
              </Text>
            </View>
          </View>
        </View>

        <View className="rounded-lg bg-white/10 px-3 pb-3 pt-3">
          <CashFlowBars months={months} />
        </View>
      </View>
    </View>
  );
}
