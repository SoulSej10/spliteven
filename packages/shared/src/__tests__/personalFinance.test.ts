import { describe, expect, it } from "vitest";
import {
  computeAccountBalance,
  computeAllAccountBalances,
  budgetPeriodMonthKeys,
  computeBudgetProgress,
  computeBudgetSuggestions,
  computeCategoryBreakdown,
  computeDailyTotals,
  computeCategoryTrail,
  computeExpenseTrend,
  computeMonthlyCashFlow,
  computeSharedFinanceSummary,
  filterTransactionsForCurrentMonth,
  filterTransactionsForMonth,
} from "../personalFinance";

const CASH = "11111111-1111-1111-1111-111111111111";
const CARD = "22222222-2222-2222-2222-222222222222";
const FOOD = "33333333-3333-3333-3333-333333333333";
const BILLS = "44444444-4444-4444-4444-444444444444";

describe("computeAccountBalance", () => {
  it("starts from starting_balance and applies income/expense", () => {
    const balance = computeAccountBalance({ id: CASH, starting_balance: 100 }, [
      { account_id: CASH, transfer_account_id: null, kind: "income", amount: 50 },
      { account_id: CASH, transfer_account_id: null, kind: "expense", amount: 20 },
    ]);
    expect(balance).toBe(130);
  });

  it("applies transfers out and in correctly", () => {
    const balance = computeAccountBalance({ id: CASH, starting_balance: 100 }, [
      { account_id: CASH, transfer_account_id: CARD, kind: "transfer", amount: 30 },
      { account_id: CARD, transfer_account_id: CASH, kind: "transfer", amount: 10 },
    ]);
    expect(balance).toBe(80);
  });

  it("ignores transactions belonging to other accounts", () => {
    const balance = computeAccountBalance({ id: CASH, starting_balance: 100 }, [
      { account_id: CARD, transfer_account_id: null, kind: "expense", amount: 999 },
    ]);
    expect(balance).toBe(100);
  });

  it("treats group_advance as a debit and group_reimbursement as a credit, like the cash they represent", () => {
    // Fronted a ₱1000 group dinner: ₱250 own share (expense) + ₱750 advanced
    // for others (group_advance) both leave the account, same as reality.
    const balance = computeAccountBalance({ id: CASH, starting_balance: 1000 }, [
      { account_id: CASH, transfer_account_id: null, kind: "expense", amount: 250 },
      { account_id: CASH, transfer_account_id: null, kind: "group_advance", amount: 750 },
    ]);
    expect(balance).toBe(0);
  });

  it("credits an account when a group receivable is reimbursed", () => {
    const balance = computeAccountBalance({ id: CASH, starting_balance: 0 }, [
      { account_id: CASH, transfer_account_id: null, kind: "group_reimbursement", amount: 375 },
    ]);
    expect(balance).toBe(375);
  });
});

describe("computeAllAccountBalances", () => {
  it("computes balances for every account independently", () => {
    const balances = computeAllAccountBalances(
      [
        { id: CASH, starting_balance: 100 },
        { id: CARD, starting_balance: 0 },
      ],
      [{ account_id: CASH, transfer_account_id: CARD, kind: "transfer", amount: 40 }]
    );
    expect(balances).toEqual([
      { account_id: CASH, balance: 60 },
      { account_id: CARD, balance: 40 },
    ]);
  });
});

describe("computeCategoryBreakdown", () => {
  const categories = [
    { id: FOOD, name: "Food" },
    { id: BILLS, name: "Bills" },
  ];

  it("groups by category, sorted descending, with percentages", () => {
    const breakdown = computeCategoryBreakdown(
      [
        { category_id: FOOD, kind: "expense", amount: 30 },
        { category_id: BILLS, kind: "expense", amount: 70 },
        { category_id: FOOD, kind: "income", amount: 500 },
      ],
      categories,
      "expense"
    );
    expect(breakdown).toEqual([
      { category_id: BILLS, category_name: "Bills", amount: 70, percent: 70 },
      { category_id: FOOD, category_name: "Food", amount: 30, percent: 30 },
    ]);
  });

  it("buckets uncategorized transactions separately", () => {
    const breakdown = computeCategoryBreakdown(
      [{ category_id: null, kind: "expense", amount: 15 }],
      categories,
      "expense"
    );
    expect(breakdown).toEqual([{ category_id: null, category_name: "Uncategorized", amount: 15, percent: 100 }]);
  });

  it("excludes group_advance/group_reimbursement from personal spending/income totals", () => {
    const breakdown = computeCategoryBreakdown(
      [
        { category_id: FOOD, kind: "expense", amount: 30 },
        { category_id: FOOD, kind: "group_advance", amount: 750 },
        { category_id: FOOD, kind: "group_reimbursement", amount: 375 },
      ],
      categories,
      "expense"
    );
    expect(breakdown).toEqual([{ category_id: FOOD, category_name: "Food", amount: 30, percent: 100 }]);
  });
});

describe("computeExpenseTrend", () => {
  it("buckets by day and sums income/expense separately, sorted ascending", () => {
    const trend = computeExpenseTrend([
      { occurred_at: "2026-01-02T10:00:00Z", kind: "expense", amount: 20 },
      { occurred_at: "2026-01-01T10:00:00Z", kind: "income", amount: 100 },
      { occurred_at: "2026-01-01T15:00:00Z", kind: "expense", amount: 10 },
      { occurred_at: "2026-01-01T20:00:00Z", kind: "transfer", amount: 999 },
    ]);
    expect(trend).toEqual([
      { date: "2026-01-01", income: 100, expense: 10 },
      { date: "2026-01-02", income: 0, expense: 20 },
    ]);
  });

  it("excludes group_advance/group_reimbursement, same as transfers", () => {
    const trend = computeExpenseTrend([
      { occurred_at: "2026-01-01T10:00:00Z", kind: "expense", amount: 10 },
      { occurred_at: "2026-01-01T10:00:00Z", kind: "group_advance", amount: 750 },
      { occurred_at: "2026-01-01T10:00:00Z", kind: "group_reimbursement", amount: 375 },
    ]);
    expect(trend).toEqual([{ date: "2026-01-01", income: 0, expense: 10 }]);
  });
});

describe("computeBudgetProgress", () => {
  const categories = [{ id: FOOD, name: "Food" }];

  it("computes spent, percent, and remaining against the limit", () => {
    const progress = computeBudgetProgress(
      [{ id: "b1", user_id: "u1", category_id: FOOD, monthly_limit: 200, period: "monthly", created_at: "" }],
      categories,
      [
        { category_id: FOOD, kind: "expense", amount: 50, occurred_at: "2026-10-05T12:00:00" },
        { category_id: FOOD, kind: "expense", amount: 30, occurred_at: "2026-10-20T12:00:00" },
        { category_id: FOOD, kind: "income", amount: 1000, occurred_at: "2026-10-06T12:00:00" },
      ],
      new Date(2026, 9, 25)
    );
    expect(progress).toEqual([
      { category_id: FOOD, category_name: "Food", period: "monthly", limit: 200, spent: 80, percent: 40, remaining: 120 },
    ]);
  });

  it("allows percent to exceed 100 when overspent", () => {
    const progress = computeBudgetProgress(
      [{ id: "b1", user_id: "u1", category_id: FOOD, monthly_limit: 50, period: "monthly", created_at: "" }],
      categories,
      [{ category_id: FOOD, kind: "expense", amount: 75, occurred_at: "2026-10-05T12:00:00" }],
      new Date(2026, 9, 25)
    );
    expect(progress[0]).toEqual({
      category_id: FOOD,
      category_name: "Food",
      period: "monthly",
      limit: 50,
      spent: 75,
      percent: 150,
      remaining: -25,
    });
  });
});

describe("budget periods", () => {
  const categories = [{ id: FOOD, name: "Food" }];
  const now = new Date(2026, 10, 15); // 15 Nov 2026 -> Q4 (Oct-Dec)
  const txs = [
    { category_id: FOOD, kind: "expense" as const, amount: 100, occurred_at: "2026-01-10T12:00:00" },
    { category_id: FOOD, kind: "expense" as const, amount: 200, occurred_at: "2026-10-03T12:00:00" },
    { category_id: FOOD, kind: "expense" as const, amount: 300, occurred_at: "2026-11-09T12:00:00" },
    { category_id: FOOD, kind: "expense" as const, amount: 400, occurred_at: "2025-11-09T12:00:00" },
  ];

  it("lists the months each period covers", () => {
    expect(budgetPeriodMonthKeys("monthly", now)).toEqual(["2026-11"]);
    expect(budgetPeriodMonthKeys("quarterly", now)).toEqual(["2026-10", "2026-11", "2026-12"]);
    expect(budgetPeriodMonthKeys("yearly", now)).toHaveLength(12);
  });

  it("counts only spending inside each budget's own period", () => {
    const [m, q, y] = (["monthly", "quarterly", "yearly"] as const).map(
      (period) =>
        computeBudgetProgress(
          [{ category_id: FOOD, monthly_limit: 1000, period }],
          categories,
          txs,
          now
        )[0]
    );
    expect(m.spent).toBe(300);
    expect(q.spent).toBe(500);
    expect(y.spent).toBe(600);
  });

  it("treats a budget without a period as monthly", () => {
    const [p] = computeBudgetProgress([{ category_id: FOOD, monthly_limit: 1000 }], categories, txs, now);
    expect(p.period).toBe("monthly");
    expect(p.spent).toBe(300);
  });
});

describe("computeBudgetSuggestions", () => {
  const now = new Date();
  const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 15);
  const prevMonthDate = `${prevMonth.getFullYear()}-${String(prevMonth.getMonth() + 1).padStart(2, "0")}-15T00:00:00Z`;
  const thisMonthDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01T00:00:00Z`;
  const categories = [
    { id: FOOD, name: "Food", kind: "expense" as const },
    { id: BILLS, name: "Bills", kind: "expense" as const },
  ];

  it("suggests categories with last month's spend but no existing budget, rounded up to the nearest 100", () => {
    const suggestions = computeBudgetSuggestions(
      categories,
      [],
      [{ category_id: FOOD, kind: "expense", amount: 340, occurred_at: prevMonthDate }]
    );
    expect(suggestions).toEqual([
      { category_id: FOOD, category_name: "Food", last_month_spent: 340, suggested_limit: 400 },
    ]);
  });

  it("excludes categories that already have a budget", () => {
    const suggestions = computeBudgetSuggestions(
      categories,
      [{ category_id: FOOD }],
      [{ category_id: FOOD, kind: "expense", amount: 340, occurred_at: prevMonthDate }]
    );
    expect(suggestions).toEqual([]);
  });

  it("ignores this month's transactions and income", () => {
    const suggestions = computeBudgetSuggestions(
      categories,
      [],
      [
        { category_id: FOOD, kind: "expense", amount: 999, occurred_at: thisMonthDate },
        { category_id: BILLS, kind: "income", amount: 500, occurred_at: prevMonthDate },
      ]
    );
    expect(suggestions).toEqual([]);
  });

  it("sorts by last month's spend, highest first", () => {
    const suggestions = computeBudgetSuggestions(
      categories,
      [],
      [
        { category_id: FOOD, kind: "expense", amount: 100, occurred_at: prevMonthDate },
        { category_id: BILLS, kind: "expense", amount: 500, occurred_at: prevMonthDate },
      ]
    );
    expect(suggestions.map((s) => s.category_id)).toEqual([BILLS, FOOD]);
  });

  it("falls back to generic starter suggestions for a brand-new account with no spending history", () => {
    const GROCERIES = "55555555-5555-5555-5555-555555555555";
    const suggestions = computeBudgetSuggestions(
      [...categories, { id: GROCERIES, name: "Groceries", kind: "expense" as const }],
      [],
      []
    );
    expect(suggestions.length).toBeGreaterThan(0);
    expect(suggestions.every((s) => s.is_starter)).toBe(true);
    expect(suggestions.every((s) => s.last_month_spent === 0)).toBe(true);
    expect(suggestions.find((s) => s.category_id === GROCERIES)?.suggested_limit).toBe(6000);
  });

  it("does not fall back to starter suggestions once at least one real suggestion exists", () => {
    const suggestions = computeBudgetSuggestions(
      categories,
      [],
      [{ category_id: FOOD, kind: "expense", amount: 340, occurred_at: prevMonthDate }]
    );
    expect(suggestions.every((s) => !s.is_starter)).toBe(true);
  });
});

describe("computeSharedFinanceSummary", () => {
  it("rolls up advanced, recovered, and outstanding from group_advance/group_reimbursement only", () => {
    const summary = computeSharedFinanceSummary([
      { kind: "group_advance", amount: 750 },
      { kind: "group_reimbursement", amount: 375 },
      { kind: "expense", amount: 250 }, // own share - not shared money, ignored
      { kind: "income", amount: 5000 }, // unrelated, ignored
    ]);
    expect(summary).toEqual({ advanced: 750, recovered: 375, outstanding: 375 });
  });

  it("returns all zeros when there's no shared activity", () => {
    expect(computeSharedFinanceSummary([{ kind: "expense", amount: 20 }])).toEqual({
      advanced: 0,
      recovered: 0,
      outstanding: 0,
    });
  });
});

describe("filterTransactionsForCurrentMonth", () => {
  it("keeps only transactions occurring in the current calendar month", () => {
    const now = new Date();
    const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-15T00:00:00Z`;
    const transactions = [
      { occurred_at: thisMonth },
      { occurred_at: "2000-01-01T00:00:00Z" },
    ];
    expect(filterTransactionsForCurrentMonth(transactions)).toEqual([{ occurred_at: thisMonth }]);
  });

  it("returns an empty array when nothing falls in the current month", () => {
    expect(filterTransactionsForCurrentMonth([{ occurred_at: "1999-01-01T00:00:00Z" }])).toEqual([]);
  });
});

describe("filterTransactionsForMonth", () => {
  it("keeps only transactions occurring in the given (0-indexed) month", () => {
    const transactions = [
      { occurred_at: "2026-03-15T00:00:00Z" },
      { occurred_at: "2026-02-28T00:00:00Z" },
      { occurred_at: "2025-03-15T00:00:00Z" },
    ];
    expect(filterTransactionsForMonth(transactions, 2026, 2)).toEqual([{ occurred_at: "2026-03-15T00:00:00Z" }]);
  });

  it("returns an empty array when nothing falls in the given month", () => {
    expect(filterTransactionsForMonth([{ occurred_at: "1999-01-01T00:00:00Z" }], 2026, 0)).toEqual([]);
  });
});

describe("computeDailyTotals", () => {
  const FOOD = "11111111-1111-1111-1111-111111111111";
  const RENT = "22222222-2222-2222-2222-222222222222";

  it("buckets by day and sums income/expense separately, sorted ascending", () => {
    const totals = computeDailyTotals([
      { occurred_at: "2026-08-02T10:00:00Z", kind: "expense", amount: 20, category_id: FOOD },
      { occurred_at: "2026-08-01T10:00:00Z", kind: "income", amount: 100, category_id: null },
      { occurred_at: "2026-08-01T15:00:00Z", kind: "expense", amount: 10, category_id: FOOD },
      { occurred_at: "2026-08-01T20:00:00Z", kind: "transfer", amount: 999, category_id: null },
    ]);
    expect(totals).toEqual([
      { date: "2026-08-01", income: 100, expense: 10 },
      { date: "2026-08-02", income: 0, expense: 20 },
    ]);
  });

  it("excludes group_advance/group_reimbursement, same as computeExpenseTrend", () => {
    const totals = computeDailyTotals([
      { occurred_at: "2026-08-01T10:00:00Z", kind: "expense", amount: 10, category_id: FOOD },
      { occurred_at: "2026-08-01T10:00:00Z", kind: "group_advance", amount: 750, category_id: null },
      { occurred_at: "2026-08-01T10:00:00Z", kind: "group_reimbursement", amount: 375, category_id: null },
    ]);
    expect(totals).toEqual([{ date: "2026-08-01", income: 0, expense: 10 }]);
  });

  it("filters to a single category when categoryId is given", () => {
    const totals = computeDailyTotals(
      [
        { occurred_at: "2026-08-01T10:00:00Z", kind: "expense", amount: 10, category_id: FOOD },
        { occurred_at: "2026-08-01T10:00:00Z", kind: "expense", amount: 500, category_id: RENT },
      ],
      FOOD
    );
    expect(totals).toEqual([{ date: "2026-08-01", income: 0, expense: 10 }]);
  });
});

describe("computeMonthlyCashFlow", () => {
  const now = new Date(2026, 9, 15); // October 2026

  it("returns the last N months oldest-first, zero-filled", () => {
    const flow = computeMonthlyCashFlow([], 3, now);
    expect(flow.map((m) => m.key)).toEqual(["2026-08", "2026-09", "2026-10"]);
    expect(flow.every((m) => m.income === 0 && m.expense === 0 && m.net === 0)).toBe(true);
  });

  it("sums income and expense per month and computes net", () => {
    const flow = computeMonthlyCashFlow(
      [
        { occurred_at: "2026-10-02T00:00:00Z", kind: "income", amount: 1000 },
        { occurred_at: "2026-10-09T00:00:00Z", kind: "expense", amount: 250.5 },
        { occurred_at: "2026-09-20T00:00:00Z", kind: "expense", amount: 400 },
      ],
      2,
      now
    );
    expect(flow[0]).toMatchObject({ key: "2026-09", income: 0, expense: 400, net: -400 });
    expect(flow[1]).toMatchObject({ key: "2026-10", income: 1000, expense: 250.5, net: 749.5 });
  });

  it("ignores transfers, group money, and months outside the window", () => {
    const flow = computeMonthlyCashFlow(
      [
        { occurred_at: "2026-10-01T00:00:00Z", kind: "transfer", amount: 500 },
        { occurred_at: "2026-10-01T00:00:00Z", kind: "group_advance", amount: 500 },
        { occurred_at: "2026-10-01T00:00:00Z", kind: "group_reimbursement", amount: 500 },
        { occurred_at: "2026-01-01T00:00:00Z", kind: "income", amount: 999 },
      ],
      2,
      now
    );
    expect(flow.map((m) => [m.income, m.expense])).toEqual([[0, 0], [0, 0]]);
  });

  it("rolls the window across a year boundary", () => {
    const flow = computeMonthlyCashFlow([], 3, new Date(2026, 0, 10));
    expect(flow.map((m) => m.key)).toEqual(["2025-11", "2025-12", "2026-01"]);
  });
});

describe("computeCategoryTrail", () => {
  const tx = (id: string, day: string, kind: "income" | "expense" | "transfer", amount: number, category: string | null) => ({
    id,
    occurred_at: `2026-09-${day}T00:00:00Z`,
    kind,
    amount,
    category_id: category,
  });
  const txs = [
    tx("c", "20", "expense", 300.1, FOOD),
    tx("a", "03", "expense", 120.25, FOOD),
    tx("b", "11", "expense", 80, FOOD),
    tx("d", "05", "expense", 999, BILLS),
    tx("e", "06", "income", 5000, FOOD),
    tx("f", "07", "transfer", 700, FOOD),
    tx("g", "08", "expense", 15.5, null),
  ];

  it("lists only the matching category and kind, oldest first, with running totals", () => {
    const trail = computeCategoryTrail(txs, FOOD, "expense");
    expect(trail.entries.map((e) => e.id)).toEqual(["a", "b", "c"]);
    expect(trail.entries.map((e) => e.running_total)).toEqual([120.25, 200.25, 500.35]);
    expect(trail.total).toBe(500.35);
    expect(trail.count).toBe(3);
    expect(trail.average).toBe(166.78);
    expect(trail.largest?.id).toBe("c");
  });

  it("always matches the figure computeCategoryBreakdown reports", () => {
    const breakdown = computeCategoryBreakdown(txs, [{ id: FOOD, name: "Food" }, { id: BILLS, name: "Bills" }], "expense");
    for (const entry of breakdown) {
      expect(computeCategoryTrail(txs, entry.category_id, "expense").total).toBe(entry.amount);
    }
  });

  it("supports the Uncategorized bucket and income", () => {
    expect(computeCategoryTrail(txs, null, "expense").total).toBe(15.5);
    expect(computeCategoryTrail(txs, FOOD, "income").total).toBe(5000);
  });

  it("returns an empty trail when nothing matches", () => {
    const trail = computeCategoryTrail(txs, "nope", "expense");
    expect(trail).toMatchObject({ entries: [], total: 0, count: 0, average: 0, largest: null });
  });

  it("keeps cents exact across many small amounts", () => {
    const many = Array.from({ length: 10 }, (_, i) => tx(`m${i}`, "10", "expense", 0.1, FOOD));
    expect(computeCategoryTrail(many, FOOD, "expense").total).toBe(1);
  });
});
