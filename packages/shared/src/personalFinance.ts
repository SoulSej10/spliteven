import { localDateKey, localMonthKey } from "./dateKeys";
import type { BudgetPeriod, PersonalAccount, PersonalBudget, PersonalCategory, PersonalTransaction, UUID } from "./types";

/**
 * Pure, dependency-free derived-data helpers for the personal budgeting
 * ("My Money") feature, kept separate from balances.ts since this domain
 * has nothing to do with group splitting. Unit tested in isolation and
 * shared verbatim between apps/web and apps/mobile, same pattern as
 * balances.ts.
 */

const CENTS = 100;

function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * CENTS) / CENTS;
}

/**
 * Current balance for one account: its starting balance, plus income paid
 * into it, minus expenses paid from it, plus/minus transfers in and out.
 */
export function computeAccountBalance(
  account: Pick<PersonalAccount, "id" | "starting_balance">,
  transactions: Pick<PersonalTransaction, "account_id" | "transfer_account_id" | "kind" | "amount">[]
): number {
  let balance = account.starting_balance;
  for (const tx of transactions) {
    // group_advance/group_reimbursement move real cash just like
    // expense/income do - they're excluded from *spending* aggregates
    // (computeCategoryBreakdown, computeExpenseTrend) because they're
    // neither personal spend nor personal income, but the account balance
    // itself must reflect them or it would silently disagree with the bank.
    if ((tx.kind === "income" || tx.kind === "group_reimbursement") && tx.account_id === account.id) {
      balance += tx.amount;
    } else if ((tx.kind === "expense" || tx.kind === "group_advance") && tx.account_id === account.id) {
      balance -= tx.amount;
    } else if (tx.kind === "transfer") {
      if (tx.account_id === account.id) balance -= tx.amount;
      if (tx.transfer_account_id === account.id) balance += tx.amount;
    }
  }
  return round2(balance);
}

export interface AccountBalance {
  account_id: UUID;
  balance: number;
}

/** Balances for every account in one pass over the transaction list. */
export function computeAllAccountBalances(
  accounts: Pick<PersonalAccount, "id" | "starting_balance">[],
  transactions: Pick<PersonalTransaction, "account_id" | "transfer_account_id" | "kind" | "amount">[]
): AccountBalance[] {
  return accounts.map((account) => ({
    account_id: account.id,
    balance: computeAccountBalance(account, transactions),
  }));
}

export interface CategoryBreakdownEntry {
  category_id: UUID | null;
  category_name: string;
  amount: number;
  percent: number;
}

/**
 * Spending (or income) grouped by category for a set of transactions
 * already filtered to the period of interest by the caller. Transactions
 * with no category land under "Uncategorized". Sorted by amount
 * descending, matching the donut-chart legend order.
 */
export function computeCategoryBreakdown(
  transactions: Pick<PersonalTransaction, "category_id" | "kind" | "amount">[],
  categories: Pick<PersonalCategory, "id" | "name">[],
  kind: "income" | "expense"
): CategoryBreakdownEntry[] {
  const totals = new Map<UUID | null, number>();
  for (const tx of transactions) {
    if (tx.kind !== kind) continue;
    totals.set(tx.category_id, (totals.get(tx.category_id) ?? 0) + tx.amount);
  }

  const grandTotal = [...totals.values()].reduce((a, b) => a + b, 0);

  const entries: CategoryBreakdownEntry[] = [...totals.entries()].map(([category_id, amount]) => ({
    category_id,
    category_name: categories.find((c) => c.id === category_id)?.name ?? "Uncategorized",
    amount: round2(amount),
    percent: grandTotal > 0 ? round2((amount / grandTotal) * 100) : 0,
  }));

  return entries.sort((a, b) => b.amount - a.amount);
}

export interface TrendPoint {
  date: string;
  income: number;
  expense: number;
}

/**
 * Daily income/expense totals for a set of transactions, for the trend
 * line chart. `dateKey` maps a transaction to its bucket key (the caller
 * decides the date-truncation, e.g. `occurred_at.slice(0, 10)` for
 * per-day); buckets are returned sorted ascending by key.
 */
export function computeExpenseTrend(
  transactions: Pick<PersonalTransaction, "occurred_at" | "kind" | "amount">[]
): TrendPoint[] {
  const buckets = new Map<string, { income: number; expense: number }>();
  for (const tx of transactions) {
    // Transfers move money between your own accounts (net zero); group_advance/
    // group_reimbursement are shared-money movements, not personal income or
    // spending (see computeSharedFinanceSummary) - none belong in this trend.
    if (tx.kind !== "income" && tx.kind !== "expense") continue;
    const key = localDateKey(tx.occurred_at);
    const entry = buckets.get(key) ?? { income: 0, expense: 0 };
    if (tx.kind === "income") entry.income += tx.amount;
    else entry.expense += tx.amount;
    buckets.set(key, entry);
  }

  return [...buckets.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, { income, expense }]) => ({
      date,
      income: round2(income),
      expense: round2(expense),
    }));
}

/**
 * Filters transactions down to the current calendar month, by `occurred_at`.
 * Extracted here because the same "this month" scoping was previously
 * copy-pasted identically in the mobile and web budget views (and would
 * have become a third copy in the Home budget snapshot) - one definition
 * of "this month" everyone shares.
 */
export function filterTransactionsForCurrentMonth<T extends Pick<PersonalTransaction, "occurred_at">>(
  transactions: T[]
): T[] {
  const now = new Date();
  return filterTransactionsForMonth(transactions, now.getFullYear(), now.getMonth());
}

/**
 * Same scoping as filterTransactionsForCurrentMonth, but for an arbitrary
 * month - needed wherever a screen lets you navigate to a different month
 * (Insights' merged chart+calendar view) rather than always meaning "now".
 * `month` is 0-indexed, matching `Date.getMonth()`, so callers can pass a
 * `Date` straight through without an off-by-one.
 */
export function filterTransactionsForMonth<T extends Pick<PersonalTransaction, "occurred_at">>(
  transactions: T[],
  year: number,
  month: number
): T[] {
  const monthKey = `${year}-${String(month + 1).padStart(2, "0")}`;
  return transactions.filter((tx) => localMonthKey(tx.occurred_at) === monthKey);
}

/** The calendar months (YYYY-MM keys) a budget period covers around `now`: this month, this quarter, or this year. */
export function budgetPeriodMonthKeys(period: BudgetPeriod, now: Date = new Date()): string[] {
  const year = now.getFullYear();
  const month = now.getMonth();
  const first = period === "yearly" ? 0 : period === "quarterly" ? Math.floor(month / 3) * 3 : month;
  const count = period === "yearly" ? 12 : period === "quarterly" ? 3 : 1;
  return Array.from({ length: count }, (_, i) => `${year}-${String(first + i + 1).padStart(2, "0")}`);
}

/** Human label for a period ("month", "quarter", "year"), for sentences like "spent this quarter". */
export function budgetPeriodNoun(period: BudgetPeriod): string {
  return period === "yearly" ? "year" : period === "quarterly" ? "quarter" : "month";
}

/** Transactions that fall inside the budget period around `now`, by local calendar date. */
export function filterTransactionsForBudgetPeriod<T extends Pick<PersonalTransaction, "occurred_at">>(
  transactions: T[],
  period: BudgetPeriod,
  now: Date = new Date()
): T[] {
  const keys = new Set(budgetPeriodMonthKeys(period, now));
  return transactions.filter((tx) => keys.has(localMonthKey(tx.occurred_at)));
}

export interface BudgetProgress {
  category_id: UUID;
  category_name: string;
  period: BudgetPeriod;
  limit: number;
  spent: number;
  percent: number;
  remaining: number;
}

/**
 * Progress toward each budget's limit for ITS period (a month, a quarter, or a year around `now`).
 * Pass all of the user's expense transactions: each budget only counts those inside its own period,
 * so a yearly budget still sees January's spending in October.
 * `percent` is not clamped to 100 so callers can visually flag overspend.
 */
export function computeBudgetProgress(
  budgets: (Pick<PersonalBudget, "category_id" | "monthly_limit"> & Partial<PersonalBudget>)[],
  categories: Pick<PersonalCategory, "id" | "name">[],
  transactions: (Pick<PersonalTransaction, "kind" | "amount" | "occurred_at"> & { category_id?: UUID | null })[],
  now: Date = new Date()
): BudgetProgress[] {
  const spentByPeriod = new Map<BudgetPeriod, Map<UUID, number>>();
  function spentFor(period: BudgetPeriod): Map<UUID, number> {
    let spent = spentByPeriod.get(period);
    if (!spent) {
      spent = new Map<UUID, number>();
      for (const tx of filterTransactionsForBudgetPeriod(transactions, period, now)) {
        if (tx.kind !== "expense" || !tx.category_id) continue;
        spent.set(tx.category_id, (spent.get(tx.category_id) ?? 0) + tx.amount);
      }
      spentByPeriod.set(period, spent);
    }
    return spent;
  }

  return budgets.map((budget) => {
    const period: BudgetPeriod = budget.period ?? "monthly";
    const spent = round2(spentFor(period).get(budget.category_id) ?? 0);
    return {
      category_id: budget.category_id,
      category_name: categories.find((c) => c.id === budget.category_id)?.name ?? "Uncategorized",
      period,
      limit: budget.monthly_limit,
      spent,
      percent: budget.monthly_limit > 0 ? round2((spent / budget.monthly_limit) * 100) : 0,
      remaining: round2(budget.monthly_limit - spent),
    };
  });
}

export interface BudgetSuggestion {
  category_id: UUID;
  category_name: string;
  /** What was actually spent in this category last calendar month. Always 0 for a starter suggestion. */
  last_month_spent: number;
  /** Last month's spend rounded up to the nearest 100, for a bit of headroom. */
  suggested_limit: number;
  /** True for a generic starter suggestion (no spending history yet) rather than one derived from actual last-month spend. */
  is_starter?: boolean;
}

/**
 * Sensible example limits for a brand-new user's seeded starter categories
 * (see supabase/migrations/0019_seed_default_personal_categories_and_account.sql)
 * - shown only when there's no spending history yet to base a real
 * suggestion on, so a first-time user immediately sees what "set a budget"
 * looks like instead of a blank tab.
 */
const STARTER_BUDGET_LIMITS: Record<string, number> = {
  Groceries: 6000,
  "Food & Dining": 5000,
  Transport: 2500,
  Entertainment: 3000,
  Shopping: 4000,
};

/**
 * Expense categories with no budget yet, ranked by how much was actually
 * spent in them last calendar month - the basis for both "recommended
 * budgets" (the suggested_limit) and "carry over last month's spending as
 * this month's budget" (last_month_spent), since budgets in this schema
 * are a single standing limit per category rather than a per-month row -
 * there's nothing to literally "copy from last month" other than the
 * spend itself.
 */
export function computeBudgetSuggestions(
  categories: Pick<PersonalCategory, "id" | "name" | "kind">[],
  budgets: Pick<PersonalBudget, "category_id">[],
  transactions: Pick<PersonalTransaction, "category_id" | "kind" | "amount" | "occurred_at">[]
): BudgetSuggestion[] {
  const now = new Date();
  const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const prevMonthKey = `${prevMonth.getFullYear()}-${String(prevMonth.getMonth() + 1).padStart(2, "0")}`;
  const budgetedCategoryIds = new Set(budgets.map((b) => b.category_id));

  const spentByCategory = new Map<UUID, number>();
  for (const tx of transactions) {
    if (tx.kind !== "expense" || !tx.category_id) continue;
    if (localMonthKey(tx.occurred_at) !== prevMonthKey) continue;
    spentByCategory.set(tx.category_id, (spentByCategory.get(tx.category_id) ?? 0) + tx.amount);
  }

  const fromHistory = categories
    .filter((c) => c.kind === "expense" && !budgetedCategoryIds.has(c.id) && (spentByCategory.get(c.id) ?? 0) > 0)
    .map((c) => {
      const spent = round2(spentByCategory.get(c.id) ?? 0);
      return {
        category_id: c.id,
        category_name: c.name,
        last_month_spent: spent,
        suggested_limit: Math.ceil(spent / 100) * 100,
      };
    })
    .sort((a, b) => b.last_month_spent - a.last_month_spent);

  if (fromHistory.length > 0) return fromHistory;

  // No spending history to suggest from (a brand-new account, most likely) -
  // fall back to generic starter amounts for whichever seeded categories the
  // user still has, so the tab isn't just an empty message on first visit.
  return categories
    .filter((c) => c.kind === "expense" && !budgetedCategoryIds.has(c.id) && c.name in STARTER_BUDGET_LIMITS)
    .map((c) => ({
      category_id: c.id,
      category_name: c.name,
      last_month_spent: 0,
      suggested_limit: STARTER_BUDGET_LIMITS[c.name],
      is_starter: true,
    }));
}

export interface DailyTotal {
  /** YYYY-MM-DD */
  date: string;
  expense: number;
  income: number;
}

/**
 * Per-day expense/income totals, for a monthly calendar view (one cell per
 * day). The caller passes already-month-filtered transactions (same
 * convention as computeCategoryBreakdown/computeExpenseTrend); an optional
 * `categoryId` narrows to a single category so the calendar works "for any
 * category," not just an all-categories total. group_advance/
 * group_reimbursement are excluded for the same reason they're excluded
 * from computeExpenseTrend - they're shared-money movements, not personal
 * income or spending.
 */
export function computeDailyTotals(
  transactions: Pick<PersonalTransaction, "occurred_at" | "kind" | "amount" | "category_id">[],
  categoryId?: UUID | null
): DailyTotal[] {
  const totals = new Map<string, { expense: number; income: number }>();
  for (const tx of transactions) {
    if (tx.kind !== "income" && tx.kind !== "expense") continue;
    if (categoryId && tx.category_id !== categoryId) continue;
    const key = localDateKey(tx.occurred_at);
    const entry = totals.get(key) ?? { expense: 0, income: 0 };
    if (tx.kind === "income") entry.income += tx.amount;
    else entry.expense += tx.amount;
    totals.set(key, entry);
  }
  return [...totals.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, { expense, income }]) => ({ date, expense: round2(expense), income: round2(income) }));
}

export interface SharedFinanceSummary {
  /** Cash advanced for other group members' shares (a receivable, not spend). */
  advanced: number;
  /** Cash recovered as that receivable gets repaid (not income). */
  recovered: number;
  /** advanced minus recovered - still owed back to you, for the given period. */
  outstanding: number;
}

/**
 * Rolls up the group_advance/group_reimbursement transactions (already
 * filtered to the period of interest by the caller, same convention as
 * computeCategoryBreakdown) into the combined "shared spending" narrative:
 * how much you fronted for others, how much came back, and what's still
 * outstanding. This is the one number personal-only tools can't produce,
 * since it depends on group activity mirrored via create_group_expense/
 * record_settlement/confirm_settlement_receipt.
 */
export function computeSharedFinanceSummary(
  transactions: Pick<PersonalTransaction, "kind" | "amount">[]
): SharedFinanceSummary {
  let advanced = 0;
  let recovered = 0;
  for (const tx of transactions) {
    if (tx.kind === "group_advance") advanced += tx.amount;
    else if (tx.kind === "group_reimbursement") recovered += tx.amount;
  }
  return {
    advanced: round2(advanced),
    recovered: round2(recovered),
    outstanding: round2(advanced - recovered),
  };
}

export interface MonthlyCashFlow {
  /** "YYYY-MM" */
  key: string;
  year: number;
  /** 0-indexed, like Date#getMonth() */
  month: number;
  income: number;
  expense: number;
  net: number;
}

/**
 * Income and expense totals per calendar month for the last `months` months
 * (ending with the month of `now`, oldest first), including months with no
 * activity so a chart has a continuous axis. Only real income/expense count:
 * transfers net to zero and group advances/reimbursements are shared money,
 * same rule as computeExpenseTrend.
 */
export function computeMonthlyCashFlow(
  transactions: Pick<PersonalTransaction, "occurred_at" | "kind" | "amount">[],
  months = 6,
  now: Date = new Date()
): MonthlyCashFlow[] {
  const buckets: MonthlyCashFlow[] = [];
  const byKey = new Map<string, MonthlyCashFlow>();
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const bucket: MonthlyCashFlow = { key, year: d.getFullYear(), month: d.getMonth(), income: 0, expense: 0, net: 0 };
    buckets.push(bucket);
    byKey.set(key, bucket);
  }

  for (const tx of transactions) {
    if (tx.kind !== "income" && tx.kind !== "expense") continue;
    const bucket = byKey.get(localMonthKey(tx.occurred_at));
    if (!bucket) continue;
    if (tx.kind === "income") bucket.income += tx.amount;
    else bucket.expense += tx.amount;
  }

  for (const b of buckets) {
    b.income = round2(b.income);
    b.expense = round2(b.expense);
    b.net = round2(b.income - b.expense);
  }
  return buckets;
}

export type CategoryTrailTransaction = Pick<
  PersonalTransaction,
  "id" | "occurred_at" | "amount" | "kind" | "category_id"
>;

export type CategoryTrailEntry<T extends CategoryTrailTransaction> = T & {
  /** Sum of every entry up to and including this one, oldest first. */
  running_total: number;
};

export interface CategoryTrail<T extends CategoryTrailTransaction> {
  entries: CategoryTrailEntry<T>[];
  /** Always equals the amount computeCategoryBreakdown reports for the same category and kind. */
  total: number;
  count: number;
  average: number;
  largest: T | null;
}

/**
 * The audit trail behind one number in the category breakdown: exactly the
 * transactions that were summed to produce it (same kind, same category,
 * `null` meaning Uncategorized), oldest first, each with the running total
 * so far. The caller passes transactions already scoped to the period, same
 * as computeCategoryBreakdown, so the trail's total can never disagree with
 * the figure that was tapped.
 */
export function computeCategoryTrail<T extends CategoryTrailTransaction>(
  transactions: T[],
  categoryId: UUID | null,
  kind: "income" | "expense"
): CategoryTrail<T> {
  const matching = transactions
    .filter((tx) => tx.kind === kind && tx.category_id === categoryId)
    .sort((a, b) =>
      a.occurred_at < b.occurred_at ? -1 : a.occurred_at > b.occurred_at ? 1 : a.id < b.id ? -1 : a.id > b.id ? 1 : 0
    );

  let running = 0;
  const entries = matching.map((tx) => {
    running = round2(running + tx.amount);
    return { ...tx, running_total: running };
  });

  const total = round2(matching.reduce((sum, tx) => sum + tx.amount, 0));
  const largest = matching.reduce<T | null>((max, tx) => (max === null || tx.amount > max.amount ? tx : max), null);

  return {
    entries,
    total,
    count: matching.length,
    average: matching.length > 0 ? round2(total / matching.length) : 0,
    largest,
  };
}
