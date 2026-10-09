import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { View, useWindowDimensions } from "react-native";
import { colorScheme as nativeWindScheme, useColorScheme } from "nativewind";
import { DEFAULT_ACCENT_ID, DEFAULT_THEME_ID, THEME_TEMPLATES, resolveTheme, type AccentId, type ThemeId } from "@evensplit/shared";
import { useAuth } from "@/hooks/use-auth";
import { loadStoredColorScheme, saveAppearance, type StoredAppearance } from "@/lib/appearance";
import { applyPalette } from "./palette";
import { buildResponsiveVars } from "./responsive";
import { buildThemeVars } from "./vars";

interface ThemeContextValue {
  themeId: ThemeId;
  accentId: AccentId;
  /** Changes whenever the visible theme changes (template, accent, or light/dark): use as a React `key` to re-mount screens that read the hex palette. */
  version: string;
  setThemeId: (id: ThemeId) => void;
  setAccentId: (id: AccentId) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

/**
 * Applies the chosen template + accent for the current light/dark mode: sets
 * the NativeWind variables every className color/radius reads, and refreshes
 * the hex palette used by icons and charts.
 */
export function AppThemeProvider({ initial, children }: { initial: StoredAppearance; children: ReactNode }) {
  const { colorScheme } = useColorScheme();
  const scheme = colorScheme === "dark" ? "dark" : "light";
  const [themeId, setThemeIdState] = useState<ThemeId>(initial.themeId);
  const [accentId, setAccentIdState] = useState<AccentId>(initial.accentId);

  // The chosen look belongs to the signed-in app. Signed out (login, sign-up, reset), the app always
  // shows the default light green, and the saved choice comes back at the next sign-in.
  const { session, loading } = useAuth();
  const personalised = loading || !!session;

  useEffect(() => {
    if (loading) return;
    if (!session) {
      nativeWindScheme.set("light");
      return;
    }
    let active = true;
    void loadStoredColorScheme().then((stored) => {
      if (active) nativeWindScheme.set(stored);
    });
    return () => {
      active = false;
    };
  }, [session, loading]);

  const shownThemeId = personalised ? themeId : DEFAULT_THEME_ID;
  const shownAccentId = personalised ? accentId : DEFAULT_ACCENT_ID;
  const shownScheme = personalised ? scheme : "light";
  const resolved = useMemo(
    () => resolveTheme(shownThemeId, shownAccentId, shownScheme),
    [shownThemeId, shownAccentId, shownScheme]
  );
  const themeVars = useMemo(() => buildThemeVars(resolved), [resolved]);
  const { width } = useWindowDimensions();
  const responsiveVars = useMemo(() => buildResponsiveVars(width), [width]);

  // Before any child renders, so everything reading `palette` sees this theme.
  applyPalette(resolved);

  const setThemeId = useCallback(
    (id: ThemeId) => {
      // A template ships with its own matching accent; the swatches still let you override it.
      const nextAccent = THEME_TEMPLATES[id].defaultAccent;
      setThemeIdState(id);
      setAccentIdState(nextAccent);
      void saveAppearance({ themeId: id, accentId: nextAccent });
    },
    []
  );

  const setAccentId = useCallback(
    (id: AccentId) => {
      setAccentIdState(id);
      void saveAppearance({ themeId, accentId: id });
    },
    [themeId]
  );

  const value = useMemo<ThemeContextValue>(
    () => ({ themeId, accentId, version: `${shownThemeId}:${shownAccentId}:${shownScheme}`, setThemeId, setAccentId }),
    [themeId, accentId, shownThemeId, shownAccentId, shownScheme, setThemeId, setAccentId]
  );

  return (
    <ThemeContext.Provider value={value}>
      <View style={[{ flex: 1 }, themeVars, responsiveVars]}>{children}</View>
    </ThemeContext.Provider>
  );
}

export function useAppTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useAppTheme must be used within AppThemeProvider");
  return ctx;
}
