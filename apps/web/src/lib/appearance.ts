"use client";

import { useSyncExternalStore } from "react";
import {
  DEFAULT_ACCENT_ID,
  DEFAULT_THEME_ID,
  THEME_TEMPLATES,
  isAccentId,
  isThemeId,
  resolveTheme,
  type AccentId,
  type ColorScheme,
  type ThemeId,
} from "@evensplit/shared";

/**
 * The theme (template + accent color) chosen for the signed-in web app, same options as the phone app.
 * It is remembered in this browser and applied only inside the account (see ThemeApplier): the landing,
 * login and other public pages always use the default green.
 */
export interface WebAppearance {
  themeId: ThemeId;
  accentId: AccentId;
}

const KEY = "evensplit:web-appearance";
const DEFAULT_APPEARANCE: WebAppearance = { themeId: DEFAULT_THEME_ID, accentId: DEFAULT_ACCENT_ID };
const listeners = new Set<() => void>();
let cache: { raw: string | null; value: WebAppearance } = { raw: null, value: DEFAULT_APPEARANCE };

function read(): WebAppearance {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(KEY);
  } catch {
    // Storage blocked: defaults.
  }
  if (raw === cache.raw) return cache.value;
  let value = DEFAULT_APPEARANCE;
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as Partial<WebAppearance>;
      const themeId = isThemeId(parsed.themeId) ? parsed.themeId : DEFAULT_THEME_ID;
      const accentId = isAccentId(parsed.accentId) ? parsed.accentId : THEME_TEMPLATES[themeId].defaultAccent;
      value = { themeId, accentId };
    } catch {
      // Ignore a corrupted value.
    }
  }
  cache = { raw, value };
  return value;
}

export function saveAppearance(next: WebAppearance) {
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // The choice still applies until the page reloads.
  }
  listeners.forEach((l) => l());
}

export function useWebAppearance(): WebAppearance {
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
    () => DEFAULT_APPEARANCE
  );
}

/** The CSS variables for a theme, named the way globals.css and the UI components expect them. */
export function themeCssVars(appearance: WebAppearance, scheme: ColorScheme): Record<string, string> {
  const { colors: c, radiusScale } = resolveTheme(appearance.themeId, appearance.accentId, scheme);
  return {
    "--background": c.background,
    "--foreground": c.foreground,
    "--card": c.card,
    "--card-foreground": c.foreground,
    "--popover": c.card,
    "--popover-foreground": c.foreground,
    "--primary": c.primaryDeep === c.primary ? c.primary : scheme === "light" ? c.primaryDeep : c.primary,
    "--primary-foreground": scheme === "light" ? "#ffffff" : c.onPrimary,
    "--primary-light": c.primaryLight,
    "--primary-deep": c.primaryDeep,
    "--secondary": c.primaryLight,
    "--secondary-foreground": c.primaryDeep,
    "--muted": c.muted,
    "--muted-foreground": c.mutedForeground,
    "--accent": c.highlight,
    "--accent-foreground": c.highlightOn,
    "--accent-light": c.highlightTint,
    "--destructive": c.negative,
    "--negative": c.negative,
    "--positive": c.positive,
    "--warning": c.warning,
    "--border": c.border,
    "--input": c.border,
    "--ring": scheme === "light" ? c.primaryDeep : c.primary,
    "--chart-1": c.primary,
    "--chart-2": c.highlight,
    "--chart-3": c.positive,
    "--chart-4": c.negative,
    "--chart-5": c.mutedForeground,
    "--sidebar": c.card,
    "--sidebar-foreground": c.foreground,
    "--sidebar-primary": scheme === "light" ? c.primaryDeep : c.primary,
    "--sidebar-primary-foreground": scheme === "light" ? "#ffffff" : c.onPrimary,
    "--sidebar-accent": c.primaryLight,
    "--sidebar-accent-foreground": c.primaryDeep,
    "--sidebar-border": c.border,
    "--sidebar-ring": c.primary,
    "--radius-scale": String(radiusScale),
  };
}
