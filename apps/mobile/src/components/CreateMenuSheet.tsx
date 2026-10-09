import type { ComponentType } from "react";
import { Pressable, View } from "react-native";
import { ArrowDownLeft, ArrowsLeftRight, ArrowUpRight, Plus, UserPlus } from "phosphor-react-native";
import { Text } from "@/components/ui/typography";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { palette } from "@/theme/palette";

export type CreateChoice = "expense" | "income" | "transfer" | "group" | "join";

const OPTIONS: { value: CreateChoice; label: string; hint: string; icon: ComponentType<{ size?: number; color?: string }>; color: string }[] = [
  { value: "expense", label: "Expense", hint: "Money you spent", icon: ArrowUpRight, color: palette.negative },
  { value: "income", label: "Income", hint: "Money you received", icon: ArrowDownLeft, color: palette.positive },
  { value: "transfer", label: "Transfer", hint: "Move money between your accounts", icon: ArrowsLeftRight, color: palette.muted },
  { value: "group", label: "New group", hint: "Start a shared ledger", icon: Plus, color: palette.primary },
  { value: "join", label: "Join group", hint: "Use an invite code", icon: UserPlus, color: palette.primary },
];

/** What the middle button offers on Home: one place to add anything, instead of rows of shortcuts on the page. */
export function CreateMenuSheet({
  visible,
  onClose,
  onPick,
}: {
  visible: boolean;
  onClose: () => void;
  onPick: (choice: CreateChoice) => void;
}) {
  return (
    <BottomSheet visible={visible} onClose={onClose} title="Create">
      <View className="gap-1">
        {OPTIONS.map((o) => (
          <Pressable
            key={o.value}
            onPress={() => onPick(o.value)}
            className="flex-row items-center gap-3 rounded-card px-2 py-3 active:bg-neutral-500/10"
            accessibilityRole="button"
          >
            <View className="h-11 w-11 items-center justify-center rounded-full bg-neutral-500/10">
              <o.icon size={20} color={o.color} />
            </View>
            <View className="flex-1">
              <Text className="font-semibold text-neutral-900 dark:text-neutral-100">{o.label}</Text>
              <Text className="text-xs text-neutral-500">{o.hint}</Text>
            </View>
          </Pressable>
        ))}
      </View>
    </BottomSheet>
  );
}
