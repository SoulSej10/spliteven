"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ComponentType } from "react";
import { CaretLeft, ChartBar, House, Plus, Users, Wallet } from "@phosphor-icons/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/app-shell/top-bar";
import { CreateMenu } from "@/components/app-shell/create-menu";
import { useBreadcrumbLabel } from "@/components/app-shell/breadcrumb-context";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

interface Tab {
  href: string;
  label: string;
  icon: ComponentType<{ className?: string; weight?: "regular" | "fill" }>;
  match: (pathname: string) => boolean;
}

/** The same four destinations as the phone app's bottom bar, with the Create button in the middle. */
const TABS: Tab[] = [
  { href: "/dashboard", label: "Home", icon: House, match: (p) => p === "/dashboard" },
  { href: "/groups", label: "Groups", icon: Users, match: (p) => p.startsWith("/groups") },
  { href: "/personal/overview", label: "Finances", icon: Wallet, match: (p) => p.startsWith("/personal") },
  { href: "/insights", label: "Insights", icon: ChartBar, match: (p) => p.startsWith("/insights") },
];

/** Pages that live directly under a tab show the title header; deeper pages get a back arrow. */
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

const CREATE_SELECTOR = "[data-create-action]";

/**
 * True while the open page has something to create. Pages mark their main "add" button with
 * data-create-action; the bottom bar's middle button clicks it, and rests when there isn't one.
 */
function usePageHasCreateAction(pathname: string) {
  const [has, setHas] = useState(false);

  useEffect(() => {
    let frame = 0;
    const check = () => {
      frame = 0;
      setHas(!!document.querySelector(CREATE_SELECTOR));
    };
    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(check);
    };
    check();
    const observer = new MutationObserver(schedule);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => {
      observer.disconnect();
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [pathname]);

  return has;
}

/**
 * Phone-width bottom bar (below lg), mirroring the phone app: Home, Groups, a raised Create button,
 * Finances, Insights. The Create button is dimmed and inert on pages with nothing to create.
 */
export function MobileTabBar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const pageHasAction = usePageHasCreateAction(pathname);
  const onHome = pathname === "/dashboard";
  const enabled = onHome || pageHasAction;

  function onCreate() {
    if (!enabled) return;
    if (onHome) setMenuOpen(true);
    else document.querySelector<HTMLElement>(CREATE_SELECTOR)?.click();
  }

  function renderTab(tab: Tab) {
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
  }

  return (
    <>
      <nav
        aria-label="Main"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card lg:hidden"
        style={{ paddingBottom: "max(env(safe-area-inset-bottom), 0.5rem)" }}
      >
        <ul className="mx-auto grid max-w-xl grid-cols-5 items-end">
          {renderTab(TABS[0])}
          {renderTab(TABS[1])}
          <li className="flex justify-center">
            <button
              type="button"
              onClick={onCreate}
              disabled={!enabled}
              aria-label="Create"
              className={cn(
                "-mt-5 mb-1 flex h-[58px] w-[58px] items-center justify-center rounded-full border-4 border-card transition",
                enabled
                  ? "bg-primary text-primary-foreground shadow-lg active:scale-95"
                  : "cursor-default bg-muted text-muted-foreground opacity-60"
              )}
            >
              <Plus className="h-7 w-7" weight="bold" />
            </button>
          </li>
          {renderTab(TABS[2])}
          {renderTab(TABS[3])}
        </ul>
      </nav>
      <CreateMenu open={menuOpen} onOpenChange={setMenuOpen} />
    </>
  );
}

/**
 * Phone-width header (below lg). On a tab's own page it shows the page title (a greeting on Home)
 * with the theme button and the avatar (-> Settings) on the right, so the content gets the room;
 * deeper pages get a back arrow and their own title.
 */
export function MobileHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { profile } = useAuth();
  const dynamicLabel = useBreadcrumbLabel();
  const nested = !isTopLevel(pathname);

  const first = profile?.display_name?.split(" ")[0];
  const topTitle = pathname === "/dashboard"
    ? (first ? `Good to see you, ${first}` : "Home")
    : pathname.startsWith("/groups")
      ? "Groups"
      : pathname.startsWith("/personal")
        ? "Finances"
        : pathname.startsWith("/insights")
          ? "Insights"
          : "";

  const nestedTitle = pathname.startsWith("/groups/")
    ? (dynamicLabel ?? "Group")
    : (NESTED_TITLES.find(([prefix]) => pathname.startsWith(prefix))?.[1] ?? dynamicLabel ?? "");

  return (
    <header
      className="sticky top-0 z-30 border-b border-border/60 bg-background/90 backdrop-blur lg:hidden"
      style={{ paddingTop: "env(safe-area-inset-top)" }}
    >
      <div className="flex h-14 items-center gap-2 px-4">
        {nested && (
          <button
            type="button"
            aria-label="Back"
            onClick={() => router.back()}
            className="-ml-2 flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-foreground active:bg-muted"
          >
            <CaretLeft className="h-5 w-5" weight="bold" />
          </button>
        )}
        <p className={cn("min-w-0 flex-1 truncate font-extrabold", nested ? "text-base font-bold" : "text-xl")}>
          {nested ? nestedTitle : topTitle}
        </p>
        <ThemeToggle />
        {!nested && (
          <Link href="/settings" aria-label="Settings" className="shrink-0 rounded-full ring-2 ring-primary/20 active:opacity-80">
            <Avatar className="h-10 w-10">
              <AvatarImage src={profile?.avatar_url ?? undefined} alt={profile?.display_name} />
              <AvatarFallback className="bg-primary-light text-sm font-bold text-primary-deep">
                {(profile?.display_name ?? "S").slice(0, 1).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </Link>
        )}
      </div>
    </header>
  );
}
