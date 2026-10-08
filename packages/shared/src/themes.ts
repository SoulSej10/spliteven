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
  /** Readable shade for accent-colored text and icons: darker in light mode, lighter in dark mode. */
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
    name: "Sakura",
    tagline: "Clean white, soft pink",
    radiusScale: 1.5,
    defaultAccent: "rose",
    light: {
      background: "#FAF8F7",
      foreground: "#2A2528",
      card: "#FFFFFF",
      muted: "#F3F0EF",
      mutedForeground: "#756F72",
      border: "#ECE8E6",
    },
    dark: {
      background: "#14151B",
      foreground: "#EEEDF1",
      card: "#1C1E26",
      muted: "#262932",
      mutedForeground: "#9FA2AE",
      border: "#2C2F39",
    },
  },
  lavender: {
    id: "lavender",
    name: "Lavender",
    tagline: "Clean white, soft purple",
    radiusScale: 1.25,
    defaultAccent: "periwinkle",
    light: {
      background: "#FAF8F7",
      foreground: "#2A2528",
      card: "#FFFFFF",
      muted: "#F3F0EF",
      mutedForeground: "#756F72",
      border: "#ECE8E6",
    },
    dark: {
      background: "#14151B",
      foreground: "#EEEDF1",
      card: "#1C1E26",
      muted: "#262932",
      mutedForeground: "#9FA2AE",
      border: "#2C2F39",
    },
  },
  peach: {
    id: "peach",
    name: "Peach",
    tagline: "Clean white, soft peach",
    radiusScale: 1.1,
    defaultAccent: "peach",
    light: {
      background: "#FAF8F7",
      foreground: "#2A2528",
      card: "#FFFFFF",
      muted: "#F3F0EF",
      mutedForeground: "#756F72",
      border: "#ECE8E6",
    },
    dark: {
      background: "#14151B",
      foreground: "#EEEDF1",
      card: "#1C1E26",
      muted: "#262932",
      mutedForeground: "#9FA2AE",
      border: "#2C2F39",
    },
  },
};

export const ACCENT_SWATCHES: Record<AccentId, AccentSwatch> = {
  // Teal is the original brand color, kept exactly as it was for the Classic look.
  teal: {
    id: "teal",
    name: "Teal",
    light: { primary: "#2F8F7D", onPrimary: "#FFFFFF", tint: "#E8F4F0", deep: "#2F8F7D" },
    dark: { primary: "#5FBBA5", onPrimary: "#16211B", tint: "#243A32", deep: "#5FBBA5" },
  },
  // The rest are soft pastels: gentle fills with dark ink on top, plus a deeper
  // (light mode) or lighter (dark mode) shade, `deep`, for accent-colored text.
  rose: {
    id: "rose",
    name: "Rose",
    light: { primary: "#F7C3D6", onPrimary: "#5C2440", tint: "#FEF1F6", deep: "#A65573" },
    dark: { primary: "#CC9DB4", onPrimary: "#2A1620", tint: "#3C2E37", deep: "#E8BCCD" },
  },
  peach: {
    id: "peach",
    name: "Peach",
    light: { primary: "#F8C4A8", onPrimary: "#5A2F1A", tint: "#FEEEE4", deep: "#A8501F" },
    dark: { primary: "#E2AE96", onPrimary: "#2B1A12", tint: "#473529", deep: "#F5CDB9" },
  },
  honey: {
    id: "honey",
    name: "Honey",
    light: { primary: "#F7DE9E", onPrimary: "#4D3A0C", tint: "#FCF3DC", deep: "#7F5A08" },
    dark: { primary: "#DFC384", onPrimary: "#2B2108", tint: "#433A22", deep: "#F2DCA6" },
  },
  mint: {
    id: "mint",
    name: "Mint",
    light: { primary: "#ADE3CE", onPrimary: "#1F4A3B", tint: "#E7F7F1", deep: "#1F7458" },
    dark: { primary: "#8FCDB6", onPrimary: "#10241D", tint: "#243A33", deep: "#B9E6D4" },
  },
  sky: {
    id: "sky",
    name: "Sky",
    light: { primary: "#B1D8F3", onPrimary: "#1F4660", tint: "#E8F3FC", deep: "#28679A" },
    dark: { primary: "#95C0DE", onPrimary: "#0F2230", tint: "#233748", deep: "#BFDDF0" },
  },
  periwinkle: {
    id: "periwinkle",
    name: "Periwinkle",
    light: { primary: "#C1BCF6", onPrimary: "#33307A", tint: "#EFEDFD", deep: "#4A44A6" },
    dark: { primary: "#A8A2E3", onPrimary: "#1B1738", tint: "#35305A", deep: "#CBC7F4" },
  },
  orchid: {
    id: "orchid",
    name: "Orchid",
    light: { primary: "#E1BAF1", onPrimary: "#4C2563", tint: "#F6EBFC", deep: "#78399A" },
    dark: { primary: "#C69EDC", onPrimary: "#26132F", tint: "#41304D", deep: "#E4C6F1" },
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
    positive: "#2F9479",
    negative: "#CF6B6B",
    warning: "#D99A2B",
    highlight: "#F0A93B",
    highlightTint: "#FDF1DC",
    highlightDeep: "#B9790F",
    highlightOn: "#3A2A0C",
  },
  dark: {
    positive: "#5ECFA8",
    negative: "#E59494",
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
  /** The accent's dark-mode text shade: for text/icons that must pop on dark surfaces. */
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
      primaryBright: swatch.dark.deep,
      primarySoft: swatch.dark.primary,
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
