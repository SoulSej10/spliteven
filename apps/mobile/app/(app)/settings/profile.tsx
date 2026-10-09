import { useState } from "react";
import { Alert, Pressable, View } from "react-native";
import { CaretRight as ChevronRight } from "phosphor-react-native";
import { Text } from "@/components/ui/typography";
import { Avatar } from "@/components/ui/Avatar";
import { Card } from "@/components/ui/Card";
import { SettingsScreen } from "@/components/settings/SettingsScreen";
import { EditProfileSheet } from "@/components/settings/EditProfileSheet";
import { useAuth } from "@/hooks/use-auth";
import { CURRENCIES } from "@/lib/format";
import { upsertProfile } from "@/lib/api/profile";
import { cn } from "@/lib/cn";
import { palette } from "@/theme/palette";

/** Name, photo and default currency. */
export default function ProfileSettingsScreen() {
  const { authUser, profile, refreshProfile } = useAuth();
  const [saving, setSaving] = useState(false);
  const [editVisible, setEditVisible] = useState(false);

  async function onChangeCurrency(currency: string) {
    if (!authUser || !profile || currency === profile.default_currency) return;
    setSaving(true);
    try {
      await upsertProfile(authUser.id, { display_name: profile.display_name, default_currency: currency });
      await refreshProfile();
    } catch (err) {
      Alert.alert("Could not update currency", err instanceof Error ? err.message : "Try again");
    } finally {
      setSaving(false);
    }
  }

  return (
    <SettingsScreen title="Profile & currency">
      <Pressable onPress={() => setEditVisible(true)}>
        <Card className="flex-row items-center gap-4">
          <Avatar name={profile?.display_name} uri={profile?.avatar_url} size={52} logoFallback />
          <View className="flex-1">
            <Text className="text-base font-semibold text-neutral-900 dark:text-neutral-100" numberOfLines={1}>
              {profile?.display_name ?? "—"}
            </Text>
            <Text className="text-xs text-neutral-500" numberOfLines={1}>
              {authUser?.email}
            </Text>
          </View>
          <ChevronRight color={palette.muted} size={20} />
        </Card>
      </Pressable>

      <Card>
        <Text className="mb-1 font-semibold text-neutral-900 dark:text-neutral-100">Default currency</Text>
        <Text className="mb-3 text-xs text-neutral-500">
          Totals, budgets and charts are shown in this currency. New accounts start with it too.
        </Text>
        <View className="flex-row flex-wrap gap-2">
          {CURRENCIES.map((c) => (
            <Pressable
              key={c}
              disabled={saving}
              onPress={() => onChangeCurrency(c)}
              className={cn(
                "rounded-pill border px-3 py-1.5",
                c === profile?.default_currency ? "border-primary bg-primary-light" : "border-neutral-500/20"
              )}
            >
              <Text
                className={cn(
                  "text-xs font-medium",
                  c === profile?.default_currency ? "text-primary-deep" : "text-neutral-500"
                )}
              >
                {c}
              </Text>
            </Pressable>
          ))}
        </View>
      </Card>

      <EditProfileSheet visible={editVisible} onClose={() => setEditVisible(false)} />
    </SettingsScreen>
  );
}
