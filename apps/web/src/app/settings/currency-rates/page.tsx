"use client";

import Link from "next/link";
import { ArrowLeft } from "@phosphor-icons/react";
import { AuthGuard } from "@/components/auth/auth-guard";
import { AppShell } from "@/components/app-shell/top-nav";
import { CurrencyRatesCard } from "@/components/personal/currency-rates-card";

export default function CurrencyRatesPage() {
  return (
    <AuthGuard>
      <AppShell>
        <div className="mx-auto max-w-2xl">
          <Link
            href="/settings"
            className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> Back to settings
          </Link>
          <div className="mb-6">
            <h1 className="text-2xl font-semibold tracking-tight">Currency rates</h1>
            <p className="text-sm text-muted-foreground">
              Approximate rates used to convert other currencies into your default one.
            </p>
          </div>
          <CurrencyRatesCard />
        </div>
      </AppShell>
    </AuthGuard>
  );
}
