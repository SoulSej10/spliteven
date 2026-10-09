import { vars } from "nativewind";

/**
 * Type scale at a 390dp-wide screen. The app's text sizes (`text-sm`, `text-xl`...)
 * are CSS variables set from the real window width, so the same classNames render a
 * little smaller on narrow phones and a little larger on wide ones, instead of one
 * fixed size everywhere. Same mechanism as the theme's corner radii: tailwind.config.js
 * points fontSize at `var(--fs-*)` / `var(--lh-*)`, and AppThemeProvider supplies them.
 */
export const BASE_FONT_SIZES = {
  xs: 12,
  sm: 13.5,
  base: 15.5,
  lg: 17.5,
  xl: 19.5,
  "2xl": 23,
  "3xl": 28,
  "4xl": 34,
} as const;

const REFERENCE_WIDTH = 390;
const MIN_SCALE = 0.9;
const MAX_SCALE = 1.12;

/** How much to scale type for a screen this many dp wide. */
export function fontScaleForWidth(width: number): number {
  if (!Number.isFinite(width) || width <= 0) return 1;
  return Math.min(MAX_SCALE, Math.max(MIN_SCALE, width / REFERENCE_WIDTH));
}

const half = (n: number) => Math.round(n * 2) / 2;

/** NativeWind variables for the font sizes and line heights at this window width. */
export function buildResponsiveVars(width: number) {
  const scale = fontScaleForWidth(width);
  const entries: Record<string, number> = {};
  for (const [name, px] of Object.entries(BASE_FONT_SIZES)) {
    const size = half(px * scale);
    entries[`--fs-${name}`] = size;
    entries[`--lh-${name}`] = Math.round(size * 1.35);
  }
  return vars(entries);
}
