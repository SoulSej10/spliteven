import { Linking } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import { LATEST_RELEASE_API, evaluateRelease, type AppUpdateInfo } from "@evensplit/shared";

const DISMISSED_KEY = "evensplit:dismissed-update";

export function installedVersion(): string {
  return Constants.expoConfig?.version ?? "1.0.0";
}

/**
 * Asks GitHub for the newest release of the public download repo and returns
 * it when it is newer than the installed build. Resolves null when up to date;
 * rejects only on a network/HTTP failure so callers can tell "current" from
 * "couldn't check".
 */
export async function fetchAvailableUpdate(): Promise<AppUpdateInfo | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  try {
    const res = await fetch(LATEST_RELEASE_API, {
      headers: { Accept: "application/vnd.github+json" },
      signal: controller.signal,
    });
    if (res.status === 404) return null; // no release published yet
    if (!res.ok) throw new Error(`Update check failed (${res.status})`);
    return evaluateRelease(installedVersion(), await res.json());
  } finally {
    clearTimeout(timer);
  }
}

/** Opens the APK download; Android's browser downloads it and offers to install over the current app. */
export function openUpdateDownload(info: AppUpdateInfo) {
  return Linking.openURL(info.downloadUrl);
}

export async function getDismissedUpdate(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(DISMISSED_KEY);
  } catch {
    return null;
  }
}

export async function dismissUpdate(version: string): Promise<void> {
  try {
    await AsyncStorage.setItem(DISMISSED_KEY, version);
  } catch {
    // Best effort: worst case the prompt shows again next launch.
  }
}
