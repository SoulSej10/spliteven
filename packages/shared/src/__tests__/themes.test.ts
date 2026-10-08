import { describe, expect, it } from "vitest";
import {
  ACCENT_IDS,
  ACCENT_SWATCHES,
  THEME_IDS,
  THEME_TEMPLATES,
  contrastRatio,
  isAccentId,
  isThemeId,
  resolveTheme,
  toRgbChannels,
} from "../themes";

const HEX = /^#[0-9A-F]{6}$/i;
const SCHEMES = ["light", "dark"] as const;

describe("themes", () => {
  it("offers 4 templates (3 cute + classic) and 8 accents", () => {
    expect(THEME_IDS).toHaveLength(4);
    expect(ACCENT_IDS).toHaveLength(8);
  });

  it("every template's default accent exists", () => {
    for (const id of THEME_IDS) expect(isAccentId(THEME_TEMPLATES[id].defaultAccent)).toBe(true);
  });

  it("makes the cute themes rounder than classic, with distinct roundness", () => {
    const scales = THEME_IDS.map((id) => THEME_TEMPLATES[id].radiusScale);
    expect(THEME_TEMPLATES.classic.radiusScale).toBe(1);
    expect(new Set(scales).size).toBe(scales.length);
    for (const id of THEME_IDS) if (id !== "classic") expect(THEME_TEMPLATES[id].radiusScale).toBeGreaterThan(1);
  });

  it("resolves every theme x accent x scheme to valid hex colors", () => {
    for (const t of THEME_IDS)
      for (const a of ACCENT_IDS)
        for (const s of SCHEMES) {
          const { colors } = resolveTheme(t, a, s);
          for (const [key, value] of Object.entries(colors)) {
            expect(value, `${t}/${a}/${s}/${key}`).toMatch(HEX);
          }
        }
  });

  it("keeps text readable on every combination", () => {
    for (const t of THEME_IDS)
      for (const a of ACCENT_IDS)
        for (const s of SCHEMES) {
          const c = resolveTheme(t, a, s).colors;
          const label = `${t}/${a}/${s}`;
          expect(contrastRatio(c.foreground, c.background), `${label} body text`).toBeGreaterThanOrEqual(7);
          expect(contrastRatio(c.foreground, c.card), `${label} card text`).toBeGreaterThanOrEqual(7);
          expect(contrastRatio(c.mutedForeground, c.background), `${label} muted text`).toBeGreaterThanOrEqual(4);
          expect(contrastRatio(c.mutedForeground, c.card), `${label} muted on card`).toBeGreaterThanOrEqual(4);
          expect(contrastRatio(c.onPrimary, c.primary), `${label} button text`).toBeGreaterThanOrEqual(3);
          expect(contrastRatio(c.primaryDeep, c.primaryLight), `${label} accent text on tint`).toBeGreaterThanOrEqual(4);
        }
  });

  it("keeps the accent itself visible against the page in both schemes", () => {
    for (const t of THEME_IDS)
      for (const a of ACCENT_IDS)
        for (const s of SCHEMES) {
          const c = resolveTheme(t, a, s).colors;
          expect(contrastRatio(c.primary, c.card), `${t}/${a}/${s} accent on card`).toBeGreaterThanOrEqual(2.5);
        }
  });

  it("every accent has both tones and a unique primary per scheme", () => {
    for (const s of SCHEMES) {
      const primaries = ACCENT_IDS.map((id) => ACCENT_SWATCHES[id][s].primary);
      expect(new Set(primaries).size).toBe(primaries.length);
    }
  });

  it("falls back to classic/teal for unknown ids", () => {
    // @ts-expect-error deliberately invalid
    const resolved = resolveTheme("nope", "nope", "light");
    expect(resolved.themeId).toBe("classic");
    expect(resolved.accentId).toBe("teal");
    expect(isThemeId("nope")).toBe(false);
  });

  it("formats rgb channels", () => {
    expect(toRgbChannels("#2F8F7D")).toBe("47 143 125");
  });
});
