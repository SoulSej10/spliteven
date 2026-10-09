import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import { getBiometricSupport } from "@/lib/biometrics";

/**
 * Fingerprint / face sign-in: an alternative to typing the password (and to the
 * emailed reset link) for someone who has already signed in on this phone.
 *
 * After a normal password sign-in the person is offered to turn it on. The email and
 * password are then saved in the phone's secure keystore, locked behind the phone's
 * biometric prompt (SecureStore with requireAuthentication), so they can only be read
 * back after a successful scan. Nothing is sent anywhere; turning it off, or changing
 * the password, deletes the saved copy. The choice is per phone.
 */
const FLAG_KEY = "evensplit:biometric-login";
const CREDENTIALS_KEY = "evensplit.biometric.credentials";

export type BiometricLoginState = "on" | "off" | "declined";

export async function getBiometricLoginState(): Promise<BiometricLoginState> {
  try {
    const value = await AsyncStorage.getItem(FLAG_KEY);
    return value === "on" || value === "declined" ? value : "off";
  } catch {
    return "off";
  }
}

async function setState(state: BiometricLoginState) {
  try {
    await AsyncStorage.setItem(FLAG_KEY, state);
  } catch {
    // Best effort: the flag only decides whether the button is shown.
  }
}

/** The phone has biometric hardware with something enrolled, so the option can work. */
export async function canOfferBiometricLogin(): Promise<boolean> {
  const support = await getBiometricSupport();
  return support.hasHardware && support.enrolled && (await SecureStore.isAvailableAsync());
}

/** Saves the sign-in behind a biometric prompt. Returns false if the phone refused or the scan was cancelled. */
export async function enableBiometricLogin(email: string, password: string): Promise<boolean> {
  try {
    await SecureStore.setItemAsync(CREDENTIALS_KEY, JSON.stringify({ email, password }), {
      requireAuthentication: true,
      authenticationPrompt: "Confirm to turn on fingerprint sign-in",
    });
    await setState("on");
    return true;
  } catch {
    return false;
  }
}

/** Remembers that the person said "not now", so the offer isn't repeated every time. */
export async function declineBiometricLogin(): Promise<void> {
  await setState("declined");
}

export async function disableBiometricLogin(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(CREDENTIALS_KEY);
  } catch {
    // Nothing saved, or the keystore entry is already gone.
  }
  await setState("off");
}

/** Reads the saved sign-in: this is what shows the biometric prompt. Null if cancelled or nothing is saved. */
export async function readBiometricCredentials(): Promise<{ email: string; password: string } | null> {
  try {
    const raw = await SecureStore.getItemAsync(CREDENTIALS_KEY, {
      requireAuthentication: true,
      authenticationPrompt: "Sign in to SplitEven",
    });
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { email?: unknown; password?: unknown };
    if (typeof parsed.email !== "string" || typeof parsed.password !== "string") return null;
    return { email: parsed.email, password: parsed.password };
  } catch {
    return null;
  }
}

/** Clears a previous "not now" so the offer appears again at the next password sign-in. */
export async function clearBiometricLoginDecline(): Promise<void> {
  if ((await getBiometricLoginState()) === "declined") await setState("off");
}
