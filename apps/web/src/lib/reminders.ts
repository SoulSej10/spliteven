"use client";

import { useSyncExternalStore } from "react";

/**
 * Reminder choices for the web app (same options as the phone app). On the web they are shown as
 * browser notifications while SplitEven is open (in a tab or installed to the home screen); a
 * website can't wake itself up when it is closed without a push server, so for reminders that
 * arrive with the app closed the Android app schedules them on the phone itself.
 */
export interface ReminderPrefs {
  daily: boolean;
  hour: number;
  minute: number;
  bills: boolean;
  budgets: boolean;
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
const listeners = new Set<() => void>();
let cache: { raw: string | null; value: ReminderPrefs } = { raw: null, value: DEFAULT_REMINDER_PREFS };

function read(): ReminderPrefs {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(KEY);
  } catch {
    // Storage blocked: defaults.
  }
  if (raw === cache.raw) return cache.value;
  let value = DEFAULT_REMINDER_PREFS;
  if (raw) {
    try {
      value = { ...DEFAULT_REMINDER_PREFS, ...(JSON.parse(raw) as Partial<ReminderPrefs>) };
    } catch {
      // Ignore a corrupted value.
    }
  }
  cache = { raw, value };
  return value;
}

export function saveReminderPrefs(next: ReminderPrefs) {
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // The choice still applies until the page reloads.
  }
  listeners.forEach((l) => l());
}

export function useReminderPrefs(): ReminderPrefs {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      window.addEventListener("storage", listener);
      return () => {
        listeners.delete(listener);
        window.removeEventListener("storage", listener);
      };
    },
    read,
    () => DEFAULT_REMINDER_PREFS
  );
}

export function notificationsSupported(): boolean {
  return typeof window !== "undefined" && "Notification" in window;
}

export function notificationPermission(): NotificationPermission | "unsupported" {
  return notificationsSupported() ? Notification.permission : "unsupported";
}

/** Asks the browser for permission (must follow a tap). True when granted. */
export async function requestNotificationPermission(): Promise<boolean> {
  if (!notificationsSupported()) return false;
  if (Notification.permission === "granted") return true;
  if (Notification.permission === "denied") return false;
  return (await Notification.requestPermission()) === "granted";
}

/** Shows one notification, through the service worker when there is one (needed on some phones). */
export async function showReminder(title: string, body: string): Promise<void> {
  if (!notificationsSupported() || Notification.permission !== "granted") return;
  try {
    const reg = await navigator.serviceWorker?.getRegistration();
    if (reg) {
      await reg.showNotification(title, { body, icon: "/icons/icon-192.png", badge: "/icons/icon-192.png" });
      return;
    }
  } catch {
    // Fall through to the plain constructor.
  }
  try {
    new Notification(title, { body, icon: "/icons/icon-192.png" });
  } catch {
    // Some browsers only allow the service-worker route.
  }
}

/** True the first time it is called for this key on this calendar day; remembers it afterwards. */
export function firstTimeToday(kind: string): boolean {
  const key = `evensplit:reminder-fired:${kind}`;
  const today = new Date().toDateString();
  try {
    if (localStorage.getItem(key) === today) return false;
    localStorage.setItem(key, today);
  } catch {
    // Without storage, never repeat within this session at least.
  }
  return true;
}
