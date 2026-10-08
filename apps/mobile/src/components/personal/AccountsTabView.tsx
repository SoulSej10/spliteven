import { useState } from "react";
import { Alert, Pressable, Text, View } from "react-native";
import { computeAllAccountBalances, type PersonalAccount, type PersonalAccountType } from "@evensplit/shared";
import { Pencil, Plus, Sparkle, Wallet } from "phosphor-react-native";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { MoneyText } from "@/components/ui/MoneyText";
import { SkeletonCardRows } from "@/components/ui/Skeleton";
import { ErrorState } from "@/components/ui/ErrorState";
import {
  useArchivePersonalAccount,
  usePersonalAccounts,
  usePersonalTransactions,
} from "@/hooks/use-personal";
import { AddAccountSheet, type AccountPrefill } from "@/components/personal/AddAccountSheet";
import { palette } from "@/theme/palette";

/**
 * Common account types most people have, shown as inactive "template" cards
 * with an Add button whenever the user doesn't already have one of that
 * type - only becomes a real account once they actually add it (see
 * BudgetsTabView's matching "starter suggestion" pattern for budgets).
 */
const ACCOUNT_SUGGESTIONS: AccountPrefill[] = [
  { name: "Savings", type: "savings", icon: "🏦" },
  { name: "Credit/Debit Card", type: "card", icon: "💳" },
  { name: "E-wallet", type: "wallet", icon: "👛" },
];

/** The "Add account" action lives in finances.tsx's floating action button, not inline here - editing an existing account is inline (tap the pencil), archiving is a long-press. */
export function AccountsTabView() {
  const { data: accounts, isLoading, isError, refetch } = usePersonalAccounts();
  const { data: transactions } = usePersonalTransactions();
  const archiveAccount = useArchivePersonalAccount();
  const [editing, setEditing] = useState<PersonalAccount | null>(null);
  const [addingSuggestion, setAddingSuggestion] = useState<AccountPrefill | null>(null);

  const existingTypes = new Set<PersonalAccountType>((accounts ?? []).map((a) => a.type));
  const suggestions = ACCOUNT_SUGGESTIONS.filter((s) => !existingTypes.has(s.type));

  const balances = computeAllAccountBalances(accounts ?? [], transactions ?? []);

  function onArchive(accountId: string, name: string) {
    Alert.alert(`Archive ${name}?`, "It'll be hidden from your accounts list.", [
      { text: "Cancel", style: "cancel" },
      { text: "Archive", style: "destructive", onPress: () => archiveAccount.mutate(accountId) },
    ]);
  }

  if (isLoading) return <SkeletonCardRows count={3} />;
  if (isError) return <ErrorState message="Couldn't load accounts." onRetry={() => refetch()} />;

  return (
    <View className="gap-3">
      {accounts?.length === 0 && (
        <View className="items-center gap-2 py-14">
          <View className="h-14 w-14 items-center justify-center rounded-full bg-primary-light">
            <Wallet color={palette.primary} size={22} />
          </View>
          <Text className="text-sm text-neutral-500">No accounts yet. Add cash, a card, or savings.</Text>
        </View>
      )}

      {accounts?.map((account) => {
        const balance = balances.find((b) => b.account_id === account.id)?.balance ?? 0;
        return (
          <Pressable key={account.id} onLongPress={() => onArchive(account.id, account.name)}>
            <Card className="flex-row items-center gap-3 py-3">
              <View className="h-10 w-10 items-center justify-center rounded-full bg-primary-light">
                <Text className="text-lg">{account.icon ?? "💵"}</Text>
              </View>
              <View className="flex-1">
                <Text className="font-medium text-neutral-900 dark:text-neutral-100">{account.name}</Text>
                <Text className="text-xs capitalize text-neutral-500">{account.type}</Text>
              </View>
              <MoneyText amount={balance} currency={account.currency} tone="neutral" />
              <Pressable onPress={() => setEditing(account)} hitSlop={10} className="ml-1">
                <Pencil color={palette.muted} size={16} />
              </Pressable>
            </Card>
          </Pressable>
        );
      })}

      {suggestions.length > 0 && (
        <View className="gap-2">
          <View className="flex-row items-center gap-1.5">
            <Sparkle color={palette.muted} size={13} />
            <Text className="text-xs font-medium text-neutral-500">You might also want</Text>
          </View>
          {suggestions.map((s) => (
            <Card key={s.type} className="flex-row items-center gap-3 py-3 opacity-60">
              <View className="h-10 w-10 items-center justify-center rounded-full bg-neutral-100 dark:bg-white/5">
                <Text className="text-lg">{s.icon}</Text>
              </View>
              <View className="flex-1">
                <Text className="font-medium text-neutral-900 dark:text-neutral-100">{s.name}</Text>
                <Text className="text-xs capitalize text-neutral-500">{s.type}</Text>
              </View>
              <Button variant="outline" size="sm" onPress={() => setAddingSuggestion(s)}>
                <View className="flex-row items-center gap-1">
                  <Plus color={palette.primary} size={14} />
                  <Text className="text-sm font-semibold text-primary-deep">Add</Text>
                </View>
              </Button>
            </Card>
          ))}
        </View>
      )}

      <AddAccountSheet visible={!!editing} onClose={() => setEditing(null)} account={editing ?? undefined} />
      <AddAccountSheet
        visible={!!addingSuggestion}
        onClose={() => setAddingSuggestion(null)}
        prefill={addingSuggestion ?? undefined}
      />
    </View>
  );
}
