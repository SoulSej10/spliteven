"use client";

import { useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import { Check } from "@phosphor-icons/react";
import {
  ACCENT_IDS,
  ACCENT_SWATCHES,
  THEME_IDS,
  THEME_TEMPLATES,
  resolveTheme,
  type AccentId,
  type ThemeId,
} from "@evensplit/shared";
import {
  SERVER_APPEARANCE_SNAPSHOT,
  applyAppearance,
  getAppearanceSnapshot,
  parseAppearanceSnapshot,
  subscribeAppearance,
} from "@/lib/appearance";
import { cn } from "@/lib/utils";

/** Template + accent pickers. Choices apply instantly and are remembered on this device. */
export function AppearancePicker() {
  const { resolvedTheme } = useTheme();
  const scheme = resolvedTheme === "dark" ? "dark" : "light";
  const snapshot = useSyncExternalStore(subscribeAppearance, getAppearanceSnapshot, () => SERVER_APPEARANCE_SNAPSHOT);
  const { themeId, accentId } = parseAppearanceSnapshot(snapshot);

  function chooseTheme(next: ThemeId) {
    // A template ships with its own matching accent; the swatches below still let you override it.
    applyAppearance({ themeId: next, accentId: THEME_TEMPLATES[next].defaultAccent });
  }

  function chooseAccent(next: AccentId) {
    applyAppearance({ themeId, accentId: next });
  }

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Theme</p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {THEME_IDS.map((id) => {
            const template = THEME_TEMPLATES[id];
            const { colors } = resolveTheme(id, template.defaultAccent, scheme);
            const selected = id === themeId;
            return (
              <button
                key={id}
                type="button"
                aria-pressed={selected}
                onClick={() => chooseTheme(id)}
                className={cn(
                  "group rounded-xl border-2 p-2 text-left transition-colors",
                  selected ? "border-primary" : "border-border hover:border-primary/40"
                )}
              >
                <div
                  className="flex h-20 items-center justify-center p-2"
                  style={{ background: colors.background, borderRadius: `${8 * template.radiusScale}px` }}
                >
                  <div
                    className="w-full space-y-1.5 p-2 shadow-sm"
                    style={{ background: colors.card, borderRadius: `${8 * template.radiusScale}px` }}
                  >
                    <div
                      className="h-2 w-2/3"
                      style={{ background: colors.mutedForeground, opacity: 0.35, borderRadius: 999 }}
                    />
                    <div
                      className="h-4 w-full"
                      style={{ background: colors.primary, borderRadius: `${5 * template.radiusScale}px` }}
                    />
                  </div>
                </div>
                <p className="mt-2 flex items-center gap-1 text-[13px] font-semibold">
                  {template.name}
                  {selected && <Check className="h-3.5 w-3.5 text-primary-deep" weight="bold" />}
                </p>
                <p className="text-[11px] leading-tight text-muted-foreground">{template.tagline}</p>
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Color</p>
        <div className="flex flex-wrap gap-3" role="radiogroup" aria-label="Accent color">
          {ACCENT_IDS.map((id) => {
            const tones = ACCENT_SWATCHES[id][scheme];
            const selected = id === accentId;
            return (
              <button
                key={id}
                type="button"
                role="radio"
                aria-checked={selected}
                aria-label={ACCENT_SWATCHES[id].name}
                title={ACCENT_SWATCHES[id].name}
                onClick={() => chooseAccent(id)}
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-full transition-transform hover:scale-105",
                  selected && "ring-2 ring-offset-2 ring-offset-card"
                )}
                style={{ background: tones.primary, ["--tw-ring-color" as string]: tones.deep }}
              >
                {selected && <Check className="h-4 w-4" weight="bold" style={{ color: tones.onPrimary }} />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
