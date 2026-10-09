import { useEffect, useState } from "react";
import { Pressable, View } from "react-native";
import { ArrowsLeftRight, PencilSimple, Plus } from "phosphor-react-native";
import { foreignCurrencies } from "@evensplit/shared";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Text } from "@/components/ui/typography";
import { AddRateSheet } from "@/components/personal/AddRateSheet";
import { useAuth } from "@/hooks/use-auth";
import { usePersonalAccounts } from "@/hooks/use-personal";
import { usePersonalTotals } from "@/hooks/use-personal-totals";
import { clearPendingRate, useFxRates, usePendingRateCurrency } from "@/lib/fx-rates";
import { formatMoney } from "@/lib/format";
import { palette } from "@/theme/palette";

/**
 * Settings section for converting foreign currencies into the default one.
 * Saved rates are listed (tap one to edit or remove it), currencies the user
 * already holds an account in but hasn't given a rate for are flagged, and
 * "Add rate" opens the sheet for any other currency.
 */
export function CurrencyRatesCard() {
  const { profile } = useAuth();
  const { data: accounts } = usePersonalAccounts();
  const { rates } = useFxRates();
  const totals = usePersonalTotals();
  const pending = usePendingRateCurrency();
  const [sheet, setSheet] = useState<{ visible: boolean; currency: string | null }>({ visible: false, currency: null });

  const base = profile?.default_currency ?? accounts?.[0]?.currency ?? "PHP";
  const inUse = accounts ? foreignCurrencies(accounts, base) : [];
  const saved = Object.keys(rates).filter((c) => c !== base).sort();
  const missing = inUse.filter((c) => rates[c] === undefined);

  // Sent here from Add account: open straight to the currency that needs a rate.
  useEffect(() => {
    if (pending) {
      setSheet({ visible: true, currency: pending });
      clearPendingRate();
    }
  }, [pending]);

  return (
    <Card className="gap-4">
      <View className="flex-row items-center gap-2">
        <ArrowsLeftRight color={palette.primary} size={18} />
        <Text className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">Currency rates</Text>
      </View>
      <Text className="text-xs text-neutral-500">
        Your default currency is {base}. For accounts in another currency, save an approximate rate and everything
        (totals, budgets, analysis) is converted to {base}, with the original amount still shown. Rates are saved on
        this device.
      </Text>

      {saved.map((currency) => (
        <Pressable
          key={currency}
          onPress={() => setSheet({ visible: true, currency })}
          accessibilityLabel={`Edit ${currency} rate`}
          className="flex-row items-center justify-between rounded-card border border-neutral-200 px-4 py-3"
        >
          <Text className="font-medium text-neutral-900 dark:text-neutral-100">
            1 {currency} = {formatMoney(rates[currency], base)}
          </Text>
          <PencilSimple color={palette.muted} size={16} />
        </Pressable>
      ))}

      {missing.map((currency) => (
        <View
          key={currency}
          className="flex-row items-center justify-between rounded-card border border-negative px-4 py-3"
        >
          <View className="flex-1 pr-3">
            <Text className="font-medium text-neutral-900 dark:text-neutral-100">{currency}</Text>
            <Text className="text-xs text-negative">You have an account in {currency} but no rate yet.</Text>
          </View>
          <Button size="sm" onPress={() => setSheet({ visible: true, currency })}>
            Set rate
          </Button>
        </View>
      ))}

      <Button variant="outline" onPress={() => setSheet({ visible: true, currency: null })}>
        <View className="flex-row items-center gap-1.5">
          <Plus color={palette.primary} size={14} />
          <Text className="text-sm font-semibold text-primary-deep">Add rate</Text>
        </View>
      </Button>

      {totals?.multiCurrency && (
        <View className="gap-2 rounded-card bg-primary-light p-3">
          <Text className="text-xs font-semibold text-primary-deep">Check the math</Text>
          {totals.total.accounts.map((row) => {
            const account = accounts?.find((a) => a.id === row.account_id);
            if (!account) return null;
            return (
              <View key={row.account_id} className="flex-row items-center justify-between gap-2">
                <Text className="flex-1 text-xs text-neutral-900 dark:text-neutral-100" numberOfLines={1}>
                  {account.name}
                </Text>
                <Text className="text-xs text-neutral-700 dark:text-neutral-100">
                  {formatMoney(row.balance, row.currency)}
                  {row.currency !== base
                    ? ` → ${row.converted === null ? "needs a rate" : formatMoney(row.converted, base)}`
                    : ""}
                </Text>
              </View>
            );
          })}
          <View className="mt-1 flex-row items-center justify-between border-t border-neutral-200 pt-2">
            <Text className="text-xs font-semibold text-primary-deep">Total in {base}</Text>
            <Text className="text-sm font-bold text-primary-deep">{formatMoney(totals.total.total, base)}</Text>
          </View>
        </View>
      )}

      <AddRateSheet
        visible={sheet.visible}
        onClose={() => setSheet((s) => ({ ...s, visible: false }))}
        base={base}
        initialCurrency={sheet.currency}
        existingRate={sheet.currency ? rates[sheet.currency] : undefined}
      />
    </Card>
  );
}
