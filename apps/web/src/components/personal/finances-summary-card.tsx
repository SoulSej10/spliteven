"use client";

import { ArrowDownLeft, ArrowUpRight } from "@phosphor-icons/react";
import { usePersonalTotals } from "@/hooks/use-personal-totals";
import { formatMoney } from "@/lib/format";

/**
 * Always-visible hero summary at the top of Finances - total balance across
 * every account plus this month's income/expense, mirroring the mobile app
 * so the section reads as a real financial overview, not just CRUD tabs.
 */
export function FinancesSummaryCard() {
  const totals = usePersonalTotals();
  if (!totals) return null;
  const { base: currency, missing } = totals;
  const total = totals.total.total;
  const monthIncome = totals.current.income;
  const monthExpense = totals.current.expense;

  return (
    <div className="mb-6 overflow-hidden rounded-2xl border bg-primary-light px-6 py-5 text-primary-deep">
      <p className="text-xs font-medium text-primary-deep/80">{missing.length > 0 ? "Total balance · set rates in Settings" : "Total balance"}</p>
      <p className="mt-1 text-3xl font-extrabold">{formatMoney(total, currency)}</p>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:max-w-sm">
        <div className="flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2.5">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/15">
            <ArrowDownLeft className="h-3.5 w-3.5" />
          </span>
          <span>
            <span className="block text-[10px] text-primary-deep/80">Income (mo.)</span>
            <span className="block text-sm font-bold">{formatMoney(monthIncome, currency)}</span>
          </span>
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2.5">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/15">
            <ArrowUpRight className="h-3.5 w-3.5" />
          </span>
          <span>
            <span className="block text-[10px] text-primary-deep/80">Expense (mo.)</span>
            <span className="block text-sm font-bold">{formatMoney(monthExpense, currency)}</span>
          </span>
        </div>
      </div>
    </div>
  );
}
