"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { CaretLeft, ChartBar, House, Users, Wallet } from "@phosphor-icons/react";
import type { ComponentType } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/app-shell/top-bar";
import { useBreadcrumbLabel } from "@/components/app-shell/breadcrumb-context";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

interface Tab {
  href: string;
  label: string;
  icon: ComponentType<{ className?: string; weight?: "regular" | "fill" }>;
  match: (pathname: string) => boolean;
}

/** The same four destinations as the phone app's bottom tab bar. */
const TABS: Tab[] = [
  { href: "/dashboard", label: "Home", icon: House, match: (p) => p === "/dashboard" },
  { href: "/groups", label: "Groups", icon: Users, match: (p) => p.startsWith("/groups") },
  { href: "/personal/overview", label: "Finances", icon: Wallet, match: (p) => p.startsWith("/personal") },
  { href: "/insights", label: "Insights", icon: ChartBar, match: (p) => p.startsWith("/insights") },
];

/** Pages that live directly under a tab show the avatar; deeper pages get a back arrow. */
function isTopLevel(pathname: string) {
  if (pathname.startsWith("/personal")) return !pathname.startsWith("/personal/analysis/");
  return ["/dashboard", "/groups", "/insights"].includes(pathname);
}

const NESTED_TITLES: [string, string][] = [
  ["/settings/profile", "Profile & currency"],
  ["/settings/security", "Security"],
  ["/settings/data", "Export & import"],
  ["/settings/appearance", "Appearance"],
  ["/settings/notifications", "Notifications"],
  ["/settings/about", "About"],
  ["/settings/currency-rates", "Currency rates"],
  ["/settings", "Settings"],
  ["/personal/analysis", "Category trail"],
  ["/upgrade", "Upgrade"],
];

/**
 * Phone-width bottom tab bar (below lg), mirroring the phone app: fixed, full width,
 * Home / Groups / Finances / Insights, sitting above the home-indicator safe area.
 */
export function MobileTabBar() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 backdrop-blur lg:hidden"
      style={{ paddingBottom: "max(env(safe-area-inset-bottom), 0.5rem)" }}
    >
      <ul className="mx-auto grid max-w-xl grid-cols-4">
        {TABS.map((tab) => {
          const active = tab.match(pathname);
          return (
            <li key={tab.href}>
              <Link
                href={tab.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex flex-col items-center gap-0.5 pb-1 pt-2 text-[10px] font-semibold transition-colors",
                  active ? "text-primary" : "text-muted-foreground"
                )}
              >
                <tab.icon className="h-6 w-6" weight={active ? "fill" : "regular"} />
                {tab.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/**
 * Phone-width header (below lg): the avatar opens Settings like the phone app's avatar does,
 * and any page below a tab's top level gets a back arrow with its title.
 */
export function MobileHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { profile } = useAuth();
  const dynamicLabel = useBreadcrumbLabel();
  const nested = !isTopLevel(pathname);

  const nestedTitle = pathname.startsWith("/groups/")
    ? (dynamicLabel ?? "Group")
    : (NESTED_TITLES.find(([prefix]) => pathname.startsWith(prefix))?.[1] ?? dynamicLabel ?? "");

  return (
    <header
      className="sticky top-0 z-30 border-b border-border/60 bg-background/90 backdrop-blur lg:hidden"
      style={{ paddingTop: "env(safe-area-inset-top)" }}
    >
      <div className="flex h-14 items-center gap-3 px-4">
        {nested ? (
          <button
            type="button"
            aria-label="Back"
            onClick={() => router.back()}
            className="-ml-2 flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-foreground active:bg-muted"
          >
            <CaretLeft className="h-5 w-5" weight="bold" />
          </button>
        ) : (
          <Link
            href="/settings"
            aria-label="Settings"
            className="shrink-0 rounded-full ring-2 ring-primary/20 active:opacity-80"
          >
            <Avatar className="h-10 w-10">
              <AvatarImage src={profile?.avatar_url ?? undefined} alt={profile?.display_name} />
              <AvatarFallback className="bg-primary-light text-sm font-bold text-primary-deep">
                {(profile?.display_name ?? "S").slice(0, 1).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </Link>
        )}
        {nested && <p className="min-w-0 flex-1 truncate text-base font-bold">{nestedTitle}</p>}
        <div className={cn("flex items-center", !nested && "ml-auto")}>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
