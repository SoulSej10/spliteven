import { useEffect, useState } from "react";
import { Alert, Pressable, View } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { profileSetupSchema, type ProfileSetupInput } from "@evensplit/shared";
import { Text } from "@/components/ui/typography";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { TextField } from "@/components/ui/TextField";
import { SettingsScreen } from "@/components/settings/SettingsScreen";
import { useAuth } from "@/hooks/use-auth";
import { CURRENCIES } from "@/lib/format";
import { uploadAvatar, upsertProfile } from "@/lib/api/profile";
import { cn } from "@/lib/cn";

/** Name, photo and default currency, edited right on the page (no second sheet to open). */
export default function ProfileSettingsScreen() {
  const { authUser, profile, refreshProfile } = useAuth();
  const [saving, setSaving] = useState(false);
  const [avatarUri, setAvatarUri] = useState<string | null>(profile?.avatar_url ?? null);

  const { handleSubmit, formState, setValue, watch, reset } = useForm<ProfileSetupInput>({
    resolver: zodResolver(profileSetupSchema),
    defaultValues: {
      display_name: profile?.display_name ?? "",
      default_currency: profile?.default_currency ?? "PHP",
    },
  });

  // Fill the form once the profile has loaded (and again if it changes elsewhere).
  useEffect(() => {
    reset({
      display_name: profile?.display_name ?? "",
      default_currency: profile?.default_currency ?? "PHP",
    });
    setAvatarUri(profile?.avatar_url ?? null);
  }, [profile, reset]);

  async function pickAvatar() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) setAvatarUri(result.assets[0].uri);
  }

  async function onSubmit(values: ProfileSetupInput) {
    if (!authUser) return;
    setSaving(true);
    try {
      let avatarUrl = profile?.avatar_url ?? null;
      if (avatarUri && avatarUri !== profile?.avatar_url) {
        avatarUrl = await uploadAvatar(authUser.id, avatarUri, "avatar.jpg");
      }
      await upsertProfile(authUser.id, { ...values, avatar_url: avatarUrl });
      await refreshProfile();
      Alert.alert("Profile saved");
    } catch (err) {
      Alert.alert("Could not update profile", err instanceof Error ? err.message : "Try again");
    } finally {
      setSaving(false);
    }
  }

  const currency = watch("default_currency");

  return (
    <SettingsScreen title="Profile & currency">
      <Card className="items-center gap-3 py-5">
        <Pressable onPress={pickAvatar} accessibilityLabel="Change photo">
          <Avatar name={watch("display_name")} uri={avatarUri} size={88} logoFallback />
        </Pressable>
        <Pressable onPress={pickAvatar}>
          <Text className="font-medium text-primary-deep">Change photo</Text>
        </Pressable>
        <Text className="text-xs text-neutral-500" numberOfLines={1}>
          {authUser?.email}
        </Text>
      </Card>

      <Card className="gap-4">
        <TextField
          label="Display name"
          onChangeText={(t) => setValue("display_name", t, { shouldValidate: formState.isSubmitted })}
          value={watch("display_name")}
          error={formState.errors.display_name?.message}
        />

        <View className="gap-1.5">
          <Text className="text-sm font-medium text-neutral-900 dark:text-neutral-100">Default currency</Text>
          <Text className="text-xs text-neutral-500">
            Totals, budgets and charts are shown in this currency. New accounts start with it too.
          </Text>
          <View className="mt-1 flex-row flex-wrap gap-2">
            {CURRENCIES.map((c) => {
              const selected = currency === c;
              return (
                <Pressable
                  key={c}
                  onPress={() => setValue("default_currency", c)}
                  className={cn(
                    "rounded-pill border px-4 py-2",
                    selected ? "border-primary bg-primary-light" : "border-neutral-500/20"
                  )}
                >
                  <Text className={cn("font-medium", selected ? "text-primary-deep" : "text-neutral-500")}>{c}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </Card>

      <Button onPress={handleSubmit(onSubmit)} loading={saving} size="lg">
        Save changes
      </Button>
    </SettingsScreen>
  );
}
