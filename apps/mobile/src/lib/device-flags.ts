import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * Simple one-time, per-device flags backed by AsyncStorage — for gates and
 * nudges that should fire exactly once ever, not once per app session.
 */

const PRIVACY_POLICY_KEY = "evensplit:privacy-policy-accepted";

/** Whether this device has already accepted the privacy policy (first-run gate). */
export async function hasAcceptedPrivacyPolicy(): Promise<boolean> {
  return (await AsyncStorage.getItem(PRIVACY_POLICY_KEY)) === "true";
}

export async function setPrivacyPolicyAccepted(): Promise<void> {
  await AsyncStorage.setItem(PRIVACY_POLICY_KEY, "true");
}

/** Whether the per-page guided tour identified by `key` (e.g. "dashboard", "groups") has already been shown on this device. Each page's tour is independent so replaying one doesn't affect the others. */
export async function hasSeenPageTour(key: string): Promise<boolean> {
  return (await AsyncStorage.getItem(`evensplit:page-tour-shown:${key}`)) === "true";
}

export async function setPageTourShown(key: string): Promise<void> {
  await AsyncStorage.setItem(`evensplit:page-tour-shown:${key}`, "true");
}

const NOTIF_NUDGE_KEY = "evensplit:notification-nudge-shown";

/** Whether the one-time "enable notifications?" nudge has already been shown on this device. */
export async function hasShownNotificationNudge(): Promise<boolean> {
  return (await AsyncStorage.getItem(NOTIF_NUDGE_KEY)) === "true";
}

export async function setNotificationNudgeShown(): Promise<void> {
  await AsyncStorage.setItem(NOTIF_NUDGE_KEY, "true");
}
