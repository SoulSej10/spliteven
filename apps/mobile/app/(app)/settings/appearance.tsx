import { Switch, View } from "react-native";
import { useColorScheme } from "nativewind";
import { Text } from "@/components/ui/typography";
import { Card } from "@/components/ui/Card";
import { SettingsScreen } from "@/components/settings/SettingsScreen";
import { AppearancePicker } from "@/components/settings/AppearancePicker";
import { saveColorScheme } from "@/lib/appearance";
import { palette } from "@/theme/palette";

/** Dark mode, theme style and accent colour. */
export default function AppearanceSettingsScreen() {
  const { colorScheme, setColorScheme } = useColorScheme();

  return (
    <SettingsScreen title="Appearance">
      <Card>
        <View className="flex-row items-center justify-between">
          <Text className="text-neutral-900 dark:text-neutral-100">Dark mode</Text>
          <Switch
            value={colorScheme === "dark"}
            onValueChange={(isDark) => {
              const next = isDark ? "dark" : "light";
              setColorScheme(next);
              void saveColorScheme(next);
            }}
            trackColor={{ true: palette.primaryFill, false: palette.track }}
            thumbColor={palette.primary}
          />
        </View>
        <View className="mt-5">
          <AppearancePicker />
        </View>
      </Card>
    </SettingsScreen>
  );
}
