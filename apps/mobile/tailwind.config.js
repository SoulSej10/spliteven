/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  darkMode: "class",
  theme: {
    extend: {
      // SplitEven brand tokens v8 — same teal-green family kept (a prior
      // plum/indigo hue swap was tried and reverted per feedback), but
      // desaturated and lightened per "too strong, not the right vibe, do
      // a friendlier makeover": the old primary (#16A88F) and dark-mode
      // bright variant (#35D6B5) read as neon, and the dark-mode background
      // (#0A120D) was near-black. Both are toned down here while staying
      // recognizably the same brand color, not a hue change.
      colors: {
        primary: {
          DEFAULT: "#2F8F7D",
          light: "#E8F4F0",
          bright: "#5FBBA5", // for dark-mode text/icons on the dark bg
          soft: "#86CDBB",
          deep: "#1F6355", // for gradients / pressed states
        },
        accent: {
          DEFAULT: "#F5A524", // warm amber - CTAs, streaks, highlights
          light: "#FDF1DC",
          deep: "#B9790F",
        },
        positive: "#009B87", // emerald - financial gains only, never decorative
        negative: "#D95F5F", // soft coral/red
        warning: "#E0A63A", // warm amber
        surface: "#FFFFFF",
        neutral: {
          900: "#16211B", // dark-mode screen background — softened from near-black for a friendlier feel
          500: "#6B7169",
          100: "#F4F5F3",
        },
        // Dark mode card surface (applied via `dark:bg-surface-dark`) — a
        // visible step lighter than neutral-900 so cards actually read as
        // raised against the background.
        "surface-dark": "#1E2E27",
      },
      // Font swapped from Plus Jakarta Sans to Sora per feedback ("too
      // standard, give it character but still comprehensive") - Sora's
      // rounded, slightly geometric letterforms read as more distinctive
      // while staying just as legible at small sizes. Mirrors the web
      // font swap in layout.tsx.
      fontFamily: {
        sans: ["Sora_400Regular"],
        medium: ["Sora_500Medium"],
        semibold: ["Sora_600SemiBold"],
        bold: ["Sora_700Bold"],
        extrabold: ["Sora_800ExtraBold"],
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
      // v3: less "stadium pill", more geometric edge per feedback - buttons
      // and chips now use a modest rounded-rect instead of a full capsule.
      // Circles (avatars, FABs) are unaffected since those use `rounded-full`
      // directly, not this token.
      // v4: cards were still reading as "over-rounded / generic" per
      // feedback - card radius nudged down again for a semi-soft, more
      // deliberate edge (not fully squared, not a soft blob).
      borderRadius: {
        card: "14px",
        pill: "10px",
      },
    },
  },
  plugins: [],
};
