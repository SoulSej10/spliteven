import { View } from "react-native";
import { Text } from "@/components/ui/typography";
import { ArrowDownLeft, ArrowUpRight, TrendDown, TrendUp } from "phosphor-react-native";
import { formatMoney } from "@/lib/format";
import { usePersonalTotals } from "@/hooks/use-personal-totals";
import { CashFlowBars } from "./CashFlowBars";
import { palette } from "@/theme/palette";

/**
 * Home hero: where the money stands (total balance), how this month is going
 * (net cash flow), and the last six months of income vs expense - all from
 * the user's own personal transactions, not group data.
 */
export function CashFlowCard() {
  const totals = usePersonalTotals();
  if (!totals) return null;
  const { months, current, base: currency, missing } = totals;
  const total = totals.total.total;

  const positive = current.net >= 0;
  const TrendIcon = positive ? TrendUp : TrendDown;

  return (
    <View className="mb-4 overflow-hidden rounded-card border border-neutral-200 bg-primary-light">
      <View className="gap-4 px-5 py-5">
        <View className="flex-row items-start justify-between">
          <View className="flex-1">
            <Text className="text-xs font-medium text-primary-deep/80">{missing.length > 0 ? "Total balance · add a rate below" : "Total balance"}</Text>
            <Text className="mt-1 text-3xl font-extrabold text-primary-deep" numberOfLines={1} adjustsFontSizeToFit>
              {formatMoney(total, currency)}
            </Text>
          </View>
          <View className="flex-row items-center gap-1.5 rounded-pill bg-surface/80 px-3 py-1.5">
            <TrendIcon color={palette.primary} size={14} weight="bold" />
            <Text className="text-xs font-bold text-primary-deep">
              {positive ? "+" : "-"}
              {formatMoney(Math.abs(current.net), currency)} this month
            </Text>
          </View>
        </View>

        <View className="flex-row gap-3">
          <View className="flex-1 flex-row items-center gap-2 rounded-lg bg-surface/60 px-3 py-2.5">
            <View className="h-7 w-7 items-center justify-center rounded-lg bg-surface/80">
              <ArrowDownLeft color={palette.primary} size={14} />
            </View>
            <View className="shrink">
              <Text className="text-[10px] text-primary-deep/80">Income (mo.)</Text>
              <Text className="text-sm font-bold text-primary-deep" numberOfLines={1}>
                {formatMoney(current.income, currency)}
              </Text>
            </View>
          </View>
          <View className="flex-1 flex-row items-center gap-2 rounded-lg bg-surface/60 px-3 py-2.5">
            <View className="h-7 w-7 items-center justify-center rounded-lg bg-surface/80">
              <ArrowUpRight color={palette.primary} size={14} />
            </View>
            <View className="shrink">
              <Text className="text-[10px] text-primary-deep/80">Expense (mo.)</Text>
              <Text className="text-sm font-bold text-primary-deep" numberOfLines={1}>
                {formatMoney(current.expense, currency)}
              </Text>
            </View>
          </View>
        </View>

        <View className="rounded-lg bg-surface/60 px-3 pb-3 pt-3">
          <CashFlowBars months={months} />
        </View>
      </View>
    </View>
  );
}
