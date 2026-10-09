import type { ComponentType, ReactNode } from "react";
import { Alert, Pressable, ScrollView, View } from "react-native";
import { Text } from "@/components/ui/typography";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import {
  ArrowsLeftRight,
  Bell,
  CaretRight as ChevronRight,
  Crown,
  FileCsv,
  Info,
  Key as KeyRound,
  ListChecks,
  Palette,
  PiggyBank,
  SignOut as LogOut,
  Tag,
  Trash as Trash2,
  Wallet,
  X,
} from "phosphor-react-native";
import { PLANS_ENABLED, SUBSCRIPTION_ADMIN_EMAIL, SUBSCRIPTION_PLANS } from "@evensplit/shared";
import { Avatar } from "@/components/ui/Avatar";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/hooks/use-auth";
import { getSupabaseClient } from "@/lib/supabase/client";
import { setBiometricEnabled } from "@/lib/biometrics";
import { palette } from "@/theme/palette";

type MenuIcon = ComponentType<{ size?: number; color?: string }>;

interface MenuItem {
  label: string;
  hint?: string;
  icon: MenuIcon;
  onPress: () => void;
}

/** A titled set of buttons, each one opening its own page. */
function MenuSet({ title, items }: { title: string; items: MenuItem[] }) {
  return (
    <View className="gap-2">
      <Text className="px-1 text-[11px] font-semibold uppercase tracking-wider text-neutral-500">{title}</Text>
      <Card className="gap-0.5 py-1.5">
        {items.map((item) => (
          <Pressable
            key={item.label}
            onPress={item.onPress}
            className="flex-row items-center gap-3 rounded-lg py-2.5 active:opacity-70"
            accessibilityRole="button"
          >
            <View className="h-9 w-9 items-center justify-center rounded-full bg-primary-light">
              <item.icon size={17} color={palette.primary} />
            </View>
            <View className="flex-1">
              <Text className="font-medium text-neutral-900 dark:text-neutral-100">{item.label}</Text>
              {item.hint ? (
                <Text className="text-xs text-neutral-500" numberOfLines={1}>
                  {item.hint}
                </Text>
              ) : null}
            </View>
            <ChevronRight color={palette.muted} size={17} />
          </Pressable>
        ))}
      </Card>
    </View>
  );
}

function BannerCard({ children }: { children: ReactNode }) {
  return <Card className="flex-row items-center gap-3">{children}</Card>;
}

/**
 * The Settings menu: a short list of buttons grouped by what they do, instead of one long scroll.
 * Each button opens its own page under /(app)/settings (or an existing screen). It is deliberately
 * cheap to render so the slide-in panel opens instantly.
 */
export function SettingsPanelContent({ onClose }: { onClose: () => void }) {
  const { authUser, profile, signOut } = useAuth();
  const insets = useSafeAreaInsets();

  function go(path: string) {
    onClose();
    router.push(path as never);
  }

  function goToFinancesTab(tab: string) {
    onClose();
    router.navigate({ pathname: "/(app)/(tabs)/finances", params: { tab } });
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
              const { error } = await getSupabaseClient().functions.invoke("delete-account");
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

  const tier = profile?.subscription_tier;

  return (
    <View className="flex-1">
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
        contentContainerClassName="gap-5 px-5"
        contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
        showsVerticalScrollIndicator={false}
      >
        <Pressable onPress={() => go("/(app)/settings/profile")}>
          <BannerCard>
            <Avatar name={profile?.display_name} uri={profile?.avatar_url} size={52} logoFallback />
            <View className="flex-1">
              <Text className="text-base font-semibold text-neutral-900 dark:text-neutral-100" numberOfLines={1}>
                {profile?.display_name ?? "—"}
              </Text>
              <Text className="text-xs text-neutral-500" numberOfLines={1}>
                {authUser?.email}
              </Text>
              <Text className="mt-0.5 text-xs font-medium text-primary-deep" numberOfLines={1}>
                Edit profile · {profile?.default_currency ?? "PHP"}
              </Text>
            </View>
            <ChevronRight color={palette.muted} size={20} />
          </BannerCard>
        </Pressable>

        {PLANS_ENABLED ? (
          <Pressable onPress={() => go("/(app)/upgrade")}>
            <Card
              className={
                tier === "free" || !tier
                  ? "flex-row items-center gap-3 border-2 border-accent bg-accent/10"
                  : "flex-row items-center gap-3"
              }
            >
              <View className="h-10 w-10 items-center justify-center rounded-full bg-accent/20">
                <Crown size={20} color={palette.highlight} weight="fill" />
              </View>
              <View className="flex-1">
                <Text className="font-semibold text-neutral-900 dark:text-neutral-100">
                  {tier === "free" || !tier ? "Upgrade to Pro" : `${SUBSCRIPTION_PLANS[tier].name} plan`}
                </Text>
                <Text className="text-xs text-neutral-500">
                  {tier === "free" || !tier
                    ? `Unlimited groups, insights, and more from ${SUBSCRIPTION_PLANS.pro.priceLabel}`
                    : "Manage your subscription"}
                </Text>
              </View>
              <ChevronRight color={palette.highlight} size={18} />
            </Card>
          </Pressable>
        ) : null}

        {authUser?.email === SUBSCRIPTION_ADMIN_EMAIL ? (
          <Pressable onPress={() => go("/(app)/admin-subscriptions")}>
            <Card className="flex-row items-center justify-between">
              <Text className="font-semibold text-neutral-900 dark:text-neutral-100">Subscription requests</Text>
              <ChevronRight color={palette.muted} size={18} />
            </Card>
          </Pressable>
        ) : null}

        <MenuSet
          title="Account"
          items={[
            {
              label: "Security & sign-in",
              hint: "Password, fingerprint",
              icon: KeyRound,
              onPress: () => go("/(app)/settings/security"),
            },
            {
              label: "Currency rates",
              hint: "Convert other currencies",
              icon: ArrowsLeftRight,
              onPress: () => go("/(app)/currency-rates"),
            },
          ]}
        />

        <MenuSet
          title="Your money"
          items={[
            { label: "Accounts", icon: Wallet, onPress: () => goToFinancesTab("accounts") },
            { label: "Categories", icon: Tag, onPress: () => goToFinancesTab("categories") },
            { label: "Budgets", icon: PiggyBank, onPress: () => goToFinancesTab("budgets") },
            { label: "Transactions", icon: ListChecks, onPress: () => goToFinancesTab("records") },
          ]}
        />

        <MenuSet
          title="Preferences"
          items={[
            {
              label: "Notifications & reminders",
              hint: "Daily, bills, budgets",
              icon: Bell,
              onPress: () => go("/(app)/settings/notifications"),
            },
            {
              label: "Appearance",
              hint: "Dark mode, theme",
              icon: Palette,
              onPress: () => go("/(app)/settings/appearance"),
            },
            {
              label: "Export & import",
              hint: "CSV backup",
              icon: FileCsv,
              onPress: () => go("/(app)/settings/data"),
            },
          ]}
        />

        <MenuSet
          title="About"
          items={[
            {
              label: "About & legal",
              hint: "Version, updates, privacy, terms",
              icon: Info,
              onPress: () => go("/(app)/settings/about"),
            },
          ]}
        />

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
    </View>
  );
}
