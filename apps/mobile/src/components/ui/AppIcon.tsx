import { Text } from "@/components/ui/typography";
import type { Icon } from "phosphor-react-native";
import {
  Airplane,
  Bank,
  BeachBall,
  Books,
  Briefcase,
  Coffee,
  ForkKnife,
  Heart,
  Mountains,
  Car,
  ChartLineUp,
  Coin,
  Coins,
  Confetti,
  CreditCard,
  DeviceMobile,
  Diamond,
  FilmSlate,
  Gift,
  Hamburger,
  House,
  Lightbulb,
  Money,
  PiggyBank,
  Pill,
  Pizza,
  Receipt,
  ShoppingBag,
  ShoppingCart,
  Tag,
  Target,
  UsersThree,
  Vault,
  Wallet,
} from "phosphor-react-native";
import { iconNameFor, type AppIconName } from "@evensplit/shared";
import { palette } from "@/theme/palette";

const ICONS: Record<AppIconName, Icon> = {
  UsersThree, House, Airplane, Pizza, Confetti, Coins, Car, BeachBall, Money, CreditCard, Wallet, Bank, PiggyBank,
  ChartLineUp, Coin, Vault, Diamond, Receipt, Target, ShoppingCart, Hamburger, Lightbulb, FilmSlate, Pill, Books,
  Gift, DeviceMobile, ShoppingBag, Tag, Mountains, ForkKnife, Coffee, Heart, Briefcase,
};

/**
 * Draws the stored group/account/category icon (an emoji string) as a duotone
 * line icon in the user's accent color, so it follows the theme instead of the
 * device's emoji set. Values with no matching drawing fall back to the emoji.
 */
export function AppIcon({ value, fallback, size = 20 }: { value?: string | null; fallback?: string; size?: number }) {
  const stored = value || fallback || "";
  const name = iconNameFor(stored);
  const Component = name ? ICONS[name] : null;
  if (!Component) return <Text style={{ fontSize: size * 0.95 }}>{stored}</Text>;
  return <Component size={size} weight="duotone" color={palette.primary} />;
}
