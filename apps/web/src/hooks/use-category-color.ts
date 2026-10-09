"use client";

import { useTheme } from "next-themes";
import { categoryColor } from "@evensplit/shared";

/** Returns the colour for the i-th chart category, with a brighter set on dark backgrounds. */
export function useCategoryColor() {
  const { resolvedTheme } = useTheme();
  const dark = resolvedTheme === "dark";
  return (index: number) => categoryColor(index, dark);
}
