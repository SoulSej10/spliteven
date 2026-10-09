"use client";

import { useEffect, useMemo, useRef } from "react";
import { budgetPeriodNoun, computeBudgetProgress } from "@evensplit/shared";
import { useAuth } from "@/hooks/use-auth";
import { useAllExpenses } from "@/hooks/use-groups";
import { usePersonalBudgets, usePersonalCategories } from "@/hooks/use-personal";
import { useBaseTransactions } from "@/hooks/use-personal-totals";
import { firstTimeToday, notificationPermission, showReminder, useReminderPrefs } from "@/lib/reminders";

/**
 * Fires the reminders the user turned on, while SplitEven is open. It checks once a minute; each kind
 * of reminder shows at most once a day. (Closed-app reminders are the Android app's job.)
 */
export function ReminderRunner() {
  const { authUser } = useAuth();
  const prefs = useReminderPrefs();
  const { data: budgets } = usePersonalBudgets();
  const { data: categories } = usePersonalCategories();
  const { transactions } = useBaseTransactions();
  const { data: expenses } = useAllExpenses();

  const dueBills = useMemo(() => {
    const tomorrow = new Date(Date.now() + 86_400_000);
    const key = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, "0")}-${String(tomorrow.getDate()).padStart(2, "0")}`;
    return (expenses ?? []).filter((e) => e.is_recurring && e.next_occurrence_date === key);
  }, [expenses]);

  const alerts = useMemo(
    () => computeBudgetProgress(budgets ?? [], categories ?? [], transactions).filter((p) => p.percent >= 80),
    [budgets, categories, transactions]
  );

  const latest = useRef({ prefs, dueBills, alerts });
  latest.current = { prefs, dueBills, alerts };

  // Needed so notifications work on phones and so the site can be installed.
  useEffect(() => {
    if ("serviceWorker" in navigator) void navigator.serviceWorker.register("/sw.js").catch(() => {});
  }, []);

  useEffect(() => {
    if (!authUser) return;
    function tick() {
      if (notificationPermission() !== "granted") return;
      const { prefs: p, dueBills: bills, alerts: budgetAlerts } = latest.current;
      const now = new Date();
      if (p.daily && (now.getHours() > p.hour || (now.getHours() === p.hour && now.getMinutes() >= p.minute)) && firstTimeToday("daily")) {
        void showReminder("Log today's spending", "Add what you spent today to keep your balance accurate.");
      }
      if (p.bills && bills.length > 0 && now.getHours() >= 9 && firstTimeToday("bills")) {
        void showReminder("Bill due soon", `${bills.map((b) => b.description).join(", ")} ${bills.length === 1 ? "is" : "are"} due tomorrow.`);
      }
      if (p.budgets && budgetAlerts.length > 0 && now.getHours() >= 9 && firstTimeToday("budgets")) {
        const first = budgetAlerts[0];
        void showReminder(
          first.percent > 100 ? "Over budget" : "Budget alert",
          `${first.category_name} has used ${Math.round(first.percent)}% of its ${budgetPeriodNoun(first.period)} budget.`
        );
      }
    }
    tick();
    const id = window.setInterval(tick, 60_000);
    return () => window.clearInterval(id);
  }, [authUser]);

  return null;
}
