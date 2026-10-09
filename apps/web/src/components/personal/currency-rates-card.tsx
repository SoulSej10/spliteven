"use client";

import { useState } from "react";
import { foreignCurrencies, isValidRate } from "@evensplit/shared";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { usePersonalAccounts } from "@/hooks/use-personal";
import { usePersonalTotals } from "@/hooks/use-personal-totals";
import { formatMoney } from "@/lib/format";
import { setFxRate, useFxRates } from "@/lib/fx-rates";

/**
 * For people with accounts in more than one currency: type an approximate rate
 * per currency and see the working. Everything is then converted into the
 * default currency, with the original amount still shown. Renders nothing for
 * single-currency users.
 */
export function CurrencyRatesCard() {
  const { profile } = useAuth();
  const { data: accounts } = usePersonalAccounts();
  const rates = useFxRates();
  const totals = usePersonalTotals();
  const [drafts, setDrafts] = useState<Record<string, string>>({});

  if (!accounts || !totals || !totals.multiCurrency) return null;
  const base = profile?.default_currency ?? accounts[0].currency;
  const foreign = foreignCurrencies(accounts, base);

  function onChange(currency: string, text: string) {
    const cleaned = text.replace(/[^0-9.]/g, "");
    setDrafts((d) => ({ ...d, [currency]: cleaned }));
    const value = parseFloat(cleaned);
    setFxRate(currency, isValidRate(value) ? value : null);
  }

  return (
    <Card className="rounded-2xl border-border/60 shadow-sm">
      <CardHeader>
        <CardTitle>Currency rates</CardTitle>
        <CardDescription>
          You hold accounts in more than one currency. Enter an approximate rate for each and everything (totals,
          budgets, analysis) is converted to {base}, while the original amount is still shown. Saved in this browser.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {foreign.map((currency) => {
          const text = drafts[currency] ?? (rates[currency] !== undefined ? String(rates[currency]) : "");
          return (
            <div key={currency} className="flex items-center gap-2">
              <span className="w-20 shrink-0 text-sm font-medium">1 {currency} =</span>
              <Input
                value={text}
                onChange={(e) => onChange(currency, e.target.value)}
                inputMode="decimal"
                placeholder="0.00"
                aria-label={`${currency} to ${base} rate`}
                className="max-w-40"
              />
              <span className="text-sm text-muted-foreground">{base}</span>
            </div>
          );
        })}

        <div className="space-y-1.5 rounded-lg bg-primary-light p-3 text-xs text-primary-deep">
          <p className="font-semibold">Check the math</p>
          {totals.total.accounts.map((row) => {
            const account = accounts.find((a) => a.id === row.account_id);
            if (!account) return null;
            return (
              <div key={row.account_id} className="flex items-center justify-between gap-2">
                <span className="truncate">{account.name}</span>
                <span className="shrink-0 text-muted-foreground">
                  {formatMoney(row.balance, row.currency)}
                  {row.currency !== base
                    ? ` → ${row.converted === null ? "needs a rate" : formatMoney(row.converted, base)}`
                    : ""}
                </span>
              </div>
            );
          })}
          <div className="flex items-center justify-between border-t border-border pt-1.5 font-semibold">
            <span>Total in {base}</span>
            <span>{formatMoney(totals.total.total, base)}</span>
          </div>
        </div>

        {totals.missing.length > 0 && (
          <p className="text-xs text-destructive">
            Missing a rate for {totals.missing.join(", ")}: that money isn&apos;t counted in your totals yet.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
