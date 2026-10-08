/**
 * Single source of truth for SplitEven's look: web and mobile both resolve
 * their colors and corner roundness from here, so a theme looks the same on
 * every platform.
 *
 * A look is three independent choices:
 *   - template: surfaces (page/card/muted/border/text tints) + corner roundness
 *   - accent:   the pastel brand color (buttons, links, charts, highlights)
 *   - scheme:   light or dark (the app's existing mode switch)
 * Every template x accent x scheme combination resolves to a complete,
 * readable palette (see themes.test.ts, which checks contrast for all 64).
 */

export type ColorScheme = "light" | "dark";

export type ThemeId = "classic" | "sakura" | "lavender" | "peach";
export type AccentId = "teal" | "rose" | "peach" | "honey" | "mint" | "sky" | "periwinkle" | "orchid";

export interface SurfaceTokens {
  background: string;
  foreground: string;
  card: string;
  muted: string;
  mutedForeground: string;
  border: string;
}

export interface ThemeTemplate {
  id: ThemeId;
  name: string;
  tagline: string;
  /** Multiplies the whole corner-radius scale: 1 is the classic look, higher is rounder/bubblier. */
  radiusScale: number;
  defaultAccent: AccentId;
  light: SurfaceTokens;
  dark: SurfaceTokens;
}

export interface AccentTones {
  primary: string;
  /** Text/icon color to put on top of `primary`. */
  onPrimary: string;
  /** Very soft tint of the accent, for chips and highlighted rows. */
  tint: string;
  /** Darker (light mode) / lighter (dark mode) shade for accent-colored text on the tint. */
  deep: string;
}

export interface AccentSwatch {
  id: AccentId;
  name: string;
  light: AccentTones;
  dark: AccentTones;
}

export const THEME_TEMPLATES: Record<ThemeId, ThemeTemplate> = {
  classic: {
    id: "classic",
    name: "Classic",
    tagline: "The original calm look",
    radiusScale: 1,
    defaultAccent: "teal",
    light: {
      background: "#F4F5F3",
      foreground: "#0A0A0A",
      card: "#FFFFFF",
      muted: "#ECECEA",
      mutedForeground: "#6B7169",
      border: "#E3E6E1",
    },
    dark: {
      background: "#16211B",
      foreground: "#F5F5F5",
      card: "#1E2E27",
      muted: "#223229",
      mutedForeground: "#A3B0A8",
      border: "#2E3F37",
    },
  },
  sakura: {
    id: "sakura",
    name: "Sakura Milk",
    tagline: "Soft pink, extra bubbly",
    radiusScale: 2,
    defaultAccent: "rose",
    light: {
      background: "#FFF4F7",
      foreground: "#4A2C3B",
      card: "#FFFFFF",
      muted: "#FBE3EC",
      mutedForeground: "#8F6679",
      border: "#F6D3E0",
    },
    dark: {
      background: "#2A1E29",
      foreground: "#FDEAF2",
      card: "#382838",
      muted: "#442F43",
      mutedForeground: "#D2AEC3",
      border: "#52394F",
    },
  },
  lavender: {
    id: "lavender",
    name: "Lavender Cloud",
    tagline: "Dreamy purples, gently rounded",
    radiusScale: 1.6,
    defaultAccent: "periwinkle",
    light: {
      background: "#F6F3FF",
      foreground: "#2F2A4A",
      card: "#FFFFFF",
      muted: "#EBE6FB",
      mutedForeground: "#6F688F",
      border: "#DDD6F5",
    },
    dark: {
      background: "#1E1A33",
      foreground: "#F1EEFF",
      card: "#29244A",
      muted: "#312B57",
      mutedForeground: "#BDB6E6",
      border: "#3D3665",
    },
  },
  peach: {
    id: "peach",
    name: "Peach Cream",
    tagline: "Warm and cozy, softly squared",
    radiusScale: 1.2,
    defaultAccent: "peach",
    light: {
      background: "#FFF6EE",
      foreground: "#4A3426",
      card: "#FFFDFA",
      muted: "#FBE9D8",
      mutedForeground: "#936F55",
      border: "#F4DCC6",
    },
    dark: {
      background: "#2A211B",
      foreground: "#FDEEE0",
      card: "#38302A",
      muted: "#463A31",
      mutedForeground: "#D6B9A1",
      border: "#52443A",
    },
  },
};

export const ACCENT_SWATCHES: Record<AccentId, AccentSwatch> = {
  teal: {
    id: "teal",
    name: "Teal",
    light: { primary: "#2F8F7D", onPrimary: "#FFFFFF", tint: "#E8F4F0", deep: "#1F6355" },
    dark: { primary: "#5FBBA5", onPrimary: "#16211B", tint: "#243A32", deep: "#86CDBB" },
  },
  rose: {
    id: "rose",
    name: "Rose",
    light: { primary: "#D8527F", onPrimary: "#FFFFFF", tint: "#FDE6EE", deep: "#A93D66" },
    dark: { primary: "#F08FB0", onPrimary: "#2A1620", tint: "#4A2D3E", deep: "#F7B3CA" },
  },
  peach: {
    id: "peach",
    name: "Peach",
    light: { primary: "#D96A3F", onPrimary: "#FFFFFF", tint: "#FDEADF", deep: "#A24521" },
    dark: { primary: "#F5A183", onPrimary: "#2B1A12", tint: "#4A3328", deep: "#F9C3AD" },
  },
  honey: {
    id: "honey",
    name: "Honey",
    light: { primary: "#CF8A12", onPrimary: "#2E1F06", tint: "#FBEFD6", deep: "#8A5C0C" },
    dark: { primary: "#EDBE5C", onPrimary: "#2B2108", tint: "#463B22", deep: "#F4D58F" },
  },
  mint: {
    id: "mint",
    name: "Mint",
    light: { primary: "#2A9D7C", onPrimary: "#FFFFFF", tint: "#E2F5EE", deep: "#1D6F58" },
    dark: { primary: "#6FD1B3", onPrimary: "#10241D", tint: "#243E36", deep: "#9CE0CB" },
  },
  sky: {
    id: "sky",
    name: "Sky",
    light: { primary: "#3F8FCF", onPrimary: "#FFFFFF", tint: "#E3F1FB", deep: "#2A6A9B" },
    dark: { primary: "#7DBDEB", onPrimary: "#0F2230", tint: "#243A4B", deep: "#A8D4F2" },
  },
  periwinkle: {
    id: "periwinkle",
    name: "Periwinkle",
    light: { primary: "#6F68D8", onPrimary: "#FFFFFF", tint: "#ECEAFC", deep: "#4B45A8" },
    dark: { primary: "#A59DF2", onPrimary: "#1B1738", tint: "#37325E", deep: "#C3BDF7" },
  },
  orchid: {
    id: "orchid",
    name: "Orchid",
    light: { primary: "#A855CC", onPrimary: "#FFFFFF", tint: "#F3E6FA", deep: "#7C3E9E" },
    dark: { primary: "#CD9BE8", onPrimary: "#26132F", tint: "#43304F", deep: "#E0BDF2" },
  },
};

export const THEME_IDS = Object.keys(THEME_TEMPLATES) as ThemeId[];
export const ACCENT_IDS = Object.keys(ACCENT_SWATCHES) as AccentId[];
export const DEFAULT_THEME_ID: ThemeId = "classic";
export const DEFAULT_ACCENT_ID: AccentId = "teal";

export function isThemeId(value: unknown): value is ThemeId {
  return typeof value === "string" && value in THEME_TEMPLATES;
}

export function isAccentId(value: unknown): value is AccentId {
  return typeof value === "string" && value in ACCENT_SWATCHES;
}

/** Status colors, tuned per scheme so gains/losses/warnings stay legible on every pastel surface. */
const STATUS = {
  light: {
    positive: "#1E9A7E",
    negative: "#D95F5F",
    warning: "#D99A2B",
    highlight: "#F0A93B",
    highlightTint: "#FDF1DC",
    highlightDeep: "#B9790F",
    highlightOn: "#3A2A0C",
  },
  dark: {
    positive: "#5ECFA8",
    negative: "#EE8A8A",
    warning: "#E8B85C",
    highlight: "#F3C26B",
    highlightTint: "#463B22",
    highlightDeep: "#F6D590",
    highlightOn: "#2B2108",
  },
} as const;

export interface ResolvedColors {
  background: string;
  foreground: string;
  card: string;
  muted: string;
  mutedForeground: string;
  border: string;
  primary: string;
  onPrimary: string;
  primaryLight: string;
  primaryDeep: string;
  /** The accent's dark-mode tone: for text/icons that must pop on dark surfaces. */
  primaryBright: string;
  /** A softer companion shade of the accent. */
  primarySoft: string;
  /** Amber highlight (CTAs, streaks): independent of the chosen accent. */
  highlight: string;
  highlightTint: string;
  highlightDeep: string;
  highlightOn: string;
  positive: string;
  negative: string;
  warning: string;
  /** Switch/slider track when "off". */
  track: string;
}

export interface ResolvedTheme {
  themeId: ThemeId;
  accentId: AccentId;
  scheme: ColorScheme;
  /** Multiplier for the whole corner-radius scale. */
  radiusScale: number;
  colors: ResolvedColors;
}

export function resolveTheme(themeId: ThemeId, accentId: AccentId, scheme: ColorScheme): ResolvedTheme {
  const template = THEME_TEMPLATES[themeId] ?? THEME_TEMPLATES[DEFAULT_THEME_ID];
  const swatch = ACCENT_SWATCHES[accentId] ?? ACCENT_SWATCHES[DEFAULT_ACCENT_ID];
  const surfaces = template[scheme];
  const tones = swatch[scheme];
  const status = STATUS[scheme];

  return {
    themeId: template.id,
    accentId: swatch.id,
    scheme,
    radiusScale: template.radiusScale,
    colors: {
      ...surfaces,
      primary: tones.primary,
      onPrimary: tones.onPrimary,
      primaryLight: tones.tint,
      primaryDeep: tones.deep,
      primaryBright: swatch.dark.primary,
      primarySoft: swatch.dark.deep,
      highlight: status.highlight,
      highlightTint: status.highlightTint,
      highlightDeep: status.highlightDeep,
      highlightOn: status.highlightOn,
      positive: status.positive,
      negative: status.negative,
      warning: status.warning,
      track: scheme === "light" ? "#D9DCD6" : surfaces.border,
    },
  };
}

// ---- color math (also used by the tests and by platform adapters) ----

export function hexToRgb(hex: string): [number, number, number] {
  const value = hex.replace("#", "");
  const full = value.length === 3 ? value.split("").map((c) => c + c).join("") : value;
  return [parseInt(full.slice(0, 2), 16), parseInt(full.slice(2, 4), 16), parseInt(full.slice(4, 6), 16)];
}

function channelLuminance(channel: number): number {
  const c = channel / 255;
  return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

/** WCAG contrast ratio between two hex colors (1 to 21). */
export function contrastRatio(a: string, b: string): number {
  const lum = (hex: string) => {
    const [r, g, bl] = hexToRgb(hex);
    return 0.2126 * channelLuminance(r) + 0.7152 * channelLuminance(g) + 0.0722 * channelLuminance(bl);
  };
  const la = lum(a);
  const lb = lum(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

/** "r g b" channel string, the format CSS `rgb(var(--x) / <alpha>)` and NativeWind variables expect. */
export function toRgbChannels(hex: string): string {
  return hexToRgb(hex).join(" ");
}
