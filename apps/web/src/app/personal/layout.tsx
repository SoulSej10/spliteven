"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { GridFour as LayoutGrid, ListChecks, ChartPie as PieChart, PiggyBank, Tag, Wallet } from "@phosphor-icons/react";
import { AuthGuard } from "@/components/auth/auth-guard";
import { AppShell } from "@/components/app-shell/top-nav";
import { FinancesSummaryCard } from "@/components/personal/finances-summary-card";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/personal/overview", label: "Overview", icon: LayoutGrid },
  { href: "/personal", label: "Transactions", icon: ListChecks },
  { href: "/personal/accounts", label: "Accounts", icon: Wallet },
  { href: "/personal/budgets", label: "Budgets", icon: PiggyBank },
  { href: "/personal/categories", label: "Categories", icon: Tag },
  { href: "/personal/analysis", label: "Analysis", icon: PieChart },
];

/**
 * Sub-nav for Finances' own tabs (Records/Analysis/Budgets/Accounts/
 * Categories). The top-level "Finances" destination lives in the sidebar
 * (via AppShell) - this only owns the second-level tab row, not a title.
 */
function PersonalSubNav() {
  const pathname = usePathname();
  const navRef = useRef<HTMLElement>(null);

  // Keep the current tab in view when the row scrolls sideways on a phone.
  useEffect(() => {
    navRef.current?.querySelector<HTMLElement>("[aria-current=page]")?.scrollIntoView({ inline: "center", block: "nearest" });
  }, [pathname]);

  return (
    <nav ref={navRef} className="-mx-4 mb-5 flex gap-1.5 overflow-x-auto px-4 pb-1 [scrollbar-width:none] lg:mx-0 lg:mb-6 lg:px-0 [&::-webkit-scrollbar]:hidden">
      {TABS.map((tab) => {
        const active = pathname === tab.href || (tab.href !== "/personal" && pathname.startsWith(`${tab.href}/`));
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 py-2 text-sm font-semibold transition-colors lg:rounded-lg lg:py-1.5 lg:font-medium",
              active ? "bg-primary text-primary-foreground" : "bg-muted/70 text-muted-foreground hover:bg-muted lg:bg-transparent"
            )}
          >
            <tab.icon className="h-3.5 w-3.5" />
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}

export default function PersonalLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <AppShell>
        <div className="mb-4 lg:mb-6">
          <h1 className="text-xl font-bold tracking-tight lg:text-2xl lg:font-semibold">Finances</h1>
          <p className="hidden text-sm text-muted-foreground lg:block">Your personal accounts, budgets, and spending, kept separate from group balances.</p>
        </div>
        <FinancesSummaryCard />
        <PersonalSubNav />
        {children}
      </AppShell>
    </AuthGuard>
  );
}
