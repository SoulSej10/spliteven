import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { View } from "react-native";
import { useColorScheme } from "nativewind";
import { THEME_TEMPLATES, resolveTheme, type AccentId, type ThemeId } from "@evensplit/shared";
import { saveAppearance, type StoredAppearance } from "@/lib/appearance";
import { applyPalette } from "./palette";
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

  const resolved = useMemo(() => resolveTheme(themeId, accentId, scheme), [themeId, accentId, scheme]);
  const themeVars = useMemo(() => buildThemeVars(resolved), [resolved]);

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
    () => ({ themeId, accentId, version: `${themeId}:${accentId}:${scheme}`, setThemeId, setAccentId }),
    [themeId, accentId, scheme, setThemeId, setAccentId]
  );

  return (
    <ThemeContext.Provider value={value}>
      <View style={[{ flex: 1 }, themeVars]}>{children}</View>
    </ThemeContext.Provider>
  );
}

export function useAppTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useAppTheme must be used within AppThemeProvider");
  return ctx;
}
