import { View } from "react-native";
import { Pressable } from "react-native";
import { Text } from "@/components/ui/typography";
import { Eye, EyeSlash } from "phosphor-react-native";
import { MASKED, useHideAmounts } from "@/hooks/use-hide-amounts";
import { ArrowDownLeft, ArrowUpRight } from "phosphor-react-native";
import { formatMoney } from "@/lib/format";
import { usePersonalTotals } from "@/hooks/use-personal-totals";
import { palette } from "@/theme/palette";

/**
 * Always-visible hero summary at the top of Finances - total balance across
 * every account plus this month's income/expense, so the section reads as
 * a real financial overview rather than just a list of CRUD tabs.
 */
export function FinancesSummaryCard() {
  const totals = usePersonalTotals();
  const { hidden, toggle } = useHideAmounts();
  if (!totals) return null;
  const show = (amount: number) => (hidden ? MASKED : formatMoney(amount, currency));
  const { base: currency, missing } = totals;
  const total = totals.total.total;
  const monthIncome = totals.current.income;
  const monthExpense = totals.current.expense;

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
        </View>
        <View className="flex-row gap-4">
          <View className="flex-1 flex-row items-center gap-2 rounded-lg bg-surface/60 px-3 py-2.5">
            <View className="h-7 w-7 items-center justify-center rounded-lg bg-surface/80">
              <ArrowDownLeft color={palette.primary} size={14} />
            </View>
            <View>
              <Text className="text-[10px] text-primary-deep/80">Income (mo.)</Text>
              <Text className="text-sm font-bold text-primary-deep">{show(monthIncome)}</Text>
            </View>
          </View>
          <View className="flex-1 flex-row items-center gap-2 rounded-lg bg-surface/60 px-3 py-2.5">
            <View className="h-7 w-7 items-center justify-center rounded-lg bg-surface/80">
              <ArrowUpRight color={palette.primary} size={14} />
            </View>
            <View>
              <Text className="text-[10px] text-primary-deep/80">Expense (mo.)</Text>
              <Text className="text-sm font-bold text-primary-deep">{show(monthExpense)}</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}
