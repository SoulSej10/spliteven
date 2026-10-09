"use client";

import { useMemo } from "react";
import { toast } from "sonner";
import { budgetPeriodNoun, computeBudgetProgress, computeBudgetSuggestions } from "@evensplit/shared";
import { PiggyBank, WarningCircle as AlertCircle, CheckCircle, ArrowUpRight, PencilSimple as Pencil, Sparkle, Trash as Trash2 } from "@phosphor-icons/react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { MetricCard, MetricCardGrid } from "@/components/ui/metric-card";
import { AddBudgetDialog } from "@/components/personal/add-budget-dialog";
import {
  useDeletePersonalBudget,
  usePersonalAccounts,
  usePersonalBudgets,
  usePersonalCategories,
  usePersonalTransactions,
  useUpsertPersonalBudget,
} from "@/hooks/use-personal";
import { formatMoney } from "@/lib/format";
import { useBaseTransactions } from "@/hooks/use-personal-totals";

export default function PersonalBudgetsPage() {
  const { data: budgets, isLoading } = usePersonalBudgets();
  const { data: categories } = usePersonalCategories();
  // Budgets are in the default currency: spending from accounts in another currency is converted first.
  const { base: currency, transactions } = useBaseTransactions();
  const { data: accounts } = usePersonalAccounts();
  const deleteBudget = useDeletePersonalBudget();
  const upsertBudget = useUpsertPersonalBudget();

  // Each budget counts only the spending inside its own period (month, quarter or year).
  const progress = computeBudgetProgress(budgets ?? [], categories ?? [], transactions);

  const suggestions = useMemo(
    () => computeBudgetSuggestions(categories ?? [], budgets ?? [], transactions),
    [categories, budgets, transactions]
  );

  async function onAddSuggestion(categoryId: string, limit: number) {
    try {
      await upsertBudget.mutateAsync({ category_id: categoryId, monthly_limit: limit, period: "monthly" });
      toast.success("Budget added");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not add budget");
    }
  }

  const totals = useMemo(() => {
    const totalLimit = progress.reduce((sum, p) => sum + p.limit, 0);
    const totalSpent = progress.reduce((sum, p) => sum + p.spent, 0);
    const overCount = progress.filter((p) => p.percent > 100).length;
    return { totalLimit, totalSpent, overCount };
  }, [progress]);

  async function onDelete(id: string) {
    try {
      await deleteBudget.mutateAsync(id);
      toast.success("Budget removed");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not remove budget");
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Budgets</h1>
          <p className="hidden text-sm text-muted-foreground sm:block">Spending against your monthly, quarterly and yearly limits.</p>
        </div>
        <AddBudgetDialog />
      </div>

      {!isLoading && progress.length > 0 && (
        <MetricCardGrid className="mb-6 grid-cols-3">
          <MetricCard icon={PiggyBank} label="Budgeted" value={formatMoney(totals.totalLimit, currency)} tone="primary" />
          <MetricCard icon={ArrowUpRight} label="Spent" value={formatMoney(totals.totalSpent, currency)} tone="muted" />
          <MetricCard
            icon={totals.overCount > 0 ? AlertCircle : CheckCircle}
            label="Over budget"
            value={String(totals.overCount)}
            tone={totals.overCount > 0 ? "negative" : "positive"}
          />
        </MetricCardGrid>
      )}

      {!isLoading && suggestions.length > 0 && (
        <div className="mb-6">
          <h2 className="mb-2 flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
            <Sparkle className="h-3.5 w-3.5" />{" "}
            {suggestions[0]?.is_starter ? "Try a starter budget" : "Suggested, based on last month"}
          </h2>
          <div className="grid gap-2">
            {suggestions.map((s) => (
              <Card key={s.category_id} className="flex-row items-center justify-between gap-3 p-3">
                <div className="min-w-0">
                  <p className="font-medium">{s.category_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {s.is_starter ? "A common starting point" : `Spent ${formatMoney(s.last_month_spent, currency)} last month`}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onAddSuggestion(s.category_id, s.suggested_limit)}
                  disabled={upsertBudget.isPending}
                >
                  Set {formatMoney(s.suggested_limit, currency)}
                </Button>
              </Card>
            ))}
          </div>
        </div>
      )}

      {isLoading && (
        <div className="grid gap-3">
          <Skeleton className="h-20 rounded-2xl" />
          <Skeleton className="h-20 rounded-2xl" />
        </div>
      )}

      {!isLoading && progress.length === 0 && suggestions.length === 0 && (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border py-16 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-light text-primary-deep">
            <PiggyBank className="h-6 w-6" />
          </span>
          <p className="font-medium">No budgets yet</p>
          <p className="max-w-xs text-sm text-muted-foreground">
            Set a monthly limit for a category to track your spending against it.
          </p>
        </div>
      )}

      <div className="grid gap-3">
        {budgets?.map((budget) => {
          const p = progress.find((entry) => entry.category_id === budget.category_id);
          if (!p) return null;
          const overBudget = p.percent > 100;
          const approaching = !overBudget && p.percent >= 80;
          return (
            <Card key={budget.id} className="p-4">
              <div className="mb-2 flex items-center justify-between">
                <div className="min-w-0">
                  <p className="truncate font-medium">{p.category_name}</p>
                  <p className="text-[11px] capitalize text-muted-foreground">{p.period} budget</p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <p
                    className={`text-sm tabular-nums ${
                      overBudget ? "text-destructive" : approaching ? "text-accent" : "text-muted-foreground"
                    }`}
                  >
                    {formatMoney(p.spent, currency)} / {formatMoney(p.limit, currency)}
                  </p>
                  <AddBudgetDialog
                    budget={budget}
                    trigger={
                      <button
                        className="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors hover:bg-primary-light hover:text-primary-deep"
                        aria-label="Edit budget"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                    }
                  />
                  <button
                    onClick={() => onDelete(budget.id)}
                    className="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                    aria-label="Remove budget"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              <Progress
                value={Math.min(p.percent, 100)}
                className={overBudget ? "[&>div]:bg-destructive" : approaching ? "[&>div]:bg-accent" : undefined}
              />
              {overBudget && (
                <p className="mt-1 text-xs text-destructive">
                  {formatMoney(Math.abs(p.remaining), currency)} over budget this {budgetPeriodNoun(p.period)}
                </p>
              )}
              {approaching && (
                <p className="mt-1 text-xs text-accent">
                  Approaching limit — {formatMoney(p.remaining, currency)} left
                </p>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
