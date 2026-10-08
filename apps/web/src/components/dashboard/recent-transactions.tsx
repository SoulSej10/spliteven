"use client";

import { useMemo } from "react";
import Link from "next/link";
import {
  ArrowDownLeft,
  ArrowRight,
  ArrowsLeftRight as ArrowLeftRight,
  ArrowUpRight,
} from "@phosphor-icons/react";
import type { PersonalTransaction } from "@evensplit/shared";
import { usePersonalAccounts, usePersonalCategories, usePersonalTransactions } from "@/hooks/use-personal";
import { formatDate, formatMoney } from "@/lib/format";

const RECENT_COUNT = 6;

function TransactionIcon({ kind }: { kind: PersonalTransaction["kind"] }) {
  const credit = kind === "income" || kind === "group_reimbursement";
  const debit = kind === "expense" || kind === "group_advance";
  const tint = credit ? "bg-positive/10" : debit ? "bg-negative/10" : "bg-muted";
  return (
    <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${tint}`}>
      {credit && <ArrowDownLeft className="h-4 w-4 text-positive" />}
      {debit && <ArrowUpRight className="h-4 w-4 text-negative" />}
      {kind === "transfer" && <ArrowLeftRight className="h-4 w-4 text-muted-foreground" />}
    </span>
  );
}

function transactionLabel(tx: PersonalTransaction, category: string | null, accountName: (id: string) => string) {
  if (tx.kind === "transfer") return `${accountName(tx.account_id)} → ${accountName(tx.transfer_account_id ?? "")}`;
  if (tx.kind === "group_advance") return "Advanced for others";
  if (tx.kind === "group_reimbursement") return "Reimbursement received";
  return category ?? (tx.kind === "income" ? "Income" : "Expense");
}

/** The latest personal transactions: the main list on the dashboard, since cash flow is the headline. */
export function RecentTransactions() {
  const { data: transactions } = usePersonalTransactions();
  const { data: accounts } = usePersonalAccounts();
  const { data: categories } = usePersonalCategories();

  const recent = useMemo(
    () =>
      [...(transactions ?? [])]
        .sort((a, b) => (a.occurred_at < b.occurred_at ? 1 : a.occurred_at > b.occurred_at ? -1 : 0))
        .slice(0, RECENT_COUNT),
    [transactions]
  );

  const accountName = (id: string) => accounts?.find((a) => a.id === id)?.name ?? "Account";

  return (
    <div className="mb-8">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-base font-semibold">Recent transactions</h2>
        <Link href="/personal" className="flex items-center gap-1 text-sm font-medium text-primary-deep hover:underline">
          See all <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {recent.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Nothing logged yet. Use Income or Expense above to add your first transaction.
        </p>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
          {recent.map((tx, i) => {
            const account = accounts?.find((a) => a.id === tx.account_id);
            const category = categories?.find((c) => c.id === tx.category_id)?.name ?? null;
            const debit = tx.kind === "expense" || tx.kind === "group_advance";
            const credit = tx.kind === "income" || tx.kind === "group_reimbursement";
            return (
              <div
                key={tx.id}
                className={`flex items-center gap-3 px-4 py-3 ${i > 0 ? "border-t border-border/60" : ""}`}
              >
                <TransactionIcon kind={tx.kind} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{transactionLabel(tx, category, accountName)}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {formatDate(tx.occurred_at)} · {accountName(tx.account_id)}
                  </p>
                </div>
                <span
                  className={`shrink-0 font-mono text-sm font-semibold tabular-nums ${
                    credit ? "text-positive" : debit ? "text-negative" : ""
                  }`}
                >
                  {debit ? "-" : credit ? "+" : ""}
                  {formatMoney(tx.amount, account?.currency ?? "PHP")}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
