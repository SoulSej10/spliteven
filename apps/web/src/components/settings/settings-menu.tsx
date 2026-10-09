"use client";

import type { ComponentType } from "react";
import {
  ArrowsLeftRight,
  Bell,
  CaretRight as ChevronRight,
  FileCsv,
  Info,
  Key as KeyRound,
  ListChecks,
  Palette,
  PiggyBank,
  Tag,
  UserCircle,
  Wallet,
} from "@phosphor-icons/react";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";

interface MenuItem {
  label: string;
  hint?: string;
  icon: ComponentType<{ className?: string }>;
  href: string;
}

function MenuSet({ title, items, goTo }: { title: string; items: MenuItem[]; goTo: (path: string) => void }) {
  return (
    <section className="space-y-2">
      <h2 className="px-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{title}</h2>
      <Card className="gap-0 rounded-2xl border-border/60 py-1.5 shadow-sm">
        {items.map((item) => (
          <button
            key={item.label}
            type="button"
            onClick={() => goTo(item.href)}
            className="flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-muted active:bg-muted"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-light text-primary-deep">
              <item.icon className="h-[17px] w-[17px]" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-medium">{item.label}</span>
              {item.hint && <span className="block truncate text-xs text-muted-foreground">{item.hint}</span>}
            </span>
            <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
          </button>
        ))}
      </Card>
    </section>
  );
}

/** The Settings home: short sets of buttons, each opening its own page, instead of one long scroll. */
export function SettingsMenu({ goTo }: { goTo: (path: string) => void }) {
  const { profile } = useAuth();

  return (
    <div className="space-y-6">
      <MenuSet
        title="Account"
        goTo={goTo}
        items={[
          { label: "Profile & currency", hint: `Default currency ${profile?.default_currency ?? "—"}`, icon: UserCircle, href: "/settings/profile" },
          { label: "Security & sign-in", hint: "Change password", icon: KeyRound, href: "/settings/security" },
          { label: "Currency rates", hint: "Convert other currencies", icon: ArrowsLeftRight, href: "/settings/currency-rates" },
        ]}
      />
      <MenuSet
        title="Your money"
        goTo={goTo}
        items={[
          { label: "Accounts", icon: Wallet, href: "/personal/accounts" },
          { label: "Categories", icon: Tag, href: "/personal/categories" },
          { label: "Budgets", icon: PiggyBank, href: "/personal/budgets" },
          { label: "Transactions", icon: ListChecks, href: "/personal" },
        ]}
      />
      <MenuSet
        title="Preferences"
        goTo={goTo}
        items={[
          { label: "Notifications & reminders", hint: "Daily, bills, budgets", icon: Bell, href: "/settings/notifications" },
          { label: "Appearance", hint: "Dark mode", icon: Palette, href: "/settings/appearance" },
          { label: "Export & import", hint: "CSV backup", icon: FileCsv, href: "/settings/data" },
        ]}
      />
      <MenuSet
        title="About"
        goTo={goTo}
        items={[{ label: "About & legal", hint: "Version, privacy, terms", icon: Info, href: "/settings/about" }]}
      />
    </div>
  );
}
