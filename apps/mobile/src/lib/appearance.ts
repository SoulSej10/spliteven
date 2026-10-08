import AsyncStorage from "@react-native-async-storage/async-storage";

const COLOR_SCHEME_KEY = "evensplit:color-scheme";

export type StoredColorScheme = "light" | "dark";

/** The light/dark choice the user last made on this device; light until they pick one. */
export async function loadStoredColorScheme(): Promise<StoredColorScheme> {
  try {
    return (await AsyncStorage.getItem(COLOR_SCHEME_KEY)) === "dark" ? "dark" : "light";
  } catch {
    return "light";
  }
}

export async function saveColorScheme(scheme: StoredColorScheme): Promise<void> {
  try {
    await AsyncStorage.setItem(COLOR_SCHEME_KEY, scheme);
  } catch {
    // Persistence is best-effort - the in-memory choice still applies this session.
  }
}
