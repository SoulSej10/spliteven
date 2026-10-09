"use client";

import { use } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "@phosphor-icons/react";
import { AuthGuard } from "@/components/auth/auth-guard";
import { AppShell } from "@/components/app-shell/top-nav";
import { SettingsPanelContent, type SettingsSection } from "@/components/settings/settings-panel-content";

const SECTIONS: Record<Exclude<SettingsSection, "menu">, { title: string; description: string }> = {
  profile: { title: "Profile & currency", description: "Your name, photo and default currency." },
  security: { title: "Security & sign-in", description: "Change the password you use to sign in." },
  data: { title: "Export & import", description: "Back up or restore your personal ledger as a CSV file." },
  appearance: { title: "Appearance", description: "Switch between light and dark." },
  notifications: { title: "Notifications & reminders", description: "Choose which reminders you get." },
  about: { title: "About & legal", description: "Version, privacy policy and terms." },
};

/** One Settings page per feature (opened from the Settings menu). */
export default function SettingsSectionPage({ params }: { params: Promise<{ section: string }> }) {
  const { section } = use(params);
  if (!(section in SECTIONS)) notFound();
  const info = SECTIONS[section as keyof typeof SECTIONS];

  return (
    <AuthGuard>
      <AppShell>
        <div className="mx-auto max-w-2xl">
          <Link
            href="/settings"
            className="mb-4 hidden items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground lg:inline-flex"
          >
            <ArrowLeft className="h-4 w-4" /> Back to settings
          </Link>
          <div className="mb-5">
            <h1 className="text-2xl font-semibold tracking-tight">{info.title}</h1>
            <p className="hidden text-sm text-muted-foreground sm:block">{info.description}</p>
          </div>
          <SettingsPanelContent section={section as SettingsSection} />
        </div>
      </AppShell>
    </AuthGuard>
  );
}
