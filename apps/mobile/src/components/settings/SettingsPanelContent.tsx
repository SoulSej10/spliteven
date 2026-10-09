import { useEffect, useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, Switch, View } from "react-native";
import { Text } from "@/components/ui/typography";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useColorScheme } from "nativewind";
import * as DocumentPicker from "expo-document-picker";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import { ArrowsLeftRight, CaretRight as ChevronRight, Crown, Download, Key as KeyRound, ListChecks, SignOut as LogOut, PiggyBank, ShieldCheck, Tag, Trash as Trash2, Upload, Wallet, X } from "phosphor-react-native";
import { PLANS_ENABLED, SUBSCRIPTION_ADMIN_EMAIL, SUBSCRIPTION_PLANS, type AppUpdateInfo } from "@evensplit/shared";
import { CURRENCIES } from "@/lib/format";
import { Avatar } from "@/components/ui/Avatar";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import { cn } from "@/lib/cn";
import { useAuth } from "@/hooks/use-auth";
import { getSupabaseClient } from "@/lib/supabase/client";
import { isPasswordPwned } from "@/lib/pwned-password";
import { ensureNotificationPermission, registerForPushTokenAsync, savePushToken } from "@/lib/notifications";
import { hasShownNotificationNudge, setNotificationNudgeShown } from "@/lib/device-flags";
import { upsertProfile } from "@/lib/api/profile";
import { saveColorScheme } from "@/lib/appearance";
import { EditProfileSheet } from "./EditProfileSheet";
import { UpdateDialog } from "@/components/UpdatePrompt";
import { fetchAvailableUpdate, installedVersion } from "@/lib/app-update";
import { AppearancePicker } from "./AppearancePicker";
import { BiometricToggle } from "./BiometricToggle";
import { setBiometricEnabled } from "@/lib/biometrics";
import {
  usePersonalAccounts,
  usePersonalCategories,
  usePersonalTransactions,
} from "@/hooks/use-personal";
import { importPersonalLedgerRows } from "@/lib/api/personal";
import {
  buildPersonalLedgerCsv,
  exportAndShareCsv,
  parsePersonalLedgerCsv,
  readCsvFile,
  summarizePersonalImport,
} from "@/lib/csv";
import { useQueryClient } from "@tanstack/react-query";
import { palette } from "@/theme/palette";

function goToFinancesTab(tab: string, onClose: () => void) {
  onClose();
  router.navigate({ pathname: "/(app)/(tabs)/finances", params: { tab } });
}

export function SettingsPanelContent({ onClose }: { onClose: () => void }) {
  const { authUser, profile, signOut, refreshProfile } = useAuth();
  const { colorScheme, setColorScheme } = useColorScheme();
  const insets = useSafeAreaInsets();
  const [notifExpenses, setNotifExpenses] = useState(true);
  const [notifSettlements, setNotifSettlements] = useState(true);
  const [savingCurrency, setSavingCurrency] = useState(false);
  const [checkingUpdate, setCheckingUpdate] = useState(false);
  const [pendingUpdate, setPendingUpdate] = useState<AppUpdateInfo | null>(null);

  async function onCheckForUpdates() {
    setCheckingUpdate(true);
    try {
      const info = await fetchAvailableUpdate();
      if (info) setPendingUpdate(info);
      else Alert.alert("You are up to date", `SplitEven ${installedVersion()} is the latest version.`);
    } catch {
      Alert.alert("Could not check for updates", "Check your internet connection and try again.");
    } finally {
      setCheckingUpdate(false);
    }
  }
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [editProfileVisible, setEditProfileVisible] = useState(false);

  const { data: transactions } = usePersonalTransactions();
  const { data: accounts } = usePersonalAccounts();
  const { data: categories } = usePersonalCategories();
  const queryClient = useQueryClient();

  // A one-time, friendly nudge instead of silently firing the raw OS
  // permission dialog on every Settings visit - only shown once ever
  // (persisted per-device), and only when notifications genuinely haven't
  // been decided on yet (not if the user already granted or denied them).
  useEffect(() => {
    (async () => {
      if (await hasShownNotificationNudge()) return;
      const { status } = await Notifications.getPermissionsAsync();
      await setNotificationNudgeShown();
      if (status !== "undetermined") return;

      Alert.alert("Enable notifications?", "Get notified on this device when you add an expense or settle up.", [
        { text: "Not now", style: "cancel" },
        {
          text: "Enable",
          onPress: async () => {
            const granted = await ensureNotificationPermission();
            if (!granted) return;
            const token = await registerForPushTokenAsync();
            if (token && authUser) await savePushToken(authUser.id, token);
          },
        },
      ]);
    })();
  }, []);

  async function onChangeCurrency(currency: string) {
    if (!authUser || !profile || currency === profile.default_currency) return;
    setSavingCurrency(true);
    try {
      await upsertProfile(authUser.id, { display_name: profile.display_name, default_currency: currency });
      await refreshProfile();
    } catch (err) {
      Alert.alert("Could not update currency", err instanceof Error ? err.message : "Try again");
    } finally {
      setSavingCurrency(false);
    }
  }

  async function onSubmitPassword() {
    if (newPassword.length < 8) {
      Alert.alert("Password too short", "Use at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert("Passwords don't match", "Re-enter your new password.");
      return;
    }
    setChangingPassword(true);
    try {
      try {
        const { pwned, count } = await isPasswordPwned(newPassword);
        if (pwned) {
          Alert.alert(
            "Choose a different password",
            `This password has appeared in ${count.toLocaleString()} data breach${count === 1 ? "" : "es"}. Please choose a different one.`
          );
          return;
        }
      } catch {
        // Best-effort check - never block a password change if HaveIBeenPwned is unreachable.
      }

      const supabase = getSupabaseClient();
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      setNewPassword("");
      setConfirmPassword("");
      setShowPasswordForm(false);
      Alert.alert("Password updated");
    } catch (err) {
      Alert.alert("Could not update password", err instanceof Error ? err.message : "Try again");
    } finally {
      setChangingPassword(false);
    }
  }

  async function onExport() {
    if (!transactions || transactions.length === 0) {
      Alert.alert("Nothing to export", "Log a few transactions first.");
      return;
    }
    setExporting(true);
    try {
      const csv = buildPersonalLedgerCsv(transactions, accounts ?? [], categories ?? []);
      const shared = await exportAndShareCsv(`evensplit-personal-${Date.now()}.csv`, csv);
      if (!shared) Alert.alert("Sharing isn't available", "Couldn't open the share sheet on this device.");
    } catch (err) {
      Alert.alert("Export failed", err instanceof Error ? err.message : "Try again");
    } finally {
      setExporting(false);
    }
  }

  async function onImport() {
    if (!authUser) return;
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: "text/csv" });
      if (result.canceled || !result.assets?.[0]) return;
      setImporting(true);
      const csvText = await readCsvFile(result.assets[0].uri);
      const { rows, errors } = parsePersonalLedgerCsv(csvText);
      if (rows.length === 0) {
        Alert.alert("No rows found", errors[0] ?? "Couldn't read any valid rows from that file.");
        return;
      }
      const summary = summarizePersonalImport(rows, accounts ?? [], categories ?? []);
      const details = [
        `${summary.rowCount} transaction${summary.rowCount === 1 ? "" : "s"} found.`,
        summary.newAccounts.length > 0 ? `New accounts: ${summary.newAccounts.join(", ")}` : null,
        summary.newCategories.length > 0 ? `New categories: ${summary.newCategories.join(", ")}` : null,
        errors.length > 0 ? `${errors.length} row(s) will be skipped.` : null,
      ]
        .filter(Boolean)
        .join("\n");

      Alert.alert("Import this file?", details, [
        { text: "Cancel", style: "cancel" },
        {
          text: "Import",
          onPress: async () => {
            try {
              const { imported } = await importPersonalLedgerRows(
                authUser.id,
                rows,
                accounts ?? [],
                categories ?? [],
                profile?.default_currency ?? "PHP"
              );
              await queryClient.invalidateQueries({ queryKey: ["personal-transactions", authUser.id] });
              await queryClient.invalidateQueries({ queryKey: ["personal-accounts", authUser.id] });
              await queryClient.invalidateQueries({ queryKey: ["personal-categories", authUser.id] });
              Alert.alert("Import complete", `${imported} transaction${imported === 1 ? "" : "s"} added.`);
            } catch (err) {
              Alert.alert("Import failed", err instanceof Error ? err.message : "Try again");
            }
          },
        },
      ]);
    } catch (err) {
      Alert.alert("Could not read file", err instanceof Error ? err.message : "Try again");
    } finally {
      setImporting(false);
    }
  }

  async function onSignOut() {
    onClose();
    // A different person may sign in next on this phone: biometric unlock is switched off until they turn it on.
    await setBiometricEnabled(false);
    await signOut();
    router.replace("/(auth)/login");
  }

  function onDeleteAccount() {
    Alert.alert(
      "Delete your account?",
      "This removes your profile and group memberships. This can't be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            if (!authUser) return;
            try {
              const supabase = getSupabaseClient();
              const { error } = await supabase.functions.invoke("delete-account");
              if (error) throw error;
              onClose();
              await signOut();
              router.replace("/(auth)/login");
            } catch (err) {
              Alert.alert("Could not delete account", err instanceof Error ? err.message : "Try again");
            }
          },
        },
      ]
    );
  }

  return (
    <KeyboardAvoidingView
      className="flex-1"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View className="flex-row items-center justify-between px-5 pb-2 pt-3">
        <Text className="text-xl font-bold text-neutral-900 dark:text-neutral-100">Settings</Text>
        <Pressable
          onPress={onClose}
          hitSlop={12}
          className="h-8 w-8 items-center justify-center rounded-full bg-neutral-100 dark:bg-on-primary/10"
          accessibilityLabel="Close settings"
        >
          <X size={16} color={palette.muted} />
        </Pressable>
      </View>

      <ScrollView
        contentContainerClassName="gap-4 px-5"
        contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
        showsVerticalScrollIndicator={false}
      >
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
          <Pressable onPress={() => setEditProfileVisible(true)}>
            <ChevronRight color={palette.muted} size={20} />
          </Pressable>
        </Card>

        {!PLANS_ENABLED ? null : profile?.subscription_tier === "free" || !profile?.subscription_tier ? (
          <Pressable
            onPress={() => {
              onClose();
              router.push("/(app)/upgrade");
            }}
          >
            <Card className="flex-row items-center gap-3 border-2 border-accent bg-accent/10">
              <View className="h-10 w-10 items-center justify-center rounded-full bg-accent/20">
                <Crown size={20} color={palette.highlight} weight="fill" />
              </View>
              <View className="flex-1">
                <Text className="font-semibold text-neutral-900 dark:text-neutral-100">Upgrade to Pro</Text>
                <Text className="text-xs text-neutral-500">
                  Unlimited groups, insights, and more from {SUBSCRIPTION_PLANS.pro.priceLabel}
                </Text>
              </View>
              <ChevronRight color={palette.highlight} size={18} />
            </Card>
          </Pressable>
        ) : (
          <Pressable
            onPress={() => {
              onClose();
              router.push("/(app)/upgrade");
            }}
          >
            <Card className="flex-row items-center gap-3">
              <View className="h-10 w-10 items-center justify-center rounded-full bg-accent/20">
                <Crown size={20} color={palette.highlight} weight="fill" />
              </View>
              <View className="flex-1">
                <Text className="font-semibold text-neutral-900 dark:text-neutral-100">
                  {SUBSCRIPTION_PLANS[profile.subscription_tier].name} plan
                </Text>
                <Text className="text-xs text-neutral-500">Manage your subscription</Text>
              </View>
              <ChevronRight color={palette.muted} size={18} />
            </Card>
          </Pressable>
        )}

        {authUser?.email === SUBSCRIPTION_ADMIN_EMAIL ? (
          <Pressable onPress={() => { onClose(); router.push("/(app)/admin-subscriptions"); }}>
            <Card className="flex-row items-center justify-between">
              <Text className="font-semibold text-neutral-900 dark:text-neutral-100">Subscription requests</Text>
              <ChevronRight color={palette.muted} size={18} />
            </Card>
          </Pressable>
        ) : null}

        <Card>
          <Text className="mb-3 font-semibold text-neutral-900 dark:text-neutral-100">Default currency</Text>
          <View className="flex-row flex-wrap gap-2">
            {CURRENCIES.map((c) => (
              <Pressable
                key={c}
                disabled={savingCurrency}
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

        <Card className="gap-3">
          <Pressable
            onPress={() => {
              onClose();
              router.push("/(app)/currency-rates");
            }}
            className="flex-row items-center justify-between py-1"
            accessibilityRole="button"
          >
            <View className="flex-1 pr-3">
              <View className="flex-row items-center gap-2.5">
                <ArrowsLeftRight size={17} color={palette.primary} />
                <Text className="text-neutral-900 dark:text-neutral-100">Currency rates</Text>
              </View>
              <Text className="mt-0.5 text-xs text-neutral-500">
                Convert accounts in other currencies into {profile?.default_currency ?? "your default currency"}.
              </Text>
            </View>
            <ChevronRight color={palette.muted} size={17} />
          </Pressable>
        </Card>

        <Card>
          <Text className="mb-3 font-semibold text-neutral-900 dark:text-neutral-100">Manage</Text>
          <View className="gap-1">
            <Pressable
              onPress={() => goToFinancesTab("accounts", onClose)}
              className="flex-row items-center justify-between py-2"
            >
              <View className="flex-row items-center gap-2.5">
                <Wallet size={17} color={palette.primary} />
                <Text className="text-neutral-900 dark:text-neutral-100">Accounts</Text>
              </View>
              <ChevronRight color={palette.muted} size={17} />
            </Pressable>
            <Pressable
              onPress={() => goToFinancesTab("categories", onClose)}
              className="flex-row items-center justify-between py-2"
            >
              <View className="flex-row items-center gap-2.5">
                <Tag size={17} color={palette.primary} />
                <Text className="text-neutral-900 dark:text-neutral-100">Categories</Text>
              </View>
              <ChevronRight color={palette.muted} size={17} />
            </Pressable>
            <Pressable
              onPress={() => goToFinancesTab("budgets", onClose)}
              className="flex-row items-center justify-between py-2"
            >
              <View className="flex-row items-center gap-2.5">
                <PiggyBank size={17} color={palette.primary} />
                <Text className="text-neutral-900 dark:text-neutral-100">Budgets</Text>
              </View>
              <ChevronRight color={palette.muted} size={17} />
            </Pressable>
            <Pressable
              onPress={() => goToFinancesTab("records", onClose)}
              className="flex-row items-center justify-between py-2"
            >
              <View className="flex-row items-center gap-2.5">
                <ListChecks size={17} color={palette.primary} />
                <Text className="text-neutral-900 dark:text-neutral-100">Transactions</Text>
              </View>
              <ChevronRight color={palette.muted} size={17} />
            </Pressable>
          </View>
        </Card>

        <Card>
          <Text className="mb-3 font-semibold text-neutral-900 dark:text-neutral-100">Security</Text>
          <Pressable
            onPress={() => setShowPasswordForm((v) => !v)}
            className="flex-row items-center justify-between py-1"
          >
            <View className="flex-row items-center gap-2.5">
              <KeyRound size={17} color={palette.primary} />
              <Text className="text-neutral-900 dark:text-neutral-100">Change password</Text>
            </View>
            <ChevronRight color={palette.muted} size={17} />
          </Pressable>
          {showPasswordForm && (
            <View className="mt-3 gap-2.5">
              <TextField
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="New password"
                secureTextEntry
                autoCapitalize="none"
              />
              <TextField
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Confirm new password"
                secureTextEntry
                autoCapitalize="none"
              />
              <Button onPress={onSubmitPassword} loading={changingPassword}>
                <Text className="font-semibold text-on-primary">Update password</Text>
              </Button>
            </View>
          )}
        </Card>

        <Card>
          <Text className="mb-3 font-semibold text-neutral-900 dark:text-neutral-100">Data</Text>
          <Pressable onPress={onExport} disabled={exporting} className="flex-row items-center justify-between py-2">
            <View className="flex-row items-center gap-2.5">
              <Download size={17} color={palette.primary} />
              <Text className="text-neutral-900 dark:text-neutral-100">Export data (CSV)</Text>
            </View>
            <ChevronRight color={palette.muted} size={17} />
          </Pressable>
          <Pressable onPress={onImport} disabled={importing} className="flex-row items-center justify-between py-2">
            <View className="flex-row items-center gap-2.5">
              <Upload size={17} color={palette.primary} />
              <Text className="text-neutral-900 dark:text-neutral-100">Import data (CSV)</Text>
            </View>
            <ChevronRight color={palette.muted} size={17} />
          </Pressable>
        </Card>

        <BiometricToggle />

        <Card>
          <Text className="mb-3 font-semibold text-neutral-900 dark:text-neutral-100">Appearance</Text>
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

        <Card>
          <Text className="mb-3 font-semibold text-neutral-900 dark:text-neutral-100">Notifications</Text>
          <Text className="mb-3 text-xs text-neutral-500">
            You'll get a notification on this device when someone in your groups adds an expense or settles up.
          </Text>
          <View className="gap-3">
            <View className="flex-row items-center justify-between">
              <Text className="text-neutral-900 dark:text-neutral-100">New expenses</Text>
              <Switch
                value={notifExpenses}
                onValueChange={setNotifExpenses}
                trackColor={{ true: palette.primaryFill, false: palette.track }}
              thumbColor={palette.primary}
              />
            </View>
            <View className="flex-row items-center justify-between">
              <Text className="text-neutral-900 dark:text-neutral-100">Settlements</Text>
              <Switch
                value={notifSettlements}
                onValueChange={setNotifSettlements}
                trackColor={{ true: palette.primaryFill, false: palette.track }}
              thumbColor={palette.primary}
              />
            </View>
          </View>
        </Card>

        <Card className="gap-3">
          <Pressable
            onPress={() => {
              onClose();
              router.push("/(app)/privacy-policy");
            }}
            className="flex-row items-center justify-between py-1"
          >
            <View className="flex-row items-center gap-2.5">
              <ShieldCheck size={17} color={palette.primary} />
              <Text className="text-neutral-900 dark:text-neutral-100">Privacy policy</Text>
            </View>
            <ChevronRight color={palette.muted} size={17} />
          </Pressable>
          <Pressable
            onPress={() => {
              onClose();
              router.push("/(app)/terms-of-service");
            }}
            className="flex-row items-center justify-between py-1"
          >
            <View className="flex-row items-center gap-2.5">
              <ShieldCheck size={17} color={palette.primary} />
              <Text className="text-neutral-900 dark:text-neutral-100">Terms of service</Text>
            </View>
            <ChevronRight color={palette.muted} size={17} />
          </Pressable>
        </Card>

        <Card className="items-center gap-1 py-5">
          <Text className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
            {Constants.expoConfig?.name ?? "SplitEven"}
          </Text>
          <Text className="text-xs text-neutral-500">Version {installedVersion()}</Text>
          <Button variant="outline" size="sm" className="mt-2" loading={checkingUpdate} onPress={onCheckForUpdates}>
            Check for updates
          </Button>
          <Text className="mt-2 text-xs text-neutral-500">Developed solo by Jess Anthony Tahil</Text>
          <Text className="text-xs text-neutral-500">A Peniko product</Text>
        </Card>

        <View className="flex-row gap-3">
          <Button variant="outline" size="sm" className="flex-1" onPress={onSignOut}>
            <View className="flex-row items-center gap-1.5">
              <LogOut size={13} color={palette.ink} />
              <Text className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">Sign out</Text>
            </View>
          </Button>

          <Button variant="outline" size="sm" className="flex-1 border-negative/40" onPress={onDeleteAccount}>
            <View className="flex-row items-center gap-1.5">
              <Trash2 size={13} color={palette.negative} />
              <Text className="text-xs font-semibold text-negative">Delete account</Text>
            </View>
          </Button>
        </View>
      </ScrollView>

      <EditProfileSheet visible={editProfileVisible} onClose={() => setEditProfileVisible(false)} />
      {pendingUpdate && <UpdateDialog info={pendingUpdate} visible onLater={() => setPendingUpdate(null)} />}
    </KeyboardAvoidingView>
  );
}
