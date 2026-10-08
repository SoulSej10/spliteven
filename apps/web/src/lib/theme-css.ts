import { ACCENT_IDS, ACCENT_SWATCHES, THEME_IDS, THEME_TEMPLATES, resolveTheme, type ColorScheme } from "@evensplit/shared";

const BASE_RADIUS_REM = 0.4;

function block(selector: string, vars: Record<string, string>): string {
  const body = Object.entries(vars)
    .map(([name, value]) => `${name}:${value};`)
    .join("");
  return `${selector}{${body}}`;
}

function schemeSelector(attribute: string, value: string, scheme: ColorScheme): string {
  // html[...] / html.dark[...] out-rank the base `:root` and `.dark` rules in globals.css.
  return scheme === "light" ? `html[${attribute}="${value}"]` : `html.dark[${attribute}="${value}"]`;
}

/**
 * CSS for every template and accent, generated from the shared theme data so
 * web and mobile can never drift apart. Classic needs no template block - it
 * is the base :root/.dark styling in globals.css - but the Classic *accent*
 * (teal) does get one, so picking it inside another template restores teal.
 */
export function buildThemeCss(): string {
  const rules: string[] = [];

  for (const themeId of THEME_IDS) {
    if (themeId === "classic") continue;
    for (const scheme of ["light", "dark"] as const) {
      const { colors, radiusScale } = resolveTheme(themeId, THEME_TEMPLATES[themeId].defaultAccent, scheme);
      rules.push(
        block(schemeSelector("data-theme", themeId, scheme), {
          "--background": colors.background,
          "--foreground": colors.foreground,
          "--card": colors.card,
          "--card-foreground": colors.foreground,
          "--popover": colors.card,
          "--popover-foreground": colors.foreground,
          "--muted": colors.muted,
          "--muted-foreground": colors.mutedForeground,
          "--border": colors.border,
          "--input": colors.border,
          "--sidebar": colors.card,
          "--sidebar-foreground": colors.foreground,
          "--sidebar-border": colors.border,
          "--positive": colors.positive,
          "--negative": colors.negative,
          "--destructive": colors.negative,
          "--warning": colors.warning,
          "--accent": colors.highlight,
          "--accent-foreground": colors.highlightOn,
          "--accent-light": colors.highlightTint,
          "--radius": `${(BASE_RADIUS_REM * radiusScale).toFixed(3)}rem`,
        })
      );
    }
  }

  // Accents come after templates so the chosen accent always wins for brand colors.
  for (const accentId of ACCENT_IDS) {
    for (const scheme of ["light", "dark"] as const) {
      const tones = ACCENT_SWATCHES[accentId][scheme];
      rules.push(
        block(schemeSelector("data-accent", accentId, scheme), {
          "--primary": tones.primary,
          "--primary-foreground": tones.onPrimary,
          "--primary-light": tones.tint,
          "--primary-deep": tones.deep,
          "--secondary": tones.tint,
          "--secondary-foreground": tones.deep,
          "--ring": tones.deep,
          "--chart-1": tones.primary,
          "--sidebar-primary": tones.primary,
          "--sidebar-primary-foreground": tones.onPrimary,
          "--sidebar-accent": tones.tint,
          "--sidebar-accent-foreground": tones.deep,
          "--sidebar-ring": tones.deep,
        })
      );
    }
  }

  return rules.join("\n");
}
