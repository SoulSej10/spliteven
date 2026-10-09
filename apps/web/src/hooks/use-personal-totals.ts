"use client";

import { useMemo } from "react";
import {
  computeMonthlyCashFlow,
  computeTotalInBase,
  convertAmount,
  convertTransactionsToBase,
  foreignCurrencies,
  type ConvertedAmount,
  type MonthlyCashFlow,
  type TotalInBase,
} from "@evensplit/shared";
import { useAuth } from "@/hooks/use-auth";
import { usePersonalAccounts, usePersonalTransactions } from "@/hooks/use-personal";
import { useFxRates } from "@/lib/fx-rates";

export interface PersonalTotals {
  /** The currency every total below is expressed in (the profile's default currency). */
  base: string;
  total: TotalInBase;
  months: MonthlyCashFlow[];
  current: MonthlyCashFlow;
  /** Foreign currencies that still need a rate (that money is left out of the totals). */
  missing: string[];
  multiCurrency: boolean;
}

/** Personal totals in one base currency; single-currency users see exactly what they always did. */
export function usePersonalTotals(): PersonalTotals | null {
  const { profile } = useAuth();
  const { data: accounts } = usePersonalAccounts();
  const { data: transactions } = usePersonalTransactions();
  const rates = useFxRates();

  return useMemo(() => {
    if (!accounts || accounts.length === 0) return null;
    const base = profile?.default_currency ?? accounts[0].currency;
    const total = computeTotalInBase(accounts, transactions ?? [], base, rates);
    const converted = convertTransactionsToBase(transactions ?? [], accounts, base, rates);
    const months = computeMonthlyCashFlow(converted.transactions, 6);
    return {
      base,
      total,
      months,
      current: months[months.length - 1],
      missing: [...new Set([...total.missing, ...converted.missing])].sort(),
      multiCurrency: foreignCurrencies(accounts, base).length > 0,
    };
  }, [accounts, transactions, rates, profile?.default_currency]);
}

/** All personal transactions converted into the base currency, for budgets and breakdowns. */
export function useBaseTransactions() {
  const { profile } = useAuth();
  const { data: accounts } = usePersonalAccounts();
  const { data: transactions, isLoading } = usePersonalTransactions();
  const rates = useFxRates();

  return useMemo(() => {
    const base = profile?.default_currency ?? accounts?.[0]?.currency ?? "PHP";
    const converted = convertTransactionsToBase(transactions ?? [], accounts ?? [], base, rates);
    return { base, transactions: converted.transactions, missing: converted.missing, isLoading };
  }, [accounts, transactions, rates, profile?.default_currency, isLoading]);
}

/** Converts one transaction amount into the base currency for display, keeping the original. */
export function useAmountConverter() {
  const { profile } = useAuth();
  const { data: accounts } = usePersonalAccounts();
  const rates = useFxRates();
  const base = profile?.default_currency ?? accounts?.[0]?.currency ?? "PHP";
  return {
    base,
    convert(amount: number, accountId: string): ConvertedAmount {
      const currency = accounts?.find((a) => a.id === accountId)?.currency ?? base;
      return convertAmount(amount, currency, base, rates);
    },
  };
}
