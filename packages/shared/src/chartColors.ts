/**
 * Colours for chart slices and bars that stand for *categories* (pie/donut slices, legend dots, bars).
 * They are deliberately not taken from the app theme: theme shades of one hue look almost the same
 * side by side, so neighbouring slices couldn't be told apart. These are ten clearly different hues,
 * ordered so that adjacent entries contrast, with a brighter set for dark backgrounds.
 */
const LIGHT = [
  "#2F8F7D", // teal
  "#F5A524", // amber
  "#4C78DB", // blue
  "#D95F5F", // coral
  "#8B5CC6", // violet
  "#7BA339", // olive green
  "#E07BB0", // pink
  "#3FB6D9", // sky
  "#B5651D", // brown
  "#6B7280", // slate
] as const;

const DARK = [
  "#4FD1B5",
  "#FFC857",
  "#6FA0FF",
  "#FF7A7A",
  "#B58CFF",
  "#A5D65A",
  "#FF8FC7",
  "#5BD0F0",
  "#E0985B",
  "#9CA3AF",
] as const;

function lighten(hex: string, amount: number): string {
  const n = parseInt(hex.slice(1), 16);
  const mix = (c: number) => Math.round(c + (255 - c) * amount);
  const r = mix((n >> 16) & 255);
  const g = mix((n >> 8) & 255);
  const b = mix(n & 255);
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
}

/** The colour for the i-th category. Past ten categories the hues repeat, lightened, so a repeat still differs from its first use. */
export function categoryColor(index: number, dark: boolean): string {
  const set = dark ? DARK : LIGHT;
  const base = set[index % set.length];
  const round = Math.floor(index / set.length);
  return round === 0 ? base : lighten(base, Math.min(0.55, 0.3 * round));
}
