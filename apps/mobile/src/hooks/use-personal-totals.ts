import { useMemo } from "react";
import {
  computeMonthlyCashFlow,
  computeTotalInBase,
  convertTransactionsToBase,
  foreignCurrencies,
  type MonthlyCashFlow,
  type TotalInBase,
} from "@evensplit/shared";
import { useAuth } from "@/hooks/use-auth";
import { usePersonalAccounts, usePersonalTransactions } from "@/hooks/use-personal";
import { useFxRates } from "@/lib/fx-rates";

export interface PersonalTotals {
  /** The currency every total below is expressed in. */
  base: string;
  total: TotalInBase;
  months: MonthlyCashFlow[];
  current: MonthlyCashFlow;
  /** Foreign currencies the user holds that still need a rate (their money is left out of the totals). */
  missing: string[];
  /** True when the user has accounts in more than one currency. */
  multiCurrency: boolean;
}

/**
 * Personal totals in a single base currency (the profile's default currency,
 * else the first account's). Single-currency users get exactly the numbers they
 * always did; multi-currency users get converted totals using their own rates.
 */
export function usePersonalTotals(): PersonalTotals | null {
  const { profile } = useAuth();
  const { data: accounts } = usePersonalAccounts();
  const { data: transactions } = usePersonalTransactions();
  const { rates } = useFxRates();

  return useMemo(() => {
    if (!accounts || accounts.length === 0) return null;
    const base = profile?.default_currency ?? accounts[0].currency;
    const foreign = foreignCurrencies(accounts, base);
    const total = computeTotalInBase(accounts, transactions ?? [], base, rates);
    const converted = convertTransactionsToBase(transactions ?? [], accounts, base, rates);
    const months = computeMonthlyCashFlow(converted.transactions, 6);
    return {
      base,
      total,
      months,
      current: months[months.length - 1],
      missing: [...new Set([...total.missing, ...converted.missing])].sort(),
      multiCurrency: foreign.length > 0,
    };
  }, [accounts, transactions, rates, profile?.default_currency]);
}

/**
 * All personal transactions converted into the base currency, for the
 * breakdowns (Analysis, Insights, trail) so their numbers agree with the totals.
 */
export function useBaseTransactions() {
  const { profile } = useAuth();
  const { data: accounts } = usePersonalAccounts();
  const { data: transactions, isLoading } = usePersonalTransactions();
  const { rates } = useFxRates();

  return useMemo(() => {
    const base = profile?.default_currency ?? accounts?.[0]?.currency ?? "PHP";
    const converted = convertTransactionsToBase(transactions ?? [], accounts ?? [], base, rates);
    return { base, transactions: converted.transactions, missing: converted.missing, isLoading };
  }, [accounts, transactions, rates, profile?.default_currency, isLoading]);
}
