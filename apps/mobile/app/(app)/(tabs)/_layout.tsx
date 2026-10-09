import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Tabs } from "expo-router";
import { useAppTheme } from "@/theme/ThemeProvider";
import { ChartBar as BarChart3, House as Home, Users, Wallet } from "phosphor-react-native";
import { SettingsDrawerProvider } from "@/context/settings-drawer";
import { SettingsDrawer } from "@/components/settings/SettingsDrawer";
import { AppTabBar } from "@/components/AppTabBar";
import { CreateActionProvider } from "@/context/create-action";
import { useReminderSync } from "@/hooks/use-reminder-sync";
import { palette } from "@/theme/palette";

/**
 * A standard fixed, full-width bottom tab bar — not floating with side
 * margins/rounded corners, per direct feedback ("fixed position, no edges
 * on it whatsoever"). Not `position: absolute`, so React Navigation
 * reserves its actual height (including the safe-area inset) as part of
 * screen layout automatically, which also fixes the previous floating
 * version not adapting cleanly to 3-button vs gesture navigation.
 *
 * Four primary destinations, matching the four jobs users actually do here:
 * Home ("how am I doing"), Groups ("shared money"), Finances ("my money"),
 * Insights ("what can I learn"). Settings is reached only via a slide-in
 * panel opened from the avatar in each screen's header - not a route, so
 * one SettingsDrawerProvider mounted here lets every screen open the same
 * panel without owning its own open state.
 */
export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const { version } = useAppTheme();
  useReminderSync();

  return (
    <SettingsDrawerProvider>
      <CreateActionProvider>
      <Tabs
        key={version}
        tabBar={(props) => <AppTabBar {...props} />}
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: palette.primary,
          tabBarInactiveTintColor: palette.muted,
          tabBarShowLabel: true,
          tabBarAllowFontScaling: false,
          tabBarLabelStyle: { fontSize: 10, lineHeight: 13, marginTop: 1, fontFamily: "Bricolage_600SemiBold" },
          tabBarStyle: {
            // Some phones report no bottom inset, which left the labels hard against the screen edge:
            // keep a minimum gap and size the bar from it so nothing is clipped.
            height: 48 + Math.max(insets.bottom, 12),
            paddingTop: 6,
            paddingBottom: Math.max(insets.bottom, 12),
            backgroundColor: palette.card,
            borderTopWidth: 1,
            borderTopColor: palette.border,
            elevation: 0,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Home",
            tabBarIcon: ({ color, size }) => <Home color={String(color)} size={size} />,
          }}
        />
        <Tabs.Screen
          name="groups"
          options={{
            title: "Groups",
            tabBarIcon: ({ color, size }) => <Users color={String(color)} size={size} />,
          }}
        />
        <Tabs.Screen
          name="finances"
          options={{
            title: "Finances",
            tabBarIcon: ({ color, size }) => <Wallet color={String(color)} size={size} />,
          }}
        />
        <Tabs.Screen
          name="insights"
          options={{
            title: "Insights",
            tabBarIcon: ({ color, size }) => <BarChart3 color={String(color)} size={size} />,
          }}
        />
        <Tabs.Screen name="activity" options={{ href: null }} />
      </Tabs>
      </CreateActionProvider>
      <SettingsDrawer />
    </SettingsDrawerProvider>
  );
}
