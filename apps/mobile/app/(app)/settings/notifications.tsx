import { useEffect, useState } from "react";
import { Alert, Platform, Pressable, Switch, View } from "react-native";
import * as Notifications from "expo-notifications";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Bell, CalendarCheck, Handshake, Receipt, PiggyBank } from "phosphor-react-native";
import { Text } from "@/components/ui/typography";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { SettingsScreen } from "@/components/settings/SettingsScreen";
import { useAuth } from "@/hooks/use-auth";
import { ensureNotificationPermission, registerForPushTokenAsync, savePushToken } from "@/lib/notifications";
import { saveReminderPrefs, useReminderPrefs, type ReminderPrefs } from "@/lib/reminders";
import { palette } from "@/theme/palette";

function formatTime(hour: number, minute: number) {
  const h12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${h12}:${String(minute).padStart(2, "0")} ${hour < 12 ? "AM" : "PM"}`;
}

function ReminderRow({
  icon,
  title,
  description,
  value,
  onChange,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  value: boolean;
  onChange: (next: boolean) => void;
  children?: React.ReactNode;
}) {
  return (
    <View className="gap-2 py-2.5">
      <View className="flex-row items-center justify-between gap-3">
        <View className="flex-1 flex-row items-center gap-2.5">
          {icon}
          <View className="flex-1">
            <Text className="text-neutral-900 dark:text-neutral-100">{title}</Text>
            <Text className="text-xs text-neutral-500">{description}</Text>
          </View>
        </View>
        <Switch
          value={value}
          onValueChange={onChange}
          trackColor={{ true: palette.primaryFill, false: palette.track }}
          thumbColor={palette.primary}
        />
      </View>
      {children}
    </View>
  );
}

/** Push notifications and the reminders that reach you even when the app is closed. */
export default function NotificationsSettingsScreen() {
  const { authUser } = useAuth();
  const prefs = useReminderPrefs();
  const [permission, setPermission] = useState<string>("undetermined");
  const [showTime, setShowTime] = useState(false);

  useEffect(() => {
    void Notifications.getPermissionsAsync().then((p) => setPermission(p.status));
  }, []);

  async function enableNotifications(): Promise<boolean> {
    const granted = await ensureNotificationPermission();
    setPermission(granted ? "granted" : "denied");
    if (!granted) {
      Alert.alert(
        "Notifications are off",
        "Allow notifications for SplitEven in your phone's settings, then come back and turn this on."
      );
      return false;
    }
    const token = await registerForPushTokenAsync();
    if (token && authUser) await savePushToken(authUser.id, token);
    return true;
  }

  async function update(patch: Partial<ReminderPrefs>) {
    const turningOn = Object.entries(patch).some(([k, v]) => k !== "hour" && k !== "minute" && v === true);
    if (turningOn && !(await enableNotifications())) return;
    await saveReminderPrefs({ ...prefs, ...patch });
  }

  const time = new Date();
  time.setHours(prefs.hour, prefs.minute, 0, 0);

  return (
    <SettingsScreen title="Notifications & reminders">
      <Card className="gap-3">
        <View className="flex-row items-center gap-2.5">
          <Bell size={17} color={palette.primary} />
          <Text className="font-semibold text-neutral-900 dark:text-neutral-100">Group activity</Text>
        </View>
        <Text className="text-xs text-neutral-500">
          You'll get a notification on this phone when someone in your groups adds an expense or settles up.
        </Text>
        {permission === "granted" ? (
          <Text className="text-xs font-medium text-primary-deep">Notifications are on for this phone.</Text>
        ) : (
          <Button size="sm" variant="outline" onPress={() => void enableNotifications()}>
            Turn on notifications
          </Button>
        )}
      </Card>

      <Card className="gap-1">
        <Text className="font-semibold text-neutral-900 dark:text-neutral-100">Reminders</Text>
        <Text className="mb-1 text-xs text-neutral-500">
          Delivered by your phone even when SplitEven is closed. No internet needed.
        </Text>

        <ReminderRow
          icon={<CalendarCheck size={17} color={palette.primary} />}
          title="Daily spending reminder"
          description="A nudge to log what you spent."
          value={prefs.daily}
          onChange={(v) => void update({ daily: v })}
        >
          {prefs.daily && (
            <Pressable
              onPress={() => setShowTime(true)}
              className="ml-7 self-start rounded-pill border border-neutral-500/20 px-3 py-1.5"
            >
              <Text className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                Every day at {formatTime(prefs.hour, prefs.minute)}
              </Text>
            </Pressable>
          )}
        </ReminderRow>

        <ReminderRow
          icon={<Receipt size={17} color={palette.primary} />}
          title="Bills coming due"
          description="The day before a recurring group expense is due."
          value={prefs.bills}
          onChange={(v) => void update({ bills: v })}
        />

        <ReminderRow
          icon={<PiggyBank size={17} color={palette.primary} />}
          title="Budget alerts"
          description="When a budget reaches 80% or goes over."
          value={prefs.budgets}
          onChange={(v) => void update({ budgets: v })}
        />

        <ReminderRow
          icon={<Handshake size={17} color={palette.primary} />}
          title="Settle-up nudge"
          description="Saturday mornings while you still owe money in a group."
          value={prefs.settle}
          onChange={(v) => void update({ settle: v })}
        />
      </Card>

      {showTime && (
        <DateTimePicker
          value={time}
          mode="time"
          is24Hour={false}
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onValueChange={(_, picked) => {
            setShowTime(false);
            if (picked) void update({ hour: picked.getHours(), minute: picked.getMinutes() });
          }}
          onDismiss={() => setShowTime(false)}
        />
      )}
    </SettingsScreen>
  );
}
