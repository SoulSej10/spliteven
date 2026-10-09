"use client";

import { useTheme } from "next-themes";
import { Check } from "@phosphor-icons/react";
import { ACCENT_IDS, ACCENT_SWATCHES, THEME_IDS, THEME_TEMPLATES, resolveTheme, type AccentId, type ThemeId } from "@evensplit/shared";
import { saveAppearance, useWebAppearance } from "@/lib/appearance";

/** Theme template and accent color, the same choices as the phone app. Applies instantly inside your account. */
export function AppearancePicker() {
  const { resolvedTheme } = useTheme();
  const scheme = resolvedTheme === "dark" ? "dark" : "light";
  const { themeId, accentId } = useWebAppearance();

  function pickTheme(id: ThemeId) {
    // A template ships with its own matching accent; the swatches still let you override it.
    saveAppearance({ themeId: id, accentId: THEME_TEMPLATES[id].defaultAccent });
  }
  function pickAccent(id: AccentId) {
    saveAppearance({ themeId, accentId: id });
  }

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Theme</p>
        <div className="grid grid-cols-2 gap-3">
          {THEME_IDS.map((id) => {
            const template = THEME_TEMPLATES[id];
            const { colors } = resolveTheme(id, template.defaultAccent, scheme);
            const selected = id === themeId;
            return (
              <button
                key={id}
                type="button"
                onClick={() => pickTheme(id)}
                aria-pressed={selected}
                className={`space-y-2 rounded-xl border-2 p-2 text-left transition-colors ${
                  selected ? "border-primary" : "border-border"
                }`}
              >
                <div
                  className="flex h-16 items-center justify-center p-2"
                  style={{ backgroundColor: colors.background, borderRadius: 8 * template.radiusScale }}
                >
                  <div className="w-full space-y-1.5 p-2" style={{ backgroundColor: colors.card, borderRadius: 8 * template.radiusScale }}>
                    <div style={{ height: 6, width: "60%", borderRadius: 3, backgroundColor: colors.mutedForeground, opacity: 0.35 }} />
                    <div style={{ height: 14, borderRadius: 5 * template.radiusScale, backgroundColor: colors.primary }} />
                  </div>
                </div>
                <div>
                  <p className="flex items-center gap-1 text-[13px] font-semibold">
                    {template.name}
                    {selected && <Check className="h-3 w-3" weight="bold" />}
                  </p>
                  <p className="text-[11px] leading-[14px] text-muted-foreground">{template.tagline}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Color</p>
        <div className="flex flex-wrap gap-3">
          {ACCENT_IDS.map((id) => {
            const tones = ACCENT_SWATCHES[id][scheme];
            const selected = id === accentId;
            return (
              <button
                key={id}
                type="button"
                onClick={() => pickAccent(id)}
                aria-label={ACCENT_SWATCHES[id].name}
                aria-pressed={selected}
                className="flex h-11 w-11 items-center justify-center rounded-full"
                style={{ backgroundColor: tones.primary, boxShadow: selected ? `0 0 0 3px ${tones.deep}` : undefined }}
              >
                {selected && <Check className="h-[18px] w-[18px]" weight="bold" style={{ color: tones.onPrimary }} />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
