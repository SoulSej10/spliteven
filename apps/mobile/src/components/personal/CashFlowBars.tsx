import { Text, View } from "react-native";
import type { MonthlyCashFlow } from "@evensplit/shared";
import { palette, withAlpha } from "@/theme/palette";

const MONTH_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const BAR_AREA_HEIGHT = 64;

/**
 * Income vs expense per month as paired bars. Meant to sit on the colored
 * cash-flow hero card, so it's drawn in translucent whites: solid for
 * income, softer for expense.
 */
export function CashFlowBars({ months }: { months: MonthlyCashFlow[] }) {
  const max = Math.max(1, ...months.flatMap((m) => [m.income, m.expense]));
  const barHeight = (value: number) => (value > 0 ? Math.max(4, (value / max) * BAR_AREA_HEIGHT) : 2);

  return (
    <View>
      <View className="flex-row items-end justify-between" style={{ height: BAR_AREA_HEIGHT }}>
        {months.map((m, i) => (
          <View key={m.key} className="flex-1 flex-row items-end justify-center gap-1">
            <View
              className="w-2.5 rounded-t-full"
              style={{ height: barHeight(m.income), backgroundColor: withAlpha(palette.onPrimary, 0.95) }}
            />
            <View
              className="w-2.5 rounded-t-full"
              style={{
                height: barHeight(m.expense),
                backgroundColor: withAlpha(palette.onPrimary, 0.4),
                opacity: i === months.length - 1 ? 1 : 0.9,
              }}
            />
          </View>
        ))}
      </View>
      <View className="mt-1.5 flex-row justify-between">
        {months.map((m, i) => (
          <Text
            key={m.key}
            className={`flex-1 text-center text-[10px] ${i === months.length - 1 ? "font-bold text-on-primary" : "text-on-primary/70"}`}
          >
            {MONTH_SHORT[m.month]}
          </Text>
        ))}
      </View>
      <View className="mt-2 flex-row items-center justify-center gap-4">
        <View className="flex-row items-center gap-1.5">
          <View className="h-2 w-2 rounded-full" style={{ backgroundColor: withAlpha(palette.onPrimary, 0.95) }} />
          <Text className="text-[10px] text-on-primary/80">Income</Text>
        </View>
        <View className="flex-row items-center gap-1.5">
          <View className="h-2 w-2 rounded-full" style={{ backgroundColor: withAlpha(palette.onPrimary, 0.4) }} />
          <Text className="text-[10px] text-on-primary/80">Expense</Text>
        </View>
      </View>
    </View>
  );
}
