import type { ResolvedTheme } from "@evensplit/shared";

/**
 * The current theme's colors as plain hex strings, for the places that can't
 * take a Tailwind class (icon `color` props, charts, switch tracks, tab bar
 * options). It's a mutable singleton that ThemeProvider refreshes before
 * each render; screens that read it are re-mounted when the theme changes
 * (see the key on <Tabs> in app/(app)/(tabs)/_layout.tsx).
 *
 * Defaults are the Classic light palette so nothing is ever undefined.
 */
export const palette = {
  /** Readable accent for icons and text on surfaces (the "deep" shade: darker in light mode, lighter in dark). */
  primary: "#2F8F7D",
  /** The soft accent fill, for switch tracks and other filled shapes. */
  primaryFill: "#2F8F7D",
  primaryBright: "#5FBBA5",
  primaryDeep: "#1F6355",
  onPrimary: "#FFFFFF",
  primaryLight: "#E8F4F0",
  /** Secondary text and quiet icons. */
  muted: "#6B7169",
  /** Default text/icon color on screen backgrounds (dark ink in light mode, light in dark mode). */
  ink: "#0A0A0A",
  background: "#F4F5F3",
  card: "#FFFFFF",
  border: "#E3E6E1",
  negative: "#D95F5F",
  positive: "#1E9A7E",
  highlight: "#F0A93B",
  warning: "#D99A2B",
  track: "#D9DCD6",
};

export function applyPalette({ colors }: ResolvedTheme): void {
  palette.primary = colors.primaryDeep;
  palette.primaryFill = colors.primary;
  palette.primaryBright = colors.primaryBright;
  palette.primaryDeep = colors.primaryDeep;
  palette.onPrimary = colors.onPrimary;
  palette.primaryLight = colors.primaryLight;
  palette.muted = colors.mutedForeground;
  palette.ink = colors.foreground;
  palette.background = colors.background;
  palette.card = colors.card;
  palette.border = colors.border;
  palette.negative = colors.negative;
  palette.positive = colors.positive;
  palette.highlight = colors.highlight;
  palette.warning = colors.warning;
  palette.track = colors.track;
}

/** "#RRGGBB" + opacity -> "rgba(r,g,b,a)", for inline styles that need a translucent theme color. */
export function withAlpha(hex: string, alpha: number): string {
  const value = hex.replace("#", "");
  const r = parseInt(value.slice(0, 2), 16);
  const g = parseInt(value.slice(2, 4), 16);
  const b = parseInt(value.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}
