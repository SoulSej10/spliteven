import { useEffect, useMemo } from "react";
import { computeBudgetProgress, computeSharedBalancesSummary, type GroupBalanceInput } from "@evensplit/shared";
import { useAuth } from "@/hooks/use-auth";
import { useAllExpenses, useAllSettlements, useMyGroups } from "@/hooks/use-groups";
import { usePersonalBudgets, usePersonalCategories } from "@/hooks/use-personal";
import { useBaseTransactions } from "@/hooks/use-personal-totals";
import { syncReminders, useReminderPrefs, type ReminderContext } from "@/lib/reminders";

/**
 * Keeps the phone's scheduled reminders in step with the latest data. Mounted once for the whole
 * signed-in app: it rebuilds the schedule whenever the reminder choices, budgets, bills or balances
 * change, so reminders stay correct even if the app isn't opened for days.
 */
export function useReminderSync() {
  const { authUser } = useAuth();
  const prefs = useReminderPrefs();
  const { data: budgets } = usePersonalBudgets();
  const { data: categories } = usePersonalCategories();
  const { transactions } = useBaseTransactions();
  const { data: groups } = useMyGroups();
  const { data: expenses } = useAllExpenses();
  const { data: settlements } = useAllSettlements();

  const context = useMemo<ReminderContext>(() => {
    const budgetAlerts = computeBudgetProgress(budgets ?? [], categories ?? [], transactions)
      .filter((p) => p.percent >= 80)
      .map((p) => ({ name: p.category_name, percent: p.percent, period: p.period }));

    const bills = (expenses ?? [])
      .filter((e) => e.is_recurring && e.next_occurrence_date)
      .map((e) => ({ description: e.description, dueDate: e.next_occurrence_date as string }));

    let owes: ReminderContext["owes"] = [];
    if (authUser && groups && expenses && settlements) {
      const inputs: GroupBalanceInput[] = groups.map((g) => ({
        group_id: g.id,
        currency: g.currency,
        member_ids: g.group_members.map((m) => m.user_id),
        expenses: expenses.filter((e) => e.group_id === g.id),
        expense_shares: expenses.filter((e) => e.group_id === g.id).flatMap((e) => e.expense_shares),
        settlements: settlements.filter((s) => s.group_id === g.id),
      }));
      owes = computeSharedBalancesSummary(inputs, authUser.id)
        .filter((s) => s.youOwe > 0.005)
        .map((s) => ({ amount: s.youOwe, currency: s.currency }));
    }
    return { budgetAlerts, bills, owes };
  }, [authUser, budgets, categories, transactions, groups, expenses, settlements]);

  useEffect(() => {
    if (!authUser) return;
    // Wait a moment so a burst of data updates only reschedules once.
    const timer = setTimeout(() => void syncReminders(prefs, context), 1500);
    return () => clearTimeout(timer);
  }, [authUser, prefs, context]);
}
