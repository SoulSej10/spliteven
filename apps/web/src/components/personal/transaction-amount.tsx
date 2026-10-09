"use client";

import { useAmountConverter } from "@/hooks/use-personal-totals";
import { formatMoney } from "@/lib/format";

/**
 * A transaction amount in the default currency. For an account in another
 * currency the converted figure leads and the original amount sits underneath.
 */
export function TransactionAmount({
  amount,
  accountId,
  className,
}: {
  /** Signed: negative for money going out. */
  amount: number;
  accountId: string;
  className?: string;
}) {
  const { base, convert } = useAmountConverter();
  const { converted, original } = convert(Math.abs(amount), accountId);
  const sign = amount < 0 ? -1 : 1;

  if (!original) return <span className={className}>{formatMoney(sign * (converted ?? 0), base)}</span>;
  if (converted === null) {
    return (
      <span className={className}>
        {formatMoney(sign * original.amount, original.currency)}
        <span className="block text-[10px] font-normal text-muted-foreground">No rate set for {original.currency}</span>
      </span>
    );
  }
  return (
    <span className={className}>
      {formatMoney(sign * converted, base)}
      <span className="block text-[10px] font-normal text-muted-foreground">
        {formatMoney(original.amount, original.currency)}
      </span>
    </span>
  );
}
