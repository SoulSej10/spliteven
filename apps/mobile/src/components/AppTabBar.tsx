import { Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Plus } from "phosphor-react-native";
import { Text } from "@/components/ui/typography";
import { useCreateAction } from "@/context/create-action";
import { palette } from "@/theme/palette";

/** The parts of React Navigation's tab-bar props this bar uses (the package itself isn't a direct dependency). */
interface TabRoute {
  key: string;
  name: string;
  params?: object;
}
interface TabBarProps {
  state: { index: number; routes: TabRoute[] };
  descriptors: Record<
    string,
    {
      options: {
        title?: string;
        href?: string | null;
        tabBarIcon?: (props: { focused: boolean; color: string; size: number }) => React.ReactNode;
      };
    }
  >;
  navigation: {
    emit: (event: { type: "tabPress"; target: string; canPreventDefault: true }) => { defaultPrevented: boolean };
    navigate: (name: string, params?: object) => void;
  };
}

const VISIBLE_TABS = new Set(["index", "groups", "finances", "insights"]);

/**
 * The bottom bar: Home, Groups, a raised Create button in the middle, Finances, Insights.
 * The middle button runs whatever the visible page creates (see context/create-action.tsx) and is
 * dimmed and inert on pages with nothing to create, so there is never a button that does nothing
 * while looking active.
 */
export function AppTabBar({ state, descriptors, navigation }: TabBarProps) {
  const insets = useSafeAreaInsets();
  const { enabled, run } = useCreateAction();

  // Only the four real destinations; the Activity screen is reached from the bell, not the bar.
  const routes = state.routes.filter((route) => VISIBLE_TABS.has(route.name));
  const middle = Math.floor(routes.length / 2);

  function renderTab(route: (typeof routes)[number]) {
    const { options } = descriptors[route.key];
    const focused = state.routes[state.index]?.key === route.key;
    const color = focused ? palette.primary : palette.muted;
    const label = typeof options.title === "string" ? options.title : route.name;

    return (
      <Pressable
        key={route.key}
        accessibilityRole="button"
        accessibilityState={focused ? { selected: true } : {}}
        accessibilityLabel={label}
        onPress={() => {
          const event = navigation.emit({ type: "tabPress", target: route.key, canPreventDefault: true as const });
          if (!focused && !event.defaultPrevented) navigation.navigate(route.name, route.params);
        }}
        className="flex-1 items-center justify-end pb-1"
        style={{ height: 52 }}
      >
        {options.tabBarIcon?.({ focused, color, size: 24 })}
        <Text allowFontScaling={false} style={{ fontSize: 10, lineHeight: 13, marginTop: 2, color, fontFamily: "Bricolage_600SemiBold" }}>
          {label}
        </Text>
      </Pressable>
    );
  }

  return (
    <View
      className="flex-row items-end border-t border-neutral-500/15"
      style={{
        backgroundColor: palette.card,
        paddingBottom: Math.max(insets.bottom, 10),
        paddingTop: 4,
      }}
    >
      {routes.flatMap((route, index) => [
        index === middle ? (
            <View key="create" className="flex-1 items-center justify-end" style={{ height: 52 }}>
              <Pressable
                onPress={enabled ? run : undefined}
                disabled={!enabled}
                accessibilityRole="button"
                accessibilityLabel="Create"
                accessibilityState={{ disabled: !enabled }}
                className="items-center justify-center rounded-full"
                style={{
                  width: 58,
                  height: 58,
                  marginBottom: 14,
                  backgroundColor: enabled ? palette.primaryFill : palette.track,
                  borderWidth: 4,
                  borderColor: palette.card,
                  opacity: enabled ? 1 : 0.55,
                  shadowColor: "#000",
                  shadowOpacity: enabled ? 0.18 : 0,
                  shadowRadius: 8,
                  shadowOffset: { width: 0, height: 3 },
                  elevation: enabled ? 6 : 0,
                }}
              >
                <Plus size={28} weight="bold" color={enabled ? palette.onPrimary : palette.muted} />
              </Pressable>
            </View>
        ) : null,
        renderTab(route),
      ])}
    </View>
  );
}
