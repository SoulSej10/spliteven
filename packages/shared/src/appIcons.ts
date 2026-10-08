/**
 * Group, account and category icons are stored as emoji strings in the
 * database. Rather than render those system emoji (which look different on
 * every device and clash with the soft themes), both apps draw the matching
 * duotone line icon in the user's accent color. Old rows keep working because
 * the stored value is unchanged: this file only says which drawing goes with
 * which stored value. Anything not listed here still renders as the emoji.
 */
export type AppIconName =
  | "UsersThree"
  | "House"
  | "Airplane"
  | "Pizza"
  | "Confetti"
  | "Coins"
  | "Car"
  | "BeachBall"
  | "Money"
  | "CreditCard"
  | "Wallet"
  | "Bank"
  | "PiggyBank"
  | "ChartLineUp"
  | "Coin"
  | "Vault"
  | "Diamond"
  | "Receipt"
  | "Target"
  | "ShoppingCart"
  | "Hamburger"
  | "Lightbulb"
  | "FilmSlate"
  | "Pill"
  | "Books"
  | "Gift"
  | "DeviceMobile"
  | "ShoppingBag"
  | "Tag"
  | "Mountains"
  | "ForkKnife"
  | "Coffee"
  | "Heart"
  | "Briefcase";

export const EMOJI_TO_ICON: Record<string, AppIconName> = {
  "👥": "UsersThree",
  "🏠": "House",
  "✈️": "Airplane",
  "🍕": "Pizza",
  "🎉": "Confetti",
  "💰": "Coins",
  "🚗": "Car",
  "🏖️": "BeachBall",
  "💵": "Money",
  "💳": "CreditCard",
  "👛": "Wallet",
  "🏦": "Bank",
  "🐷": "PiggyBank",
  "📈": "ChartLineUp",
  "🪙": "Coin",
  "🏧": "Vault",
  "💎": "Diamond",
  "🧾": "Receipt",
  "🎯": "Target",
  "🛒": "ShoppingCart",
  "🍔": "Hamburger",
  "💡": "Lightbulb",
  "🎬": "FilmSlate",
  "💊": "Pill",
  "📚": "Books",
  "🎁": "Gift",
  "📱": "DeviceMobile",
  "🛍️": "ShoppingBag",
  "🏷️": "Tag",
  "🏔️": "Mountains",
  "⛰️": "Mountains",
  "🍽️": "ForkKnife",
  "☕": "Coffee",
  "❤️": "Heart",
  "💼": "Briefcase",
};

/** Emoji can arrive with or without the variation selector; match either way. */
export function iconNameFor(value: string | null | undefined): AppIconName | null {
  if (!value) return null;
  const trimmed = value.trim();
  return EMOJI_TO_ICON[trimmed] ?? EMOJI_TO_ICON[trimmed.replace(/️/g, "")] ?? EMOJI_TO_ICON[`${trimmed}️`] ?? null;
}

export const GROUP_ICON_OPTIONS = ["👥", "🏠", "✈️", "🍕", "🎉", "💰", "🚗", "🏖️"];
export const ACCOUNT_ICON_OPTIONS = ["💵", "💳", "👛", "🏦", "🐷", "📈", "💰", "🪙", "🏧", "💎", "🧾", "🎯"];
export const CATEGORY_ICON_OPTIONS = ["🛒", "🍔", "🚗", "🏠", "💡", "🎬", "💊", "📚", "✈️", "💰", "🎁", "📱"];
