import { View } from "react-native";
import { Pressable } from "react-native";
import { Text } from "@/components/ui/typography";
import { Eye, EyeSlash } from "phosphor-react-native";
import { MASKED, useHideAmounts } from "@/hooks/use-hide-amounts";
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
  const { hidden, toggle } = useHideAmounts();
  if (!totals) return null;
  const show = (amount: number) => (hidden ? MASKED : formatMoney(amount, currency));
  const { months, current, base: currency, missing } = totals;
  const total = totals.total.total;

  const positive = current.net >= 0;
  const TrendIcon = positive ? TrendUp : TrendDown;

  return (
    <View className="mb-4 overflow-hidden rounded-card border border-neutral-200 bg-primary-light">
      <View className="gap-4 px-5 py-5">
        <View>
          <View className="flex-row items-center gap-1.5">
            <Text className="text-[11px] font-medium text-primary-deep/80">Total balance</Text>
            <Pressable onPress={toggle} hitSlop={10} accessibilityLabel={hidden ? "Show balances" : "Hide balances"}>
              {hidden ? <EyeSlash size={15} color={palette.primary} /> : <Eye size={15} color={palette.primary} />}
            </Pressable>
            {missing.length > 0 && (
              <Text className="text-[10px] text-primary-deep/70" numberOfLines={1}>
                · set rates in Settings
              </Text>
            )}
          </View>
          <Text className="mt-0.5 text-3xl font-extrabold text-primary-deep" numberOfLines={1} adjustsFontSizeToFit>
            {show(total)}
          </Text>
          <View className="mt-2 flex-row items-center gap-1 self-start rounded-pill bg-surface/80 px-2 py-0.5">
            <TrendIcon color={palette.primary} size={11} weight="bold" />
            <Text className="text-[10px] font-bold text-primary-deep" numberOfLines={1}>
              {positive ? "+" : "-"}
              {show(Math.abs(current.net))} this month
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
                {show(current.income)}
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
                {show(current.expense)}
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
