import { useEffect, useRef } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { Text } from "@/components/ui/typography";
import { useColorScheme } from "nativewind";
import { EdgeFade } from "@/components/ui/EdgeFade";
import { cn } from "@/lib/cn";
import { palette } from "@/theme/palette";

/** Horizontally scrollable pill tab row — used where SegmentedControl's fixed-width
 *  equal-flex layout would be too cramped (more than ~3 options). */
export function PillTabs<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { label: string; value: T; icon?: React.ComponentType<{ color: string; size: number }> }[];
  value: T;
  onChange: (value: T) => void;
}) {
  // Background color is applied via inline style, not a toggling className,
  // because a conditionally-applied className (especially a slash-opacity
  // one like `dark:bg-on-primary/5`) on a Pressable is a documented
  // nativewind/react-native-css-interop + expo-router race condition
  // (nativewind/nativewind#1536, #1557, #1711) that intermittently throws
  // "Couldn't find a navigation context" on press.
  const { colorScheme } = useColorScheme();
  const inactiveBg = colorScheme === "dark" ? "rgba(255,255,255,0.05)" : palette.card;

  // The ScrollView otherwise always starts at offset 0, so if `value` is set
  // from outside (e.g. Settings' "Manage" shortcuts jumping straight to a
  // sub-tab) and that tab isn't one of the first few, the active tab renders
  // off-screen with no visible selection at all. Track each pill's x offset
  // and scroll it into view whenever the active value changes.
  const scrollRef = useRef<ScrollView>(null);
  const offsets = useRef<Partial<Record<T, number>>>({});

  useEffect(() => {
    const x = offsets.current[value];
    if (x !== undefined) scrollRef.current?.scrollTo({ x: Math.max(x - 20, 0), animated: true });
  }, [value]);

  return (
    <View style={{ position: "relative" }}>
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerClassName="items-center gap-1.5 px-5 pb-3"
      >
        {options.map((opt) => {
          const active = opt.value === value;
          return (
            <Pressable
              key={opt.value}
              onPress={() => onChange(opt.value)}
              onLayout={(e) => {
                offsets.current[opt.value] = e.nativeEvent.layout.x;
              }}
              className="flex-row items-center gap-1 rounded-lg px-3 py-1.5"
              style={{ backgroundColor: active ? palette.primaryFill : inactiveBg }}
            >
              {opt.icon && <opt.icon color={active ? palette.onPrimary : palette.muted} size={12} />}
              <Text className={cn("text-xs font-semibold", active ? "text-on-primary" : "text-neutral-500")}>
                {opt.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
      {/* Once there are enough tabs to overflow the screen, the row runs off
          both edges with no scroll indicator - this fades the cut-off tab
          on either side into the background instead of leaving a hard,
          broken-looking clip, so it reads as "more to scroll to" rather
          than a bug. */}
      <EdgeFade edge="left" size={24} />
      <EdgeFade edge="right" size={36} />
    </View>
  );
}
