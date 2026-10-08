import { palette } from "./palette";

const donut = () => [palette.primary, palette.primaryBright, palette.highlight, palette.positive, palette.negative, palette.muted];
const bars = () => [palette.primary, palette.positive, palette.warning, palette.muted, palette.negative, palette.primaryBright];

/** Array-like views that always read the *current* theme, so module-level chart constants never go stale. */
function liveArray(read: () => string[]): string[] {
  return new Proxy([] as string[], {
    get: (_target, prop) => Reflect.get(read(), prop),
  });
}

export const DONUT_COLORS = liveArray(donut);
export const BAR_COLORS = liveArray(bars);
