"use client";

import { useMemo } from "react";
import Link from "next/link";
import {
  computeBudgetProgress,
  computeSharedBalancesSummary,
  filterTransactionsForCurrentMonth,
  type GroupBalanceInput,
} from "@evensplit/shared";
import {
  ArrowDownLeft,
  ArrowRight,
  ArrowsLeftRight as ArrowRightLeft,
  ArrowUpRight,
  Clock,
  PiggyBank,
  Plus,
  UserPlus,
} from "@phosphor-icons/react";
import { AuthGuard } from "@/components/auth/auth-guard";
import { AppShell } from "@/components/app-shell/top-nav";
import { CashFlowCard } from "@/components/dashboard/cash-flow-card";
import { RecentTransactions } from "@/components/dashboard/recent-transactions";
import { CreateGroupDialog } from "@/components/groups/create-group-dialog";
import { JoinGroupDialog } from "@/components/groups/join-group-dialog";
import { GroupCard } from "@/components/groups/group-card";
import { AddTransactionDialog } from "@/components/personal/add-transaction-dialog";
import { SettlementReceiptBanner } from "@/components/personal/settlement-receipt-banner";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { useAllExpenses, useAllSettlements, useMyGroups } from "@/hooks/use-groups";
import { usePersonalAccounts, usePersonalBudgets, usePersonalCategories, usePersonalTransactions } from "@/hooks/use-personal";
import { formatMoney } from "@/lib/format";
import { useBaseTransactions } from "@/hooks/use-personal-totals";

const GROUPS_PREVIEW_COUNT = 2;
const UPCOMING_PREVIEW_COUNT = 3;

const moneyButtonClass =
  "flex w-full flex-col items-center gap-1.5 rounded-xl border border-border bg-card py-3 text-sm font-medium shadow-sm transition-colors hover:bg-muted";
const groupButtonClass =
  "flex w-full items-center gap-3 rounded-xl border border-border bg-card p-4 text-left shadow-sm transition-colors hover:bg-muted";

function GroupButtonContent({ icon: Icon, label, sublabel }: { icon: typeof Plus; label: string; sublabel: string }) {
  return (
    <>
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
        <Icon className="h-5 w-5" />
      </span>
      <span className="min-w-0">
        <span className="block truncate text-sm font-semibold">{label}</span>
        <span className="block truncate text-xs text-muted-foreground">{sublabel}</span>
      </span>
    </>
  );
}

/**
 * Dashboard: a cash-flow view. The headline numbers and the main list come
 * from the user's own personal transactions; groups are still reachable (New
 * group / Join group buttons and a short groups section) but secondary.
 * Mirrors apps/mobile's Home.
 */
function DashboardContent() {
  const { authUser, profile } = useAuth();
  const { data: groups, isLoading } = useMyGroups();
  const { data: allExpenses } = useAllExpenses();
  const { data: allSettlements } = useAllSettlements();
  const { data: accounts } = usePersonalAccounts();
  const { data: budgets } = usePersonalBudgets();
  const { data: categories } = usePersonalCategories();
  const { base: baseCurrency, transactions: baseTransactions } = useBaseTransactions();

  const preview = (groups ?? []).slice(0, GROUPS_PREVIEW_COUNT);

  const sharedBalances = useMemo(() => {
    if (!authUser || !groups || !allExpenses || !allSettlements) return [];
    const inputs: GroupBalanceInput[] = groups.map((g) => ({
      group_id: g.id,
      currency: g.currency,
      member_ids: g.group_members.map((m) => m.user_id),
      expenses: allExpenses.filter((e) => e.group_id === g.id),
      expense_shares: allExpenses.filter((e) => e.group_id === g.id).flatMap((e) => e.expense_shares),
      settlements: allSettlements.filter((s) => s.group_id === g.id),
    }));
    return computeSharedBalancesSummary(inputs, authUser.id);
  }, [authUser, groups, allExpenses, allSettlements]);

  const budgetHighlight = useMemo(() => {
    if (!budgets || budgets.length === 0) return null;
    const progress = computeBudgetProgress(
      budgets,
      categories ?? [],
      filterTransactionsForCurrentMonth(baseTransactions)
    );
    if (progress.length === 0) return null;
    return progress.reduce((max, p) => (p.percent > max.percent ? p : max), progress[0]);
  }, [budgets, categories, baseTransactions]);

  const upcomingRecurring = useMemo(() => {
    return (allExpenses ?? [])
      .filter((e) => e.is_recurring && e.next_occurrence_date)
      .sort((a, b) => (a.next_occurrence_date! < b.next_occurrence_date! ? -1 : 1))
      .slice(0, UPCOMING_PREVIEW_COUNT);
  }, [allExpenses]);

  const groupById = new Map((groups ?? []).map((g) => [g.id, g]));

  const unconfirmedSettlements = (allSettlements ?? []).filter(
    (s) => s.to_user === authUser?.id && s.to_account_id === null
  );

  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">
          {profile?.display_name ? `Good to see you, ${profile.display_name.split(" ")[0]}` : "Dashboard"}
        </h1>
        <p className="text-sm text-muted-foreground">Your cash flow first, with your shared groups close by.</p>
      </div>

      <SettlementReceiptBanner
        unconfirmed={unconfirmedSettlements}
        groupName={(id) => groupById.get(id)?.name ?? "a group"}
        groupCurrency={(id) => groupById.get(id)?.currency ?? "PHP"}
      />

      <CashFlowCard />

      <div className="mb-4 grid grid-cols-3 gap-3">
        <AddTransactionDialog
          initialKind="income"
          trigger={
            <button className={moneyButtonClass}>
              <ArrowDownLeft className="h-4 w-4 text-positive" /> Income
            </button>
          }
        />
        <AddTransactionDialog
          initialKind="expense"
          trigger={
            <button className={moneyButtonClass}>
              <ArrowUpRight className="h-4 w-4 text-negative" /> Expense
            </button>
          }
        />
        <AddTransactionDialog
          initialKind="transfer"
          trigger={
            <button className={moneyButtonClass}>
              <ArrowRightLeft className="h-4 w-4 text-muted-foreground" /> Transfer
            </button>
          }
        />
      </div>

      <div className="mb-8 grid gap-3 sm:grid-cols-2">
        <CreateGroupDialog
          trigger={
            <button className={groupButtonClass}>
              <GroupButtonContent icon={Plus} label="New group" sublabel="Start a ledger" />
            </button>
          }
        />
        <JoinGroupDialog
          trigger={
            <button className={groupButtonClass}>
              <GroupButtonContent icon={UserPlus} label="Join group" sublabel="Have an invite?" />
            </button>
          }
        />
      </div>

      <RecentTransactions />

      {budgetHighlight && (
        <Link href="/personal/budgets">
          <Card className="mb-6 gap-2 p-4">
            <div className="flex items-center gap-2">
              <PiggyBank className="h-4 w-4 text-primary-deep" />
              <p className="flex-1 text-sm font-semibold">{budgetHighlight.category_name} budget</p>
              <p className="text-xs text-muted-foreground">
                {formatMoney(budgetHighlight.spent, baseCurrency)} /{" "}
                {formatMoney(budgetHighlight.limit, baseCurrency)}
              </p>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-muted">
              <div
                className={`h-full ${
                  budgetHighlight.percent > 100
                    ? "bg-destructive"
                    : budgetHighlight.percent >= 80
                      ? "bg-accent"
                      : "bg-primary"
                }`}
                style={{ width: `${Math.min(budgetHighlight.percent, 100)}%` }}
              />
            </div>
          </Card>
        </Link>
      )}

      {upcomingRecurring.length > 0 && (
        <div className="mb-6">
          <h2 className="mb-2 text-base font-semibold">Upcoming</h2>
          <div className="grid gap-2">
            {upcomingRecurring.map((e) => (
              <Card key={e.id} className="flex-row items-center gap-3 p-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
                    <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                  </span>
                  <p className="flex-1 truncate text-sm">{e.description}</p>
                  <p className="text-xs font-medium text-muted-foreground">{formatMoney(e.amount, e.currency)}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-base font-semibold">Your groups</h2>
        <Link href="/groups" className="flex items-center gap-1 text-sm font-medium text-primary-deep hover:underline">
          See all <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {sharedBalances.length > 0 && (
        <div className="mb-3 grid gap-2 rounded-xl border border-border bg-card p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Shared balances</p>
          {sharedBalances.map((s) => (
            <div key={s.currency} className="flex items-center justify-between gap-4">
              <div className="flex gap-6">
                <div>
                  <p className="text-[11px] text-muted-foreground">People owe you</p>
                  <p className="text-sm font-semibold tabular-nums text-positive">
                    {formatMoney(s.owedToYou, s.currency)}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] text-muted-foreground">You owe</p>
                  <p className="text-sm font-semibold tabular-nums text-negative">
                    {formatMoney(s.youOwe, s.currency)}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[11px] text-muted-foreground">Net</p>
                <p
                  className={`text-sm font-semibold tabular-nums ${s.net >= 0 ? "text-positive" : "text-negative"}`}
                >
                  {formatMoney(s.net, s.currency)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {isLoading && (
        <div className="grid gap-3">
          <Skeleton className="h-20 rounded-2xl" />
          <Skeleton className="h-20 rounded-2xl" />
        </div>
      )}

      {!isLoading && preview.length === 0 && (
        <p className="text-sm text-muted-foreground">No groups yet. Use New group above to start one.</p>
      )}

      {!isLoading && (
        <div className="grid gap-3">
          {preview.map((g) => (
            <GroupCard key={g.id} group={g} />
          ))}
        </div>
      )}
    </AppShell>
  );
}

export default function DashboardPage() {
  return (
    <AuthGuard>
      <DashboardContent />
    </AuthGuard>
  );
}
