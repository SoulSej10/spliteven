import { useSyncExternalStore } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as LocalAuthentication from "expo-local-authentication";

const KEY = "evensplit:biometric-unlock";

/**
 * Biometric unlock: when on, the app asks for a fingerprint or face (or the
 * device PIN as the phone's own fallback) every time it opens and after it has
 * been in the background for a while. The Supabase session stays stored as
 * before: this only decides whether the screen is shown, so no password or
 * token is ever stored differently. The choice is per device.
 */
let enabled: boolean | null = null; // null until loaded from storage
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

async function load() {
  try {
    enabled = (await AsyncStorage.getItem(KEY)) === "true";
  } catch {
    enabled = false;
  }
  emit();
}
void load();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** true / false once loaded, null while the saved choice is still being read. */
export function useBiometricEnabled(): boolean | null {
  return useSyncExternalStore(subscribe, () => enabled);
}

export async function setBiometricEnabled(value: boolean): Promise<void> {
  enabled = value;
  emit();
  try {
    await AsyncStorage.setItem(KEY, value ? "true" : "false");
  } catch {
    // Best effort: the choice still applies until the app restarts.
  }
}

export interface BiometricSupport {
  /** The phone has biometric hardware. */
  hasHardware: boolean;
  /** A fingerprint or face is actually set up on the phone. */
  enrolled: boolean;
  /** "fingerprint", "face" or a generic label, for the Settings row. */
  label: string;
}

export async function getBiometricSupport(): Promise<BiometricSupport> {
  try {
    const [hasHardware, enrolled, types] = await Promise.all([
      LocalAuthentication.hasHardwareAsync(),
      LocalAuthentication.isEnrolledAsync(),
      LocalAuthentication.supportedAuthenticationTypesAsync(),
    ]);
    const face = types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION);
    const finger = types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT);
    const label = face && finger ? "fingerprint or face" : face ? "face" : finger ? "fingerprint" : "biometrics";
    return { hasHardware, enrolled, label };
  } catch {
    return { hasHardware: false, enrolled: false, label: "biometrics" };
  }
}

export interface UnlockResult {
  success: boolean;
  /** True when the person dismissed the prompt, so callers can stay quiet. */
  cancelled: boolean;
  message?: string;
}

export async function promptUnlock(reason = "Unlock SplitEven"): Promise<UnlockResult> {
  try {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: reason,
      cancelLabel: "Cancel",
    });
    if (result.success) return { success: true, cancelled: false };
    const cancelled =
      result.error === "user_cancel" || result.error === "system_cancel" || result.error === "app_cancel";
    return { success: false, cancelled, message: cancelled ? undefined : "Couldn't verify it's you. Try again." };
  } catch {
    return { success: false, cancelled: false, message: "Biometric unlock isn't available right now." };
  }
}
