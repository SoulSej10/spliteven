import { Pressable, ScrollView, View } from "react-native";
import { Text } from "@/components/ui/typography";
import { iconSectionsFor } from "@evensplit/shared";
import { AppIcon } from "@/components/ui/AppIcon";
import { cn } from "@/lib/cn";

/**
 * Icon grid for group, account and category creation screens: every icon in the catalog,
 * grouped by what people spend on (phone & internet, electronics, baby & kids...), with the
 * sections that suit this screen first. Scrolls inside its own box so the sheet stays short.
 */
export function IconPicker({
  kind,
  value,
  onChange,
}: {
  kind: "group" | "account" | "category";
  value: string;
  onChange: (emoji: string) => void;
}) {
  const sections = iconSectionsFor(kind);

  return (
    <View className="max-h-64 overflow-hidden rounded-card border border-neutral-500/15">
      <ScrollView nestedScrollEnabled showsVerticalScrollIndicator contentContainerClassName="gap-3 p-3">
        {sections.map((section) => (
          <View key={section.id} className="gap-1.5">
            <Text className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">{section.label}</Text>
            <View className="flex-row flex-wrap gap-2">
              {section.items.map(([emoji, , label]) => (
                <Pressable
                  key={emoji}
                  onPress={() => onChange(emoji)}
                  accessibilityLabel={label}
                  className={cn(
                    "h-11 w-11 items-center justify-center rounded-card",
                    value === emoji ? "bg-primary-light" : "bg-neutral-100 dark:bg-white/5"
                  )}
                >
                  <AppIcon value={emoji} size={22} />
                </Pressable>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
