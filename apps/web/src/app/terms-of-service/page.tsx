"use client";

import Link from "next/link";
import { ArrowLeft } from "@phosphor-icons/react";
import { TermsOfServiceContent } from "@/components/legal/terms-of-service-content";

/** Public page — real, SplitEven-specific terms of service, linked from Settings and available without signing in. */
export default function TermsOfServicePage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <Link href="/" className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back
      </Link>
      <h1 className="mb-6 text-2xl font-semibold tracking-tight">Terms of Service</h1>

      <TermsOfServiceContent />
    </div>
  );
}
