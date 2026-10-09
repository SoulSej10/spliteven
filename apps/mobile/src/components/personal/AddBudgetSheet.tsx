import { useEffect, useState } from "react";
import { Alert, Pressable, ScrollView, View } from "react-native";
import { Text } from "@/components/ui/typography";
import { budgetPeriodNoun, createPersonalBudgetSchema, type BudgetPeriod, type PersonalBudget } from "@evensplit/shared";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { Button } from "@/components/ui/Button";
import { AmountField } from "@/components/ui/AmountField";
import { usePersonalCategories, useUpsertPersonalBudget } from "@/hooks/use-personal";
import { cn } from "@/lib/cn";
import { AppIcon } from "@/components/ui/AppIcon";

const PERIODS: { value: BudgetPeriod; label: string }[] = [
  { value: "monthly", label: "Monthly" },
  { value: "quarterly", label: "Quarterly" },
  { value: "yearly", label: "Yearly" },
];

export function AddBudgetSheet({
  visible,
  onClose,
  budget,
}: {
  visible: boolean;
  onClose: () => void;
  /** When set, the sheet edits this budget (its category stays fixed) instead of creating one. */
  budget?: PersonalBudget;
}) {
  const { data: categories } = usePersonalCategories();
  const upsertBudget = useUpsertPersonalBudget();
  const expenseCategories = categories?.filter((c) => c.kind === "expense") ?? [];

  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [monthlyLimit, setMonthlyLimit] = useState("");
  const [period, setPeriod] = useState<BudgetPeriod>("monthly");
  const [submitting, setSubmitting] = useState(false);
  const editing = !!budget;

  useEffect(() => {
    if (!visible) return;
    if (budget) {
      setCategoryId(budget.category_id);
      setMonthlyLimit(String(budget.monthly_limit));
      setPeriod(budget.period ?? "monthly");
    } else {
      setCategoryId(null);
      setMonthlyLimit("");
      setPeriod("monthly");
    }
  }, [visible, budget]);

  async function onSubmit() {
    const parsed = createPersonalBudgetSchema.safeParse({
      category_id: categoryId,
      monthly_limit: Number(monthlyLimit) || 0,
      period,
    });
    if (!parsed.success) {
      Alert.alert("Check the budget details", parsed.error.issues[0]?.message ?? "Invalid input");
      return;
    }
    setSubmitting(true);
    try {
      await upsertBudget.mutateAsync(parsed.data);
      onClose();
    } catch (err) {
      Alert.alert("Could not save budget", err instanceof Error ? err.message : "Try again");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title={editing ? "Edit budget" : "Set a budget"}
      footer={
        <Button onPress={onSubmit} loading={submitting} size="lg">
          {editing ? "Save changes" : "Save budget"}
        </Button>
      }
    >
      <View className="gap-1.5">
        <Text className="text-sm font-medium text-neutral-900 dark:text-neutral-100">Category</Text>
        {expenseCategories.length === 0 ? (
          <Text className="text-sm text-neutral-500">Add an expense category first.</Text>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-2">
            {expenseCategories.map((c) => (
              <Pressable
                key={c.id}
                disabled={editing && c.id !== categoryId}
                onPress={() => setCategoryId(c.id)}
                className={cn(
                  "rounded-pill border px-3 py-1.5",
                  categoryId === c.id ? "border-primary bg-primary-light" : "border-neutral-500/20"
                )}
              >
                <View className="flex-row items-center gap-1.5">
                  {c.icon ? <AppIcon value={c.icon} size={15} /> : null}
                  <Text
                    className={cn("text-sm font-medium", categoryId === c.id ? "text-primary-deep" : "text-neutral-500")}
                  >
                    {c.name}
                  </Text>
                </View>
              </Pressable>
            ))}
          </ScrollView>
        )}
      </View>

      <View className="gap-1.5">
        <Text className="text-sm font-medium text-neutral-900 dark:text-neutral-100">Repeats</Text>
        <View className="flex-row gap-2">
          {PERIODS.map((p) => (
            <Pressable
              key={p.value}
              onPress={() => setPeriod(p.value)}
              className={cn(
                "flex-1 items-center rounded-pill border py-2",
                period === p.value ? "border-primary bg-primary-light" : "border-neutral-500/20"
              )}
            >
              <Text className={cn("text-sm font-semibold", period === p.value ? "text-primary-deep" : "text-neutral-500")}>
                {p.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <AmountField label={`Limit per ${budgetPeriodNoun(period)}`} value={monthlyLimit} onChangeText={setMonthlyLimit} />
    </BottomSheet>
  );
}
