/** @type {import('tailwindcss').Config} */

// Colors and corner radii are CSS variables supplied at runtime by
// src/theme/ThemeProvider.tsx (values built in src/theme/vars.ts from the
// shared theme data in packages/shared/src/themes.ts), so one className like
// `bg-primary` or `rounded-card` follows whichever template + accent the user
// picked, in light or dark. `<alpha-value>` keeps opacity suffixes (bg-primary/20) working.
const color = (name) => `rgb(var(--c-${name}) / <alpha-value>)`;

module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: color("primary"),
          light: color("primary-light"),
          bright: color("primary-bright"), // for dark-mode text/icons on the dark bg
          soft: color("primary-soft"),
          deep: color("primary-deep"), // for gradients / pressed states
        },
        // Text/icons that sit on top of `primary` (white on deep accents, dark ink on light ones).
        "on-primary": color("on-primary"),
        accent: {
          DEFAULT: color("accent"), // warm amber - CTAs, streaks, highlights
          light: color("accent-light"),
          deep: color("accent-deep"),
        },
        positive: color("positive"), // financial gains only, never decorative
        negative: color("negative"),
        warning: color("warning"),
        surface: color("surface"),
        neutral: {
          900: color("n900"),
          700: color("n700"),
          500: color("n500"),
          300: color("n300"),
          200: color("n200"),
          100: color("n100"),
        },
        // Dark mode card surface (applied via `dark:bg-surface-dark`).
        "surface-dark": color("surface-dark"),
      },
      // Bricolage Grotesque: a characterful grotesque with quirky curves, picked so the
      // app has its own personality instead of a generic UI face. Files live in assets/fonts
      // and are loaded in app/_layout.tsx. Mirrors the web font in layout.tsx.
      fontFamily: {
        sans: ["Bricolage_400Regular"],
        medium: ["Bricolage_500Medium"],
        semibold: ["Bricolage_600SemiBold"],
        bold: ["Bricolage_700Bold"],
        extrabold: ["Bricolage_800ExtraBold"],
      },
      // Type sizes are variables set from the real window width (src/theme/responsive.ts), so
      // text scales a little with the screen instead of being one fixed size on every phone.
      fontSize: {
        xs: ["var(--fs-xs)", { lineHeight: "var(--lh-xs)" }],
        sm: ["var(--fs-sm)", { lineHeight: "var(--lh-sm)" }],
        base: ["var(--fs-base)", { lineHeight: "var(--lh-base)" }],
        lg: ["var(--fs-lg)", { lineHeight: "var(--lh-lg)" }],
        xl: ["var(--fs-xl)", { lineHeight: "var(--lh-xl)" }],
        "2xl": ["var(--fs-2xl)", { lineHeight: "var(--lh-2xl)" }],
        "3xl": ["var(--fs-3xl)", { lineHeight: "var(--lh-3xl)" }],
        "4xl": ["var(--fs-4xl)", { lineHeight: "var(--lh-4xl)" }],
      },
      // The whole radius scale follows the theme template (Classic is the
      // tightest, Sakura Milk the bubbliest); `rounded-full` (circles,
      // avatars, FABs) is unaffected. At scale 1 these match the previous
      // fixed values: card 14px, pill 10px.
      borderRadius: {
        md: "var(--r-md)",
        lg: "var(--r-lg)",
        xl: "var(--r-xl)",
        "2xl": "var(--r-2xl)",
        "3xl": "var(--r-3xl)",
        card: "var(--r-card)",
        pill: "var(--r-pill)",
      },
    },
  },
  plugins: [],
};
