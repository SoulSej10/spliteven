import { Pressable, Text, View } from "react-native";
import { useColorScheme } from "nativewind";
import { Check } from "phosphor-react-native";
import {
  ACCENT_IDS,
  ACCENT_SWATCHES,
  THEME_IDS,
  THEME_TEMPLATES,
  resolveTheme,
} from "@evensplit/shared";
import { useAppTheme } from "@/theme/ThemeProvider";
import { cn } from "@/lib/cn";

/** Theme template + accent color pickers. Choices apply instantly and are remembered on this device. */
export function AppearancePicker() {
  const { colorScheme } = useColorScheme();
  const scheme = colorScheme === "dark" ? "dark" : "light";
  const { themeId, accentId, setThemeId, setAccentId } = useAppTheme();

  return (
    <View className="gap-5">
      <View className="gap-3">
        <Text className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Theme</Text>
        <View className="flex-row flex-wrap gap-3">
          {THEME_IDS.map((id) => {
            const template = THEME_TEMPLATES[id];
            const { colors } = resolveTheme(id, template.defaultAccent, scheme);
            const selected = id === themeId;
            return (
              <Pressable
                key={id}
                onPress={() => setThemeId(id)}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                className={cn(
                  "w-[47.5%] gap-2 rounded-xl border-2 p-2",
                  selected ? "border-primary" : "border-neutral-500/20"
                )}
              >
                <View
                  className="h-16 items-center justify-center p-2"
                  style={{ backgroundColor: colors.background, borderRadius: 8 * template.radiusScale }}
                >
                  <View
                    className="w-full gap-1.5 p-2"
                    style={{ backgroundColor: colors.card, borderRadius: 8 * template.radiusScale }}
                  >
                    <View
                      style={{
                        height: 6,
                        width: "60%",
                        borderRadius: 3,
                        backgroundColor: colors.mutedForeground,
                        opacity: 0.35,
                      }}
                    />
                    <View
                      style={{ height: 14, borderRadius: 5 * template.radiusScale, backgroundColor: colors.primary }}
                    />
                  </View>
                </View>
                <View>
                  <View className="flex-row items-center gap-1">
                    <Text className="text-[13px] font-semibold text-neutral-900 dark:text-neutral-100" numberOfLines={1}>
                      {template.name}
                    </Text>
                    {selected && <Check size={12} weight="bold" color={resolveTheme(id, template.defaultAccent, scheme).colors.primaryDeep} />}
                  </View>
                  <Text className="text-[11px] leading-[14px] text-neutral-500" numberOfLines={2}>
                    {template.tagline}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View className="gap-3">
        <Text className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Color</Text>
        <View className="flex-row flex-wrap gap-3">
          {ACCENT_IDS.map((id) => {
            const tones = ACCENT_SWATCHES[id][scheme];
            const selected = id === accentId;
            return (
              <Pressable
                key={id}
                onPress={() => setAccentId(id)}
                accessibilityRole="radio"
                accessibilityLabel={ACCENT_SWATCHES[id].name}
                accessibilityState={{ selected }}
                className="h-11 w-11 items-center justify-center rounded-full"
                style={{
                  backgroundColor: tones.primary,
                  borderWidth: selected ? 3 : 0,
                  borderColor: tones.deep,
                }}
              >
                {selected && <Check size={18} weight="bold" color={tones.onPrimary} />}
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
}
