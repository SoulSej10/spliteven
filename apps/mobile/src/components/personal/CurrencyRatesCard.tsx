import { useState } from "react";
import { View } from "react-native";
import { Text, TextInput } from "@/components/ui/typography";
import { ArrowsLeftRight } from "phosphor-react-native";
import { foreignCurrencies, isValidRate } from "@evensplit/shared";
import { Card } from "@/components/ui/Card";
import { useAuth } from "@/hooks/use-auth";
import { usePersonalAccounts } from "@/hooks/use-personal";
import { usePersonalTotals } from "@/hooks/use-personal-totals";
import { setFxRate, useFxRates } from "@/lib/fx-rates";
import { formatMoney } from "@/lib/format";
import { palette } from "@/theme/palette";

/**
 * Lets someone with accounts in more than one currency type in today's
 * conversion rate and see the working, so the converted totals can be checked
 * against their own bank or e-wallet. Renders nothing for single-currency users.
 */
export function CurrencyRatesCard() {
  const { profile } = useAuth();
  const { data: accounts } = usePersonalAccounts();
  const { rates } = useFxRates();
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
    <Card className="gap-4">
      <View className="flex-row items-center gap-2">
        <ArrowsLeftRight color={palette.primary} size={18} />
        <Text className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">Currency rates</Text>
      </View>
      <Text className="text-xs text-neutral-500">
        You hold accounts in more than one currency. Enter an approximate rate for each and everything (totals,
        budgets, analysis) is converted to your default currency, {base}, while the original amount is still shown.
        Rates are saved on this device.
      </Text>

      {foreign.map((currency) => {
        const text = drafts[currency] ?? (rates[currency] !== undefined ? String(rates[currency]) : "");
        return (
          <View key={currency} className="flex-row items-center gap-2">
            <Text className="w-20 text-sm font-medium text-neutral-900 dark:text-neutral-100">1 {currency} =</Text>
            <TextInput
              value={text}
              onChangeText={(t) => onChange(currency, t)}
              keyboardType="decimal-pad"
              placeholder="0.00"
              placeholderTextColor={palette.muted}
              accessibilityLabel={`${currency} to ${base} rate`}
              className="h-11 flex-1 rounded-card border border-neutral-200 bg-surface px-3 text-base text-neutral-900 dark:bg-surface-dark dark:text-neutral-100"
            />
            <Text className="w-10 text-sm text-neutral-500">{base}</Text>
          </View>
        );
      })}

      <View className="gap-2 rounded-card bg-primary-light p-3">
        <Text className="text-xs font-semibold text-primary-deep">Check the math</Text>
        {totals.total.accounts.map((row) => {
          const account = accounts.find((a) => a.id === row.account_id);
          if (!account) return null;
          return (
            <View key={row.account_id} className="flex-row items-center justify-between gap-2">
              <Text className="flex-1 text-xs text-neutral-700 dark:text-neutral-300" numberOfLines={1}>
                {account.name}
              </Text>
              <Text className="text-xs text-neutral-500">
                {formatMoney(row.balance, row.currency)}
                {row.currency !== base ? ` → ${row.converted === null ? "needs a rate" : formatMoney(row.converted, base)}` : ""}
              </Text>
            </View>
          );
        })}
        <View className="mt-1 flex-row items-center justify-between border-t border-neutral-200 pt-2">
          <Text className="text-xs font-semibold text-primary-deep">Total in {base}</Text>
          <Text className="text-sm font-bold text-primary-deep">{formatMoney(totals.total.total, base)}</Text>
        </View>
      </View>

      {totals.missing.length > 0 && (
        <Text className="text-xs text-negative">
          Missing a rate for {totals.missing.join(", ")}: that money isn't counted in your totals yet.
        </Text>
      )}
    </Card>
  );
}
