import { categoryColor } from "@evensplit/shared";
import { palette } from "./palette";

/** The current screen background is dark: pick the brighter category colours. */
function isDark(): boolean {
  const hex = palette.background.replace("#", "");
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b < 110;
}

// Category slices/bars use fixed, clearly different hues (not theme shades, which blur together).
const donut = () => Array.from({ length: 20 }, (_, i) => categoryColor(i, isDark()));
const bars = donut;

/** Array-like views that always read the *current* theme, so module-level chart constants never go stale. */
function liveArray(read: () => string[]): string[] {
  return new Proxy([] as string[], {
    get: (_target, prop) => Reflect.get(read(), prop),
  });
}

export const DONUT_COLORS = liveArray(donut);
export const BAR_COLORS = liveArray(bars);
