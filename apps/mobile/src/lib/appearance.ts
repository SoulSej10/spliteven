import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  DEFAULT_ACCENT_ID,
  DEFAULT_THEME_ID,
  THEME_TEMPLATES,
  isAccentId,
  isThemeId,
  type AccentId,
  type ThemeId,
} from "@evensplit/shared";

const COLOR_SCHEME_KEY = "evensplit:color-scheme";
const THEME_KEY = "evensplit:theme";
const ACCENT_KEY = "evensplit:accent";

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

export interface StoredAppearance {
  themeId: ThemeId;
  accentId: AccentId;
}

/** The theme template and accent color the user last picked; Classic/teal until they choose. */
export async function loadStoredAppearance(): Promise<StoredAppearance> {
  try {
    const [theme, accent] = await Promise.all([AsyncStorage.getItem(THEME_KEY), AsyncStorage.getItem(ACCENT_KEY)]);
    const themeId = isThemeId(theme) ? theme : DEFAULT_THEME_ID;
    const accentId = isAccentId(accent) ? accent : THEME_TEMPLATES[themeId].defaultAccent;
    return { themeId, accentId };
  } catch {
    return { themeId: DEFAULT_THEME_ID, accentId: DEFAULT_ACCENT_ID };
  }
}

export async function saveAppearance({ themeId, accentId }: StoredAppearance): Promise<void> {
  try {
    await Promise.all([AsyncStorage.setItem(THEME_KEY, themeId), AsyncStorage.setItem(ACCENT_KEY, accentId)]);
  } catch {
    // Best-effort, same as the color scheme.
  }
}
