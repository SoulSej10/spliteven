import {
  DEFAULT_ACCENT_ID,
  DEFAULT_THEME_ID,
  THEME_TEMPLATES,
  isAccentId,
  isThemeId,
  type AccentId,
  type ThemeId,
} from "@evensplit/shared";

export const THEME_STORAGE_KEY = "evensplit:theme";
export const ACCENT_STORAGE_KEY = "evensplit:accent";

export interface Appearance {
  themeId: ThemeId;
  accentId: AccentId;
}

/**
 * Runs in <head> before first paint so a saved theme never flashes the
 * default one. Keep it tiny and dependency-free; it only sets the two data
 * attributes the generated theme CSS keys off.
 */
export const APPEARANCE_BOOT_SCRIPT = `(function(){try{var d=document.documentElement,t=localStorage.getItem("${THEME_STORAGE_KEY}"),a=localStorage.getItem("${ACCENT_STORAGE_KEY}");if(t)d.setAttribute("data-theme",t);if(a)d.setAttribute("data-accent",a);}catch(e){}})();`;

export function readAppearance(): Appearance {
  try {
    const theme = localStorage.getItem(THEME_STORAGE_KEY);
    const accent = localStorage.getItem(ACCENT_STORAGE_KEY);
    const themeId = isThemeId(theme) ? theme : DEFAULT_THEME_ID;
    const accentId = isAccentId(accent) ? accent : THEME_TEMPLATES[themeId].defaultAccent;
    return { themeId, accentId };
  } catch {
    return { themeId: DEFAULT_THEME_ID, accentId: DEFAULT_ACCENT_ID };
  }
}

export function applyAppearance({ themeId, accentId }: Appearance): void {
  const root = document.documentElement;
  root.setAttribute("data-theme", themeId);
  root.setAttribute("data-accent", accentId);
  try {
    localStorage.setItem(THEME_STORAGE_KEY, themeId);
    localStorage.setItem(ACCENT_STORAGE_KEY, accentId);
  } catch {
    // Private mode etc: the choice still applies for this visit.
  }
  window.dispatchEvent(new Event("evensplit:appearance"));
}

const APPEARANCE_EVENT = "evensplit:appearance";

/** For useSyncExternalStore: notifies when the theme/accent changes here or in another tab. */
export function subscribeAppearance(onChange: () => void): () => void {
  window.addEventListener(APPEARANCE_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(APPEARANCE_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

/** Stable string snapshot ("theme|accent") of the appearance currently applied to the page. */
export function getAppearanceSnapshot(): string {
  const { themeId, accentId } = readAppearance();
  return `${themeId}|${accentId}`;
}

export function parseAppearanceSnapshot(snapshot: string): Appearance {
  const [theme, accent] = snapshot.split("|");
  const themeId = isThemeId(theme) ? theme : DEFAULT_THEME_ID;
  return { themeId, accentId: isAccentId(accent) ? accent : THEME_TEMPLATES[themeId].defaultAccent };
}

export const SERVER_APPEARANCE_SNAPSHOT = `${DEFAULT_THEME_ID}|${DEFAULT_ACCENT_ID}`;
