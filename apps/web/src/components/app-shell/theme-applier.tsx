"use client";

import { useLayoutEffect } from "react";
import { useTheme } from "next-themes";
import { themeCssVars, useWebAppearance } from "@/lib/appearance";

/**
 * Applies the signed-in user's chosen theme and accent color to the page. It only exists inside the
 * authenticated shell, and removes everything it set when the shell unmounts, so the landing page,
 * login and other public pages always use the default green.
 */
export function ThemeApplier() {
  const appearance = useWebAppearance();
  const { resolvedTheme } = useTheme();
  const scheme = resolvedTheme === "dark" ? "dark" : "light";

  useLayoutEffect(() => {
    const root = document.documentElement;
    const vars = themeCssVars(appearance, scheme);
    for (const [name, value] of Object.entries(vars)) root.style.setProperty(name, value);
    return () => {
      for (const name of Object.keys(vars)) root.style.removeProperty(name);
    };
  }, [appearance, scheme]);

  return null;
}
