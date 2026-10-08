import { computeAccountBalance } from "./personalFinance";
import type { PersonalAccount, PersonalTransaction } from "./types";

/**
 * Manual currency conversion for the personal-finance totals. There is no live
 * exchange feed: when someone holds accounts in more than one currency they
 * enter the rate themselves, so every total in the app is checkable against a
 * number they typed. Rates are "units of the base currency per 1 unit of the
 * foreign currency" (base PHP, USD rate 58.2 means 1 USD = 58.20 PHP).
 */
export type FxRates = Record<string, number>;

const CENTS = 100;
const round2 = (n: number) => Math.round((n + Number.EPSILON) * CENTS) / CENTS;

/** Distinct currencies across a user's accounts, base currency first. */
export function currenciesInUse(accounts: Pick<PersonalAccount, "currency">[], base: string): string[] {
  const set = new Set<string>();
  for (const a of accounts) set.add(a.currency);
  const foreign = [...set].filter((c) => c !== base).sort();
  return set.has(base) || foreign.length === 0 ? [base, ...foreign] : foreign;
}

/** Currencies other than the base one that need a rate. Empty for single-currency users. */
export function foreignCurrencies(accounts: Pick<PersonalAccount, "currency">[], base: string): string[] {
  return [...new Set(accounts.map((a) => a.currency))].filter((c) => c !== base).sort();
}

export function isValidRate(rate: unknown): rate is number {
  return typeof rate === "number" && Number.isFinite(rate) && rate > 0;
}

/** Converts into the base currency, or null when a rate is needed and hasn't been set. */
export function convertToBase(amount: number, currency: string, base: string, rates: FxRates): number | null {
  if (currency === base) return amount;
  const rate = rates[currency];
  return isValidRate(rate) ? amount * rate : null;
}

export interface ConvertedAccountBalance {
  account_id: string;
  currency: string;
  balance: number;
  /** Balance in the base currency; null when this currency has no rate yet. */
  converted: number | null;
}

export interface TotalInBase {
  base: string;
  total: number;
  accounts: ConvertedAccountBalance[];
  /** Foreign currencies that hold money but have no rate, so are left out of `total`. */
  missing: string[];
}

/** Total balance across all accounts expressed in `base`, with the per-account working for verification. */
export function computeTotalInBase(
  accounts: Pick<PersonalAccount, "id" | "starting_balance" | "currency">[],
  transactions: Pick<PersonalTransaction, "account_id" | "transfer_account_id" | "kind" | "amount">[],
  base: string,
  rates: FxRates
): TotalInBase {
  const rows: ConvertedAccountBalance[] = accounts.map((account) => {
    const balance = computeAccountBalance(account, transactions);
    const converted = convertToBase(balance, account.currency, base, rates);
    return {
      account_id: account.id,
      currency: account.currency,
      balance,
      converted: converted === null ? null : round2(converted),
    };
  });
  const missing = [...new Set(rows.filter((r) => r.converted === null).map((r) => r.currency))].sort();
  const total = round2(rows.reduce((sum, r) => sum + (r.converted ?? 0), 0));
  return { base, total, accounts: rows, missing };
}

/**
 * Transactions with each amount converted into the base currency using the
 * currency of the account it was booked on. Rows in a currency with no rate are
 * dropped (and reported in `missing`) rather than being silently added at 1:1.
 */
export function convertTransactionsToBase<T extends Pick<PersonalTransaction, "account_id" | "amount">>(
  transactions: T[],
  accounts: Pick<PersonalAccount, "id" | "currency">[],
  base: string,
  rates: FxRates
): { transactions: T[]; missing: string[] } {
  const currencyOf = new Map(accounts.map((a) => [a.id, a.currency]));
  const missing = new Set<string>();
  const out: T[] = [];
  for (const tx of transactions) {
    const currency = currencyOf.get(tx.account_id) ?? base;
    const converted = convertToBase(tx.amount, currency, base, rates);
    if (converted === null) {
      missing.add(currency);
      continue;
    }
    out.push(currency === base ? tx : { ...tx, amount: round2(converted) });
  }
  return { transactions: out, missing: [...missing].sort() };
}
