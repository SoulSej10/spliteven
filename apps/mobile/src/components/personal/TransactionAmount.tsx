import { View } from "react-native";
import { MoneyText } from "@/components/ui/MoneyText";
import { Text } from "@/components/ui/typography";
import { useAmountConverter } from "@/hooks/use-personal-totals";
import { formatMoney } from "@/lib/format";

/**
 * A transaction amount shown in the user's default currency. When the account
 * is in another currency the converted figure leads and the original amount
 * (in its own currency) sits underneath, so nothing is hidden. With no rate set
 * yet it falls back to the original amount and says so.
 */
export function TransactionAmount({
  amount,
  accountId,
  tone = "neutral",
}: {
  /** Signed: negative for money going out. */
  amount: number;
  accountId: string;
  tone?: "positive" | "negative" | "neutral" | "auto";
}) {
  const { base, convert } = useAmountConverter();
  const { converted, original } = convert(Math.abs(amount), accountId);
  const sign = amount < 0 ? -1 : 1;

  if (!original) return <MoneyText amount={sign * (converted ?? 0)} currency={base} tone={tone} />;

  if (converted === null) {
    return (
      <View className="items-end">
        <MoneyText amount={sign * original.amount} currency={original.currency} tone={tone} />
        <Text className="text-[10px] text-neutral-500">No rate set for {original.currency}</Text>
      </View>
    );
  }

  return (
    <View className="items-end">
      <MoneyText amount={sign * converted} currency={base} tone={tone} />
      <Text className="text-[10px] text-neutral-500">{formatMoney(original.amount, original.currency)}</Text>
    </View>
  );
}
