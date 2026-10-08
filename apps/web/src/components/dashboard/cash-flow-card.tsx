"use client";

import { useMemo } from "react";
import { ArrowDownLeft, ArrowUpRight, TrendDown, TrendUp } from "@phosphor-icons/react";
import { computeAllAccountBalances, computeMonthlyCashFlow } from "@evensplit/shared";
import { usePersonalAccounts, usePersonalTransactions } from "@/hooks/use-personal";
import { formatMoney } from "@/lib/format";

const MONTH_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const BAR_AREA_HEIGHT = 96;

/**
 * Dashboard hero: total balance, this month's net cash flow, income vs expense
 * and the last six months as paired bars - all from the user's own personal
 * transactions, not group data.
 */
export function CashFlowCard() {
  const { data: accounts } = usePersonalAccounts();
  const { data: transactions } = usePersonalTransactions();

  const { total, currency, months, current, max } = useMemo(() => {
    const balances = computeAllAccountBalances(accounts ?? [], transactions ?? []);
    const months = computeMonthlyCashFlow(transactions ?? [], 6);
    return {
      total: balances.reduce((sum, b) => sum + b.balance, 0),
      currency: accounts?.[0]?.currency ?? "PHP",
      months,
      current: months[months.length - 1],
      max: Math.max(1, ...months.flatMap((m) => [m.income, m.expense])),
    };
  }, [accounts, transactions]);

  if (!accounts || accounts.length === 0) return null;

  const positive = current.net >= 0;
  const TrendIcon = positive ? TrendUp : TrendDown;
  const barHeight = (value: number) => (value > 0 ? Math.max(4, (value / max) * BAR_AREA_HEIGHT) : 2);

  return (
    <div className="mb-6 overflow-hidden rounded-2xl bg-primary text-primary-foreground shadow-md">
      <div className="grid gap-6 p-6 lg:grid-cols-[1fr_1.1fr] lg:items-center">
        <div className="space-y-5">
          <div>
            <p className="text-xs font-medium opacity-70">Total balance</p>
            <p className="mt-1 font-mono text-3xl font-semibold tabular-nums">{formatMoney(total, currency)}</p>
            <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-primary-foreground/15 px-3 py-1 text-xs font-semibold">
              <TrendIcon className="h-3.5 w-3.5" weight="bold" />
              {positive ? "+" : "-"}
              {formatMoney(Math.abs(current.net), currency)} this month
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2.5 rounded-xl bg-primary-foreground/10 px-3 py-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-foreground/15">
                <ArrowDownLeft className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <p className="text-[11px] opacity-70">Income (mo.)</p>
                <p className="truncate font-mono text-sm font-semibold tabular-nums">
                  {formatMoney(current.income, currency)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2.5 rounded-xl bg-primary-foreground/10 px-3 py-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-foreground/15">
                <ArrowUpRight className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <p className="text-[11px] opacity-70">Expense (mo.)</p>
                <p className="truncate font-mono text-sm font-semibold tabular-nums">
                  {formatMoney(current.expense, currency)}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-primary-foreground/10 px-4 pb-3 pt-4">
          <div className="flex items-end justify-between gap-1" style={{ height: BAR_AREA_HEIGHT }}>
            {months.map((m) => (
              <div key={m.key} className="flex flex-1 items-end justify-center gap-1">
                <div
                  className="w-3 rounded-t-full bg-primary-foreground"
                  style={{ height: barHeight(m.income) }}
                  title={`${MONTH_SHORT[m.month]} income ${formatMoney(m.income, currency)}`}
                />
                <div
                  className="w-3 rounded-t-full bg-primary-foreground/40"
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
              <span className="h-2 w-2 rounded-full bg-primary-foreground" /> Income
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-primary-foreground/40" /> Expense
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
