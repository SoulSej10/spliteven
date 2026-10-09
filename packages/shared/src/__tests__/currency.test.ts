import { describe, expect, it } from "vitest";
import {
  convertAmount,
  computeTotalInBase,
  convertToBase,
  convertTransactionsToBase,
  currenciesInUse,
  foreignCurrencies,
} from "../currency";

const accounts = [
  { id: "a", currency: "PHP", starting_balance: 1000 },
  { id: "b", currency: "USD", starting_balance: 100 },
];
const tx = (account_id: string, kind: "income" | "expense", amount: number) => ({
  account_id,
  transfer_account_id: null,
  kind,
  amount,
});

describe("currency conversion", () => {
  it("only reports foreign currencies for multi-currency users", () => {
    expect(foreignCurrencies([{ currency: "PHP" }], "PHP")).toEqual([]);
    expect(foreignCurrencies(accounts, "PHP")).toEqual(["USD"]);
    expect(currenciesInUse(accounts, "PHP")).toEqual(["PHP", "USD"]);
  });

  it("converts with a user rate and refuses without one", () => {
    expect(convertToBase(10, "USD", "PHP", { USD: 58 })).toBe(580);
    expect(convertToBase(10, "PHP", "PHP", {})).toBe(10);
    expect(convertToBase(10, "USD", "PHP", {})).toBeNull();
    expect(convertToBase(10, "USD", "PHP", { USD: 0 })).toBeNull();
  });

  it("totals balances in the base currency and leaves unrated currencies out", () => {
    const txs = [tx("b", "expense", 20), tx("a", "income", 500)];
    const rated = computeTotalInBase(accounts, txs, "PHP", { USD: 58 });
    expect(rated.total).toBe(1500 + 80 * 58);
    expect(rated.missing).toEqual([]);
    const unrated = computeTotalInBase(accounts, txs, "PHP", {});
    expect(unrated.total).toBe(1500);
    expect(unrated.missing).toEqual(["USD"]);
  });

  it("converts transactions by their account's currency", () => {
    const out = convertTransactionsToBase([tx("a", "expense", 100), tx("b", "expense", 2)], accounts, "PHP", {
      USD: 50,
    });
    expect(out.transactions.map((t) => t.amount)).toEqual([100, 100]);
    expect(convertTransactionsToBase([tx("b", "expense", 2)], accounts, "PHP", {}).missing).toEqual(["USD"]);
  });

  it("keeps the original amount and currency on converted rows", () => {
    const out = convertTransactionsToBase([tx("b", "expense", 2), tx("a", "expense", 7)], accounts, "PHP", { USD: 50 });
    expect(out.transactions[0]).toMatchObject({ amount: 100, original: { amount: 2, currency: "USD" } });
    expect(out.transactions[1].original).toBeUndefined();
  });

  it("converts a single amount for display", () => {
    expect(convertAmount(10, "USD", "PHP", { USD: 58 })).toEqual({ converted: 580, original: { amount: 10, currency: "USD" } });
    expect(convertAmount(10, "USD", "PHP", {})).toEqual({ converted: null, original: { amount: 10, currency: "USD" } });
    expect(convertAmount(10, "PHP", "PHP", {})).toEqual({ converted: 10, original: null });
  });
});
