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
      // Text was reading too small across the app, so the whole scale was
      // bumped ~12.5% over Tailwind's RN defaults - that turned out to be
      // too much ("overdid it"), so this dials it back to roughly half
      // that bump (~6%) instead of reverting all the way to the
      // unreadably-small defaults. Mirrors the equivalent, also-halved
      // root font-size bump on web.
      fontSize: {
        xs: ["13px", { lineHeight: "17px" }],
        sm: ["15px", { lineHeight: "20px" }],
        base: ["17px", { lineHeight: "25px" }],
        lg: ["19px", { lineHeight: "27px" }],
        xl: ["21px", { lineHeight: "28px" }],
        "2xl": ["26px", { lineHeight: "31px" }],
        "3xl": ["32px", { lineHeight: "36px" }],
        "4xl": ["38px", { lineHeight: "42px" }],
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
