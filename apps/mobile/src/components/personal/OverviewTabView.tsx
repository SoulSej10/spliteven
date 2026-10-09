import { useMemo } from "react";
import { Pressable, View } from "react-native";
import { Text } from "@/components/ui/typography";
import { router } from "expo-router";
import {
  computeAllAccountBalances,
  computeBudgetProgress,
} from "@evensplit/shared";
import { ArrowDownLeft, ArrowsLeftRight as ArrowLeftRight, ArrowUpRight, PiggyBank } from "phosphor-react-native";
import { Card } from "@/components/ui/Card";
import {
  usePersonalAccounts,
  usePersonalBudgets,
  usePersonalCategories,
  usePersonalTransactions,
} from "@/hooks/use-personal";
import { formatDate, formatMoney } from "@/lib/format";
import type { PersonalTransaction } from "@evensplit/shared";
import { palette } from "@/theme/palette";
import { AppIcon } from "@/components/ui/AppIcon";
import { TransactionAmount } from "@/components/personal/TransactionAmount";
import { useBaseTransactions } from "@/hooks/use-personal-totals";

const RECENT_COUNT = 5;

function TransactionIcon({ kind }: { kind: PersonalTransaction["kind"] }) {
  const isCredit = kind === "income" || kind === "group_reimbursement";
  const isDebit = kind === "expense" || kind === "group_advance";
  const tint = isCredit ? "bg-positive/10" : isDebit ? "bg-negative/10" : "bg-neutral-500/10";
  return (
    <View className={`h-9 w-9 items-center justify-center rounded-lg ${tint}`}>
      {isCredit && <ArrowDownLeft color={palette.positive} size={16} />}
      {isDebit && <ArrowUpRight color={palette.negative} size={16} />}
      {kind === "transfer" && <ArrowLeftRight color={palette.muted} size={16} />}
    </View>
  );
}

/**
 * Finance Overview - composes existing data (accounts, transactions,
 * budgets) that's already fetched elsewhere in Finances, rather than
 * duplicating the always-visible FinancesSummaryCard above these tabs.
 */
export function OverviewTabView({ onNavigateTab }: { onNavigateTab: (tab: "accounts" | "records" | "budgets") => void }) {
  const { data: accounts, isLoading: accountsLoading } = usePersonalAccounts();
  const { data: transactions, isLoading: transactionsLoading } = usePersonalTransactions();
  const { base: baseCurrency, transactions: baseTransactions } = useBaseTransactions();
  const { data: budgets } = usePersonalBudgets();
  const { data: categories } = usePersonalCategories();

  const balances = computeAllAccountBalances(accounts ?? [], transactions ?? []);

  const budgetHighlight = useMemo(() => {
    if (!budgets || budgets.length === 0) return null;
    const progress = computeBudgetProgress(budgets, categories ?? [], baseTransactions);
    if (progress.length === 0) return null;
    return progress.reduce((max, p) => (p.percent > max.percent ? p : max), progress[0]);
  }, [budgets, categories, baseTransactions]);

  const recentTransactions = (transactions ?? []).slice(0, RECENT_COUNT);

  function accountName(id: string) {
    return accounts?.find((a) => a.id === id)?.name ?? "Account";
  }

  return (
    <View className="gap-5">
      <View className="gap-2">
        <View className="flex-row items-center justify-between">
          <Text className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">Accounts</Text>
          <Pressable onPress={() => onNavigateTab("accounts")}>
            <Text className="text-sm font-semibold text-primary-deep">See all</Text>
          </Pressable>
        </View>
        {!accountsLoading && (accounts ?? []).length === 0 && (
          <Text className="text-sm text-neutral-500">No accounts yet.</Text>
        )}
        {(accounts ?? []).map((account) => {
          const balance = balances.find((b) => b.account_id === account.id)?.balance ?? 0;
          return (
            <Card key={account.id} className="flex-row items-center gap-3 py-3">
              <View className="h-9 w-9 items-center justify-center rounded-full bg-primary-light">
                <AppIcon value={account.icon} fallback="💵" size={18} />
              </View>
              <View className="flex-1">
                <Text className="text-sm font-medium text-neutral-900 dark:text-neutral-100">{account.name}</Text>
                <Text className="text-xs capitalize text-neutral-500">{account.type}</Text>
              </View>
              <Text className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                {formatMoney(balance, account.currency)}
              </Text>
            </Card>
          );
        })}
      </View>

      {budgetHighlight && (
        <Pressable onPress={() => onNavigateTab("budgets")}>
          <Card className="gap-2">
            <View className="flex-row items-center gap-2">
              <PiggyBank color={palette.primary} size={16} />
              <Text className="flex-1 text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                {budgetHighlight.category_name} budget
              </Text>
              <Text className="text-xs text-neutral-500">
                {formatMoney(budgetHighlight.spent, baseCurrency)} /{" "}
                {formatMoney(budgetHighlight.limit, baseCurrency)}
              </Text>
            </View>
            <View className="h-1.5 overflow-hidden rounded-full bg-neutral-100 dark:bg-white/10">
              <View
                className={`h-full ${
                  budgetHighlight.percent > 100 ? "bg-negative" : budgetHighlight.percent >= 80 ? "bg-accent" : "bg-primary"
                }`}
                style={{ width: `${Math.min(budgetHighlight.percent, 100)}%` }}
              />
            </View>
          </Card>
        </Pressable>
      )}

      <View className="gap-2">
        <View className="flex-row items-center justify-between">
          <Text className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">Recent transactions</Text>
          <Pressable onPress={() => onNavigateTab("records")}>
            <Text className="text-sm font-semibold text-primary-deep">See all</Text>
          </Pressable>
        </View>
        {!transactionsLoading && recentTransactions.length === 0 && (
          <Text className="text-sm text-neutral-500">No transactions yet.</Text>
        )}
        {recentTransactions.map((tx) => (
          <Card key={tx.id} className="flex-row items-center gap-3 py-2.5">
            <TransactionIcon kind={tx.kind} />
            <View className="min-w-0 flex-1">
              <Text className="text-sm font-medium text-neutral-900 dark:text-neutral-100" numberOfLines={1}>
                {tx.kind === "transfer"
                  ? `${accountName(tx.account_id)} → ${accountName(tx.transfer_account_id ?? "")}`
                  : tx.kind === "group_advance"
                    ? "Advanced for others"
                    : tx.kind === "group_reimbursement"
                      ? "Reimbursement received"
                      : tx.kind === "income"
                        ? "Income"
                        : "Expense"}
              </Text>
              <Text className="text-xs text-neutral-500" numberOfLines={1}>
                {formatDate(tx.occurred_at)} · {accountName(tx.account_id)}
              </Text>
            </View>
            <TransactionAmount amount={tx.amount} accountId={tx.account_id} />
          </Card>
        ))}
      </View>
    </View>
  );
}
