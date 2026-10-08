import { Pressable, View } from "react-native";
import { Text } from "@/components/ui/typography";
import { CaretRight } from "phosphor-react-native";
import { formatMoney } from "@/lib/format";
import { palette } from "@/theme/palette";
import { AppIcon } from "@/components/ui/AppIcon";

export interface BreakdownRow {
  label: string;
  icon?: string | null;
  amount: number;
  percent: number;
  color: string;
  /** When set, the row is tappable (e.g. to open the trail behind its number). */
  onPress?: () => void;
}

/**
 * Detailed per-category list under a donut chart — icon, name, amount, a
 * thin progress bar, and the percentage of the total, one row per category.
 * The donut's own legend only shows a color dot + name; this is the
 * "actual data" view per direct feedback ("showcasing of the actual data
 * of those graphical analysis"), matching MyMoney's category list under
 * its donut.
 */
export function CategoryBreakdownList({ rows, currency }: { rows: BreakdownRow[]; currency: string }) {
  if (rows.length === 0) return null;

  return (
    <View className="gap-3">
      {rows.map((r) => (
        <Pressable
          key={r.label}
          disabled={!r.onPress}
          onPress={r.onPress}
          className="gap-1.5 active:opacity-70"
          accessibilityRole={r.onPress ? "button" : undefined}
          accessibilityHint={r.onPress ? "Shows the transactions behind this amount" : undefined}
        >
          <View className="flex-row items-center gap-2.5">
            <AppIcon value={r.icon} fallback="🏷️" size={18} />
            <Text className="flex-1 text-sm font-medium capitalize text-neutral-900 dark:text-neutral-100" numberOfLines={1}>
              {r.label}
            </Text>
            <Text className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
              {formatMoney(r.amount, currency)}
            </Text>
            {r.onPress && <CaretRight size={13} color={palette.muted} />}
          </View>
          <View className="flex-row items-center gap-2">
            <View className="h-1.5 flex-1 overflow-hidden rounded-full bg-neutral-500/15">
              <View
                className="h-full rounded-full"
                style={{ width: `${Math.min(100, r.percent)}%`, backgroundColor: r.color }}
              />
            </View>
            <Text className="w-10 text-right text-xs text-neutral-500">{r.percent.toFixed(0)}%</Text>
          </View>
        </Pressable>
      ))}
    </View>
  );
}
