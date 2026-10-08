import { vars } from "nativewind";
import { toRgbChannels, type ResolvedTheme } from "@evensplit/shared";

/** Base corner radii (px) at scale 1; every theme multiplies these. */
const BASE_RADII = { md: 6, lg: 8, xl: 12, "2xl": 16, "3xl": 24, card: 14, pill: 10 } as const;

/**
 * NativeWind variables for one resolved theme. tailwind.config.js points every
 * color token and rounded-* size at these, so a theme change restyles all
 * className-based styling at once.
 */
export function buildThemeVars(theme: ResolvedTheme) {
  const { colors, scheme, radiusScale } = theme;
  const isLight = scheme === "light";
  const channels = toRgbChannels;

  const radius = Object.fromEntries(
    Object.entries(BASE_RADII).map(([name, px]) => [`--r-${name}`, Math.round(px * radiusScale)])
  );

  return vars({
    "--c-primary": channels(colors.primary),
    "--c-primary-light": channels(colors.primaryLight),
    "--c-primary-bright": channels(colors.primaryBright),
    "--c-primary-soft": channels(colors.primarySoft),
    "--c-primary-deep": channels(colors.primaryDeep),
    "--c-on-primary": channels(colors.onPrimary),
    "--c-accent": channels(colors.highlight),
    "--c-accent-light": channels(colors.highlightTint),
    "--c-accent-deep": channels(colors.highlightDeep),
    "--c-positive": channels(colors.positive),
    "--c-negative": channels(colors.negative),
    "--c-warning": channels(colors.warning),
    "--c-surface": channels(colors.card),
    "--c-surface-dark": channels(colors.card),
    // Neutral scale, kept semantic: 100 is the "light" end and 900 the "dark" end of the
    // way the app already uses them (bg-neutral-100 dark:bg-neutral-900, text-neutral-900 dark:text-neutral-100).
    "--c-n100": channels(isLight ? colors.background : colors.foreground),
    "--c-n200": channels(colors.border),
    "--c-n300": channels(colors.border),
    "--c-n500": channels(colors.mutedForeground),
    "--c-n700": channels(colors.foreground),
    "--c-n900": channels(isLight ? colors.foreground : colors.background),
    ...radius,
  });
}
