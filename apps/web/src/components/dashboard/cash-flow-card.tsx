"use client";

import { ArrowDownLeft, ArrowUpRight, Eye, EyeSlash, TrendDown, TrendUp } from "@phosphor-icons/react";
import { MASKED, useHideAmounts } from "@/hooks/use-hide-amounts";
import { usePersonalTotals } from "@/hooks/use-personal-totals";
import { formatMoney } from "@/lib/format";

const MONTH_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const BAR_AREA_HEIGHT = 96;

/**
 * Dashboard hero: total balance, this month's net cash flow, income vs expense
 * and the last six months as paired bars - all from the user's own personal
 * transactions, not group data.
 */
export function CashFlowCard() {
  const totals = usePersonalTotals();
  const { hidden, toggle } = useHideAmounts();
  if (!totals) return null;
  const { months, current, base: currency, missing } = totals;
  const total = totals.total.total;
  const max = Math.max(1, ...months.flatMap((m) => [m.income, m.expense]));

  const positive = current.net >= 0;
  const TrendIcon = positive ? TrendUp : TrendDown;
  const show = (amount: number) => (hidden ? MASKED : formatMoney(amount, currency));
  const barHeight = (value: number) => (value > 0 ? Math.max(4, (value / max) * BAR_AREA_HEIGHT) : 2);

  return (
    <div className="mb-4 overflow-hidden rounded-2xl border bg-primary-light text-primary-deep lg:mb-6">
      <div className="grid gap-4 p-5 lg:grid-cols-[1fr_1.1fr] lg:items-center lg:gap-6 lg:p-6">
        <div className="space-y-5">
          <div>
            <div className="flex items-center gap-1.5">
              <p className="text-[11px] font-medium opacity-70">Total balance</p>
              <button
                type="button"
                onClick={toggle}
                aria-label={hidden ? "Show balances" : "Hide balances"}
                className="flex h-6 w-6 items-center justify-center rounded-full active:bg-primary-deep/10"
              >
                {hidden ? <EyeSlash className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
              {missing.length > 0 && <p className="truncate text-[10px] opacity-70">· set rates in Settings</p>}
            </div>
            <p className="mt-0.5 truncate text-3xl font-extrabold tabular-nums">{show(total)}</p>
            <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-card/80 px-2.5 py-0.5 text-[10px] font-bold">
              <TrendIcon className="h-3 w-3" weight="bold" />
              {positive ? "+" : "-"}
              {show(Math.abs(current.net))} this month
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex min-w-0 items-center gap-2 rounded-xl bg-card/60 px-2.5 py-2.5">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-card/80">
                <ArrowDownLeft className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <p className="text-[11px] opacity-70">Income (mo.)</p>
                <p className="truncate text-[13px] font-bold tabular-nums">
                  {show(current.income)}
                </p>
              </div>
            </div>
            <div className="flex min-w-0 items-center gap-2 rounded-xl bg-card/60 px-2.5 py-2.5">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-card/80">
                <ArrowUpRight className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <p className="text-[11px] opacity-70">Expense (mo.)</p>
                <p className="truncate text-[13px] font-bold tabular-nums">
                  {show(current.expense)}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-card/60 px-4 pb-3 pt-4">
          <div className="flex items-end justify-between gap-1" style={{ height: BAR_AREA_HEIGHT }}>
            {months.map((m) => (
              <div key={m.key} className="flex flex-1 items-end justify-center gap-1">
                <div
                  className="w-3 rounded-t-full bg-primary-deep"
                  style={{ height: barHeight(m.income) }}
                  title={`${MONTH_SHORT[m.month]} income ${formatMoney(m.income, currency)}`}
                />
                <div
                  className="w-3 rounded-t-full bg-primary-deep/40"
                  style={{ height: barHeight(m.expense) }}
                  title={`${MONTH_SHORT[m.month]} expense ${formatMoney(m.expense, currency)}`}
                />
              </div>
            ))}
          </div>
          <div className="mt-2 flex justify-between">
            {months.map((m, i) => (
              <span
                key={m.key}
                className={`flex-1 text-center text-[11px] ${i === months.length - 1 ? "font-bold" : "opacity-70"}`}
              >
                {MONTH_SHORT[m.month]}
              </span>
            ))}
          </div>
          <div className="mt-3 flex items-center justify-center gap-4 text-[11px] opacity-80">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-primary-deep" /> Income
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-primary-deep/40" /> Expense
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
