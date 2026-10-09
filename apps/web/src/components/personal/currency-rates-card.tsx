"use client";

import { useState } from "react";
import { PencilSimple, Plus } from "@phosphor-icons/react";
import { foreignCurrencies, isValidRate } from "@evensplit/shared";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { usePersonalAccounts } from "@/hooks/use-personal";
import { usePersonalTotals } from "@/hooks/use-personal-totals";
import { CURRENCIES, formatMoney } from "@/lib/format";
import { clearPendingRate, setFxRate, useFxRates, usePendingRateCurrency } from "@/lib/fx-rates";
import { cn } from "@/lib/utils";

/**
 * Settings section for converting foreign currencies into the default one.
 * Saved rates are listed (click one to edit or remove it), currencies the user
 * already holds an account in but has no rate for are flagged, and "Add rate"
 * opens the dialog for any other currency.
 */
export function CurrencyRatesCard() {
  const { profile } = useAuth();
  const { data: accounts } = usePersonalAccounts();
  const rates = useFxRates();
  const totals = usePersonalTotals();
  const pending = usePendingRateCurrency();

  const base = profile?.default_currency ?? accounts?.[0]?.currency ?? "PHP";
  const inUse = accounts ? foreignCurrencies(accounts, base) : [];
  const saved = Object.keys(rates).filter((c) => c !== base).sort();
  const missing = inUse.filter((c) => rates[c] === undefined);

  // Open either by the user (Add / edit) or because they were sent here from Add account.
  const [manual, setManual] = useState<{ open: boolean; currency: string | null }>({ open: false, currency: null });
  const active = pending ? { open: true, currency: pending } : manual;
  const openFor = (currency: string | null) => setManual({ open: true, currency });
  const closeDialog = () => {
    setManual({ open: false, currency: null });
    clearPendingRate();
  };

  return (
    <Card className="rounded-2xl border-border/60 shadow-sm">
      <CardHeader>
        <CardTitle>Currency rates</CardTitle>
        <CardDescription>
          Your default currency is {base}. For accounts in another currency, save an approximate rate and everything
          (totals, budgets, analysis) is converted to {base}, with the original amount still shown. Saved in this
          browser.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {saved.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => openFor(c)}
            className="flex w-full items-center justify-between rounded-lg border border-border px-4 py-3 text-left text-sm font-medium hover:bg-muted"
          >
            <span>
              1 {c} = {formatMoney(rates[c], base)}
            </span>
            <PencilSimple className="h-4 w-4 text-muted-foreground" />
          </button>
        ))}

        {missing.map((c) => (
          <div
            key={c}
            className="flex items-center justify-between gap-3 rounded-lg border border-destructive px-4 py-3 text-sm"
          >
            <div>
              <p className="font-medium">{c}</p>
              <p className="text-xs text-destructive">You have an account in {c} but no rate yet.</p>
            </div>
            <Button size="sm" type="button" onClick={() => openFor(c)}>
              Set rate
            </Button>
          </div>
        ))}

        <Button variant="outline" type="button" onClick={() => openFor(null)}>
          <Plus className="mr-1 h-4 w-4" /> Add rate
        </Button>

        {totals?.multiCurrency && (
          <div className="space-y-1.5 rounded-lg bg-primary-light p-3 text-xs text-primary-deep">
            <p className="font-semibold">Check the math</p>
            {totals.total.accounts.map((row) => {
              const account = accounts?.find((a) => a.id === row.account_id);
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
        )}
      </CardContent>

      {active.open && (
        <RateDialog
          key={active.currency ?? "new"}
          base={base}
          initialCurrency={active.currency}
          existingRate={active.currency ? rates[active.currency] : undefined}
          onClose={closeDialog}
        />
      )}
    </Card>
  );
}

/** Add, edit or remove the rate for one currency. Mounted only while open, so its fields start fresh each time. */
function RateDialog({
  base,
  initialCurrency,
  existingRate,
  onClose,
}: {
  base: string;
  initialCurrency: string | null;
  existingRate: number | undefined;
  onClose: () => void;
}) {
  const options = CURRENCIES.filter((c) => c !== base);
  const [currency, setCurrency] = useState<string>(initialCurrency ?? options[0] ?? "USD");
  const [text, setText] = useState(existingRate !== undefined ? String(existingRate) : "");
  const [error, setError] = useState<string | null>(null);
  const editing = existingRate !== undefined;

  function onSave() {
    const value = parseFloat(text.replace(/,/g, ""));
    if (!isValidRate(value)) {
      setError("Enter a rate greater than 0, for example 58.25.");
      return;
    }
    setFxRate(currency, value);
    onClose();
  }

  return (
    <Dialog open onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="rounded-2xl sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{editing ? `Edit ${currency} rate` : "Add a currency rate"}</DialogTitle>
          <DialogDescription>
            An approximate rate is fine. Everything in {currency} is converted to {base} with it, and the original
            amount stays visible.
          </DialogDescription>
        </DialogHeader>
        {!editing && (
          <div className="space-y-1.5">
            <Label>Currency</Label>
            <div className="flex flex-wrap gap-2">
              {options.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCurrency(c)}
                  className={cn(
                    "rounded-full border px-3 py-1 text-xs font-medium",
                    currency === c ? "border-primary bg-primary-light text-primary-deep" : "border-border text-muted-foreground"
                  )}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        )}
        <div className="space-y-1.5">
          <Label htmlFor="fx-rate">
            1 {currency} equals how many {base}?
          </Label>
          <Input
            id="fx-rate"
            inputMode="decimal"
            placeholder="0.00"
            value={text}
            onChange={(e) => {
              setText(e.target.value.replace(/[^0-9.,]/g, ""));
              setError(null);
            }}
          />
          {error && <p className="text-xs text-destructive">{error}</p>}
        </div>
        <DialogFooter className="gap-2 sm:justify-between">
          {editing ? (
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setFxRate(currency, null);
                onClose();
              }}
            >
              Remove this rate
            </Button>
          ) : (
            <span />
          )}
          <Button type="button" onClick={onSave}>
            Save rate
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
