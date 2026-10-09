import { useMemo, useState } from "react";
import { Alert, Pressable, View } from "react-native";
import { Text } from "@/components/ui/typography";
import { budgetPeriodNoun, computeBudgetProgress, computeBudgetSuggestions, type PersonalBudget } from "@evensplit/shared";
import { PencilSimple as Pencil, PiggyBank, Sparkle, Trash as Trash2 } from "phosphor-react-native";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { SkeletonCardRows } from "@/components/ui/Skeleton";
import { ErrorState } from "@/components/ui/ErrorState";
import {
  useDeletePersonalBudget,
  usePersonalAccounts,
  usePersonalBudgets,
  usePersonalCategories,
  usePersonalTransactions,
  useUpsertPersonalBudget,
} from "@/hooks/use-personal";
import { formatMoney } from "@/lib/format";
import { palette } from "@/theme/palette";
import { useBaseTransactions } from "@/hooks/use-personal-totals";
import { AddBudgetSheet } from "@/components/personal/AddBudgetSheet";

/** The "Set budget" action lives in finances.tsx's floating action button, not inline here. */
export function BudgetsTabView() {
  const { data: budgets, isLoading, isError, refetch } = usePersonalBudgets();
  const { data: categories } = usePersonalCategories();
  // Budgets are in the default currency: spending from accounts in another currency is converted first.
  const { base: currency, transactions } = useBaseTransactions();
  const { data: accounts } = usePersonalAccounts();
  const deleteBudget = useDeletePersonalBudget();
  const upsertBudget = useUpsertPersonalBudget();

  const [editing, setEditing] = useState<PersonalBudget | null>(null);

  // Each budget counts only the spending inside its own period (month, quarter or year).
  const progress = computeBudgetProgress(budgets ?? [], categories ?? [], transactions);

  const suggestions = useMemo(
    () => computeBudgetSuggestions(categories ?? [], budgets ?? [], transactions),
    [categories, budgets, transactions]
  );

  function onDelete(id: string) {
    Alert.alert("Remove this budget?", "", [
      { text: "Cancel", style: "cancel" },
      { text: "Remove", style: "destructive", onPress: () => deleteBudget.mutate(id) },
    ]);
  }

  function onAddSuggestion(categoryId: string, limit: number) {
    upsertBudget.mutate(
      { category_id: categoryId, monthly_limit: limit, period: "monthly" },
      { onError: (err) => Alert.alert("Could not add budget", err instanceof Error ? err.message : "Try again") }
    );
  }

  if (isLoading) return <SkeletonCardRows count={3} />;
  if (isError) return <ErrorState message="Couldn't load budgets." onRetry={() => refetch()} />;

  return (
    <View className="gap-3">
      {suggestions.length > 0 && (
        <View className="gap-2">
          <View className="flex-row items-center gap-1.5">
            <Sparkle color={palette.muted} size={13} />
            <Text className="text-xs font-medium text-neutral-500">
              {suggestions[0]?.is_starter ? "Try a starter budget" : "Suggested, based on last month"}
            </Text>
          </View>
          {suggestions.map((s) => (
            <Card key={s.category_id} className="flex-row items-center justify-between gap-3 py-3">
              <View className="flex-1">
                <Text className="font-medium text-neutral-900 dark:text-neutral-100">{s.category_name}</Text>
                <Text className="text-xs text-neutral-500">
                  {s.is_starter ? "A common starting point" : `Spent ${formatMoney(s.last_month_spent, currency)} last month`}
                </Text>
              </View>
              <Button
                variant="outline"
                size="sm"
                onPress={() => onAddSuggestion(s.category_id, s.suggested_limit)}
                disabled={upsertBudget.isPending}
              >
                <Text className="text-sm font-semibold text-primary-deep">Set {formatMoney(s.suggested_limit, currency)}</Text>
              </Button>
            </Card>
          ))}
        </View>
      )}

      {progress.length === 0 && suggestions.length === 0 && (
        <View className="items-center gap-2 py-14">
          <View className="h-14 w-14 items-center justify-center rounded-full bg-primary-light">
            <PiggyBank color={palette.primary} size={22} />
          </View>
          <Text className="text-sm text-neutral-500">Set a limit for a category to track it here.</Text>
        </View>
      )}

      {budgets?.map((budget) => {
        const p = progress.find((entry) => entry.category_id === budget.category_id);
        if (!p) return null;
        const overBudget = p.percent > 100;
        const approaching = !overBudget && p.percent >= 80;
        const barWidth = Math.min(p.percent, 100);
        const barColorClass = overBudget ? "bg-negative" : approaching ? "bg-accent" : "bg-primary";
        const amountColorClass = overBudget ? "text-negative" : approaching ? "text-accent-deep" : "text-neutral-500";
        return (
          <Card key={budget.id} className="gap-2 py-3">
            <View className="flex-row items-center justify-between">
              <View className="flex-1 pr-2">
                <Text className="font-medium text-neutral-900 dark:text-neutral-100" numberOfLines={1}>
                  {p.category_name}
                </Text>
                <Text className="text-[11px] capitalize text-neutral-500">{p.period} budget</Text>
              </View>
              <View className="flex-row items-center gap-3">
                <Text className={`text-xs ${amountColorClass}`}>
                  {formatMoney(p.spent, currency)} / {formatMoney(p.limit, currency)}
                </Text>
                <Pressable onPress={() => setEditing(budget)} hitSlop={10} accessibilityLabel="Edit budget">
                  <Pencil color={palette.muted} size={15} />
                </Pressable>
                <Pressable onPress={() => onDelete(budget.id)} hitSlop={10} accessibilityLabel="Remove budget">
                  <Trash2 color={palette.negative} size={14} />
                </Pressable>
              </View>
            </View>
            <View className="h-1.5 overflow-hidden rounded-full bg-neutral-100 dark:bg-white/10">
              <View className={`h-full ${barColorClass}`} style={{ width: `${barWidth}%` }} />
            </View>
            {overBudget && (
              <Text className="text-xs text-negative">{formatMoney(Math.abs(p.remaining), currency)} over budget this {budgetPeriodNoun(p.period)}</Text>
            )}
            {approaching && (
              <Text className="text-xs text-accent-deep">Approaching limit — {formatMoney(p.remaining, currency)} left</Text>
            )}
          </Card>
        );
      })}

      <AddBudgetSheet visible={editing !== null} onClose={() => setEditing(null)} budget={editing ?? undefined} />
    </View>
  );
}
