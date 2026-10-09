"use client";

import { AuthGuard } from "@/components/auth/auth-guard";
import { AppShell } from "@/components/app-shell/top-nav";
import { SettingsPanelContent } from "@/components/settings/settings-panel-content";

function SettingsContent() {
  return (
    <AppShell>
      <div className="mx-auto max-w-2xl">
        <div className="mb-5 hidden lg:block">
          <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
          <p className="hidden text-sm text-muted-foreground sm:block">Everything about your account, in one place.</p>
        </div>
        <SettingsPanelContent />
      </div>
    </AppShell>
  );
}

export default function SettingsPage() {
  return (
    <AuthGuard>
      <SettingsContent />
    </AuthGuard>
  );
}
