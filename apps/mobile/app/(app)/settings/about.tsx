import { useState } from "react";
import { Alert, Pressable, View } from "react-native";
import { router } from "expo-router";
import Constants from "expo-constants";
import { CaretRight as ChevronRight, ShieldCheck } from "phosphor-react-native";
import type { AppUpdateInfo } from "@evensplit/shared";
import { Text } from "@/components/ui/typography";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { SettingsScreen } from "@/components/settings/SettingsScreen";
import { UpdateDialog } from "@/components/UpdatePrompt";
import { fetchAvailableUpdate, installedVersion } from "@/lib/app-update";
import { palette } from "@/theme/palette";

/** Version, updates, privacy policy and terms. */
export default function AboutSettingsScreen() {
  const [checking, setChecking] = useState(false);
  const [pendingUpdate, setPendingUpdate] = useState<AppUpdateInfo | null>(null);

  async function onCheckForUpdates() {
    setChecking(true);
    try {
      const info = await fetchAvailableUpdate();
      if (info) setPendingUpdate(info);
      else Alert.alert("You are up to date", `SplitEven ${installedVersion()} is the latest version.`);
    } catch {
      Alert.alert("Could not check for updates", "Check your internet connection and try again.");
    } finally {
      setChecking(false);
    }
  }

  return (
    <SettingsScreen title="About & legal">
      <Card className="items-center gap-1 py-5">
        <Text className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
          {Constants.expoConfig?.name ?? "SplitEven"}
        </Text>
        <Text className="text-xs text-neutral-500">Version {installedVersion()}</Text>
        <Button variant="outline" size="sm" className="mt-2" loading={checking} onPress={onCheckForUpdates}>
          Check for updates
        </Button>
        <Text className="mt-2 text-xs text-neutral-500">Developed solo by Jess Anthony Tahil</Text>
        <Text className="text-xs text-neutral-500">A Peniko product</Text>
      </Card>

      <Card className="gap-3">
        <Pressable
          onPress={() => router.push("/(app)/privacy-policy")}
          className="flex-row items-center justify-between py-1"
        >
          <View className="flex-row items-center gap-2.5">
            <ShieldCheck size={17} color={palette.primary} />
            <Text className="text-neutral-900 dark:text-neutral-100">Privacy policy</Text>
          </View>
          <ChevronRight color={palette.muted} size={17} />
        </Pressable>
        <Pressable
          onPress={() => router.push("/(app)/terms-of-service")}
          className="flex-row items-center justify-between py-1"
        >
          <View className="flex-row items-center gap-2.5">
            <ShieldCheck size={17} color={palette.primary} />
            <Text className="text-neutral-900 dark:text-neutral-100">Terms of service</Text>
          </View>
          <ChevronRight color={palette.muted} size={17} />
        </Pressable>
      </Card>

      {pendingUpdate && <UpdateDialog info={pendingUpdate} visible onLater={() => setPendingUpdate(null)} />}
    </SettingsScreen>
  );
}
