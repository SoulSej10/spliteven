"use client";

import { use, useMemo } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle, UsersThree } from "@phosphor-icons/react";
import { computeCategoryBreakdown, computeCategoryTrail } from "@evensplit/shared";
import { Skeleton } from "@/components/ui/skeleton";
import { usePersonalAccounts, usePersonalCategories, usePersonalTransactions } from "@/hooks/use-personal";
import { formatDate, formatMoney } from "@/lib/format";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/**
 * The trail behind one Analysis number: every transaction that was added up
 * to produce a category's total for the month, oldest first, with the
 * running total after each one, ending at the figure that was clicked.
 */
export default function CategoryTrailPage({
  params,
  searchParams,
}: {
  params: Promise<{ categoryId: string }>;
  searchParams: Promise<{ month?: string; kind?: string }>;
}) {
  const { categoryId } = use(params);
  const { month, kind: kindParam } = use(searchParams);

  const { data: transactions, isLoading } = usePersonalTransactions();
  const { data: accounts } = usePersonalAccounts();
  const { data: categories } = usePersonalCategories();

  const kind: "income" | "expense" = kindParam === "income" ? "income" : "expense";
  const category = categoryId !== "none" ? categoryId : null;
  const currency = accounts?.[0]?.currency ?? "PHP";

  const monthTransactions = useMemo(
    () => (transactions ?? []).filter((t) => month && t.occurred_at.slice(0, 7) === month),
    [transactions, month]
  );
  const trail = useMemo(() => computeCategoryTrail(monthTransactions, category, kind), [monthTransactions, category, kind]);
  const share = useMemo(
    () => computeCategoryBreakdown(monthTransactions, categories ?? [], kind).find((b) => b.category_id === category)?.percent ?? 0,
    [monthTransactions, categories, kind, category]
  );

  const categoryInfo = categories?.find((c) => c.id === category);
  const name = categoryInfo?.name ?? "Uncategorized";
  const monthLabel = month ? `${MONTH_NAMES[Number(month.slice(5, 7)) - 1] ?? ""} ${month.slice(0, 4)}` : "";
  const accountName = (id: string) => accounts?.find((a) => a.id === id)?.name ?? "Account";

  if (isLoading) {
    return (
      <div className="grid gap-4">
        <Skeleton className="h-40 rounded-2xl" />
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link
        href="/personal/analysis"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Analysis
      </Link>

      <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{categoryInfo?.icon ?? "🏷️"}</span>
          <div className="min-w-0">
            <h2 className="truncate text-lg font-semibold capitalize">{name}</h2>
            <p className="text-sm text-muted-foreground">
              {kind === "expense" ? "Spending" : "Income"} in {monthLabel}
            </p>
          </div>
        </div>
        <p className="mt-4 font-mono text-3xl font-semibold tabular-nums">{formatMoney(trail.total, currency)}</p>
        <p className="mt-1 text-sm text-muted-foreground">
          {share.toFixed(0)}% of your {kind === "expense" ? "spending" : "income"} this month
        </p>
        <div className="mt-4 grid grid-cols-3 gap-3">
          <div className="rounded-xl bg-muted px-3 py-2">
            <p className="text-xs text-muted-foreground">Transactions</p>
            <p className="text-sm font-semibold">{trail.count}</p>
          </div>
          <div className="rounded-xl bg-muted px-3 py-2">
            <p className="text-xs text-muted-foreground">Average</p>
            <p className="truncate font-mono text-sm font-semibold tabular-nums">{formatMoney(trail.average, currency)}</p>
          </div>
          <div className="rounded-xl bg-muted px-3 py-2">
            <p className="text-xs text-muted-foreground">Largest</p>
            <p className="truncate font-mono text-sm font-semibold tabular-nums">
              {formatMoney(trail.largest?.amount ?? 0, currency)}
            </p>
          </div>
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-base font-semibold">How this adds up</h3>
        {trail.entries.length === 0 ? (
          <p className="text-sm text-muted-foreground">No transactions found for this category in {monthLabel}.</p>
        ) : (
          <ol className="relative space-y-3 border-l-2 border-border/70 pl-5">
            {trail.entries.map((entry) => (
              <li key={entry.id} className="relative">
                <span className="absolute -left-[27px] top-4 h-3 w-3 rounded-full bg-primary ring-4 ring-background" />
                <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{entry.note?.trim() ? entry.note : name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(entry.occurred_at)} · {accountName(entry.account_id)}
                      </p>
                      {entry.groups && entry.linked_group_id && (
                        <Link
                          href={`/groups/${entry.linked_group_id}`}
                          className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                        >
                          <UsersThree className="h-3 w-3" /> Your share from {entry.groups.name}
                        </Link>
                      )}
                    </div>
                    <p className="shrink-0 font-mono text-sm font-semibold tabular-nums">
                      {kind === "expense" ? "-" : "+"}
                      {formatMoney(entry.amount, currency)}
                    </p>
                  </div>
                  <div className="mt-3 flex items-center justify-between border-t border-border/60 pt-2 text-xs">
                    <span className="text-muted-foreground">Running total</span>
                    <span className="font-mono font-semibold tabular-nums">{formatMoney(entry.running_total, currency)}</span>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        )}
      </div>

      {trail.entries.length > 0 && (
        <div className="flex items-center gap-3 rounded-xl border border-primary/30 bg-primary-light p-4">
          <CheckCircle className="h-6 w-6 text-primary" weight="fill" />
          <div>
            <p className="text-xs text-muted-foreground">Total, matching Analysis</p>
            <p className="font-mono text-lg font-semibold tabular-nums">{formatMoney(trail.total, currency)}</p>
          </div>
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        Only {kind === "expense" ? "expense" : "income"} transactions dated in {monthLabel} count here. Transfers between
        your own accounts, and money you advance for a group or get repaid, are tracked separately and never included.
      </p>
    </div>
  );
}
