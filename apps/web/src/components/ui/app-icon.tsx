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
  type Icon,
} from "@phosphor-icons/react";
import { iconNameFor, type AppIconName } from "@evensplit/shared";

const ICONS: Record<AppIconName, Icon> = {
  UsersThree, House, Airplane, Pizza, Confetti, Coins, Car, BeachBall, Money, CreditCard, Wallet, Bank, PiggyBank,
  ChartLineUp, Coin, Vault, Diamond, Receipt, Target, ShoppingCart, Hamburger, Lightbulb, FilmSlate, Pill, Books,
  Gift, DeviceMobile, ShoppingBag, Tag, Mountains, ForkKnife, Coffee, Heart, Briefcase,
};

/**
 * Draws the stored group/account/category icon (an emoji string) as a duotone
 * line icon in the accent color, so it follows the theme instead of the
 * device's emoji set. Values with no matching drawing fall back to the emoji.
 */
export function AppIcon({
  value,
  fallback,
  size = 20,
  className,
}: {
  value?: string | null;
  fallback?: string;
  size?: number;
  className?: string;
}) {
  const stored = value || fallback || "";
  const name = iconNameFor(stored);
  const Component = name ? ICONS[name] : null;
  if (!Component) return <span style={{ fontSize: size * 0.95 }}>{stored}</span>;
  return <Component size={size} weight="duotone" className={className ?? "text-primary-deep"} aria-hidden />;
}
