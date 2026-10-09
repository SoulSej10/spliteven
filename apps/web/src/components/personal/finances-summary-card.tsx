"use client";

import { ArrowDownLeft, ArrowUpRight, Eye, EyeSlash } from "@phosphor-icons/react";
import { usePersonalTotals } from "@/hooks/use-personal-totals";
import { MASKED, useHideAmounts } from "@/hooks/use-hide-amounts";
import { formatMoney } from "@/lib/format";

/**
 * Always-visible hero summary at the top of Finances - total balance across
 * every account plus this month's income/expense, mirroring the mobile app
 * so the section reads as a real financial overview, not just CRUD tabs.
 */
export function FinancesSummaryCard() {
  const totals = usePersonalTotals();
  const { hidden, toggle } = useHideAmounts();
  if (!totals) return null;
  const { base: currency, missing } = totals;
  const show = (amount: number) => (hidden ? MASKED : formatMoney(amount, currency));

  return (
    <div className="mb-4 overflow-hidden rounded-2xl border bg-primary-light px-5 py-5 text-primary-deep lg:mb-6 lg:px-6">
      <div className="flex items-center gap-1.5">
        <p className="text-[11px] font-medium text-primary-deep/80">Total balance</p>
        <button
          type="button"
          onClick={toggle}
          aria-label={hidden ? "Show balances" : "Hide balances"}
          className="flex h-6 w-6 items-center justify-center rounded-full active:bg-primary-deep/10"
        >
          {hidden ? <EyeSlash className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
        {missing.length > 0 && <p className="truncate text-[10px] text-primary-deep/70">· set rates in Settings</p>}
      </div>
      <p className="mt-0.5 truncate text-3xl font-extrabold tabular-nums">{show(totals.total.total)}</p>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:max-w-sm">
        <div className="flex min-w-0 items-center gap-2 rounded-xl bg-card/60 px-2.5 py-2.5">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-card/80">
            <ArrowDownLeft className="h-3.5 w-3.5" />
          </span>
          <span className="min-w-0">
            <span className="block text-[10px] text-primary-deep/80">Income (mo.)</span>
            <span className="block truncate text-[13px] font-bold tabular-nums">{show(totals.current.income)}</span>
          </span>
        </div>
        <div className="flex min-w-0 items-center gap-2 rounded-xl bg-card/60 px-2.5 py-2.5">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-card/80">
            <ArrowUpRight className="h-3.5 w-3.5" />
          </span>
          <span className="min-w-0">
            <span className="block text-[10px] text-primary-deep/80">Expense (mo.)</span>
            <span className="block truncate text-[13px] font-bold tabular-nums">{show(totals.current.expense)}</span>
          </span>
        </div>
      </div>
    </div>
  );
}
