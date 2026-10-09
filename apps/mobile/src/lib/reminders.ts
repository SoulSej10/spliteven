import { useSyncExternalStore } from "react";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import { ensureNotificationPermission } from "@/lib/notifications";

/**
 * Reminders that reach the phone even when SplitEven is closed. They are LOCAL notifications
 * scheduled on the phone itself (no server involved), so they keep working offline. Every time the
 * app opens, or the user's data changes, the whole set is cleared and scheduled again from the
 * latest budgets, bills and balances, so a reminder never goes stale.
 */

export interface ReminderPrefs {
  /** A daily nudge to log spending. */
  daily: boolean;
  hour: number;
  minute: number;
  /** A heads-up the day before a recurring group expense (rent, internet...) is due. */
  bills: boolean;
  /** A notice when a budget reaches 80% or goes over. */
  budgets: boolean;
  /** A weekly nudge while you still owe money in a group. */
  settle: boolean;
}

export const DEFAULT_REMINDER_PREFS: ReminderPrefs = {
  daily: false,
  hour: 20,
  minute: 0,
  bills: false,
  budgets: false,
  settle: false,
};

const KEY = "evensplit:reminders";
const CHANNEL_ID = "reminders";

let current: ReminderPrefs = DEFAULT_REMINDER_PREFS;
let loaded = false;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

async function ensureLoaded() {
  if (loaded) return;
  loaded = true;
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (raw) current = { ...DEFAULT_REMINDER_PREFS, ...(JSON.parse(raw) as Partial<ReminderPrefs>) };
  } catch {
    // Keep the defaults.
  }
  emit();
}
void ensureLoaded();

export async function saveReminderPrefs(next: ReminderPrefs): Promise<void> {
  current = next;
  emit();
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // The choice still applies this session.
  }
}

/** The saved reminder choices, live: components re-render when they change. */
export function useReminderPrefs(): ReminderPrefs {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    () => current,
    () => DEFAULT_REMINDER_PREFS
  );
}

export interface ReminderContext {
  /** Budgets at 80% or more of their limit, for the current period. */
  budgetAlerts: { name: string; percent: number; period: string }[];
  /** Recurring group expenses with their next due date (YYYY-MM-DD). */
  bills: { description: string; dueDate: string }[];
  /** What you currently owe across groups, per currency. */
  owes: { amount: number; currency: string }[];
}

function atLocal(date: Date, hour: number, minute = 0): Date {
  const d = new Date(date);
  d.setHours(hour, minute, 0, 0);
  return d;
}

function money(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat("en", { style: "currency", currency }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
}

/** Replaces every scheduled reminder with a fresh set built from the latest data. Never throws. */
export async function syncReminders(prefs: ReminderPrefs, ctx: ReminderContext): Promise<void> {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    const anyOn = prefs.daily || prefs.bills || prefs.budgets || prefs.settle;
    if (!anyOn) return;
    if (!(await ensureNotificationPermission())) return;

    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
        name: "Reminders",
        importance: Notifications.AndroidImportance.DEFAULT,
      });
    }
    const channelId = CHANNEL_ID;
    const now = new Date();

    if (prefs.daily) {
      await Notifications.scheduleNotificationAsync({
        content: { title: "Log today's spending", body: "Add what you spent today to keep your balance accurate.", data: { kind: "reminder" } },
        trigger: { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour: prefs.hour, minute: prefs.minute, channelId },
      });
    }

    if (prefs.bills) {
      for (const bill of ctx.bills.slice(0, 20)) {
        const [y, m, d] = bill.dueDate.split("-").map(Number);
        if (!y || !m || !d) continue;
        const due = new Date(y, m - 1, d);
        const dayBefore = atLocal(new Date(y, m - 1, d - 1), 9);
        const when = dayBefore.getTime() > now.getTime() ? dayBefore : atLocal(due, 9);
        if (when.getTime() <= now.getTime()) continue;
        const soon = when.getDate() === dayBefore.getDate() && when.getMonth() === dayBefore.getMonth();
        await Notifications.scheduleNotificationAsync({
          content: {
            title: "Bill due soon",
            body: `${bill.description} is due ${soon ? "tomorrow" : "today"}.`,
            data: { kind: "reminder" },
          },
          trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: when, channelId },
        });
      }
    }

    if (prefs.budgets && ctx.budgetAlerts.length > 0) {
      // Tonight at 6pm, or tomorrow at 9am if that has passed.
      const tonight = atLocal(now, 18);
      const when = tonight.getTime() > now.getTime() ? tonight : atLocal(new Date(now.getTime() + 86_400_000), 9);
      for (const alert of ctx.budgetAlerts.slice(0, 5)) {
        const over = alert.percent > 100;
        await Notifications.scheduleNotificationAsync({
          content: {
            title: over ? "Over budget" : "Budget alert",
            body: over
              ? `${alert.name} is over its ${alert.period} budget.`
              : `${alert.name} has used ${Math.round(alert.percent)}% of its ${alert.period} budget.`,
            data: { kind: "reminder" },
          },
          trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: when, channelId },
        });
      }
    }

    if (prefs.settle && ctx.owes.length > 0) {
      const owed = ctx.owes.map((o) => money(o.amount, o.currency)).join(" + ");
      await Notifications.scheduleNotificationAsync({
        content: { title: "Time to settle up?", body: `You owe ${owed} in your groups.`, data: { kind: "reminder" } },
        // Saturday morning.
        trigger: { type: Notifications.SchedulableTriggerInputTypes.WEEKLY, weekday: 7, hour: 10, minute: 0, channelId },
      });
    }
  } catch (err) {
    console.warn("EvenSplit: could not schedule reminders", err);
  }
}
