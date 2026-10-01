"use client";

import { useRef, useState, type UIEvent } from "react";
import { Button } from "@/components/ui/button";
import { PrivacyPolicyContent } from "./privacy-policy-content";
import { TermsOfServiceContent } from "./terms-of-service-content";

const BOTTOM_THRESHOLD = 24;

/**
 * Privacy Policy + Terms of Service, with the accept button disabled until
 * the user has actually scrolled to the bottom of both documents - a
 * one-click "I agree" that nobody reads isn't real consent. Shown before
 * account creation can complete, mirroring the same forced gate on mobile
 * (apps/mobile/src/components/legal/AcceptTermsGate.tsx).
 */
export function AcceptTermsGate({
  onAgree,
  agreeing,
  agreeLabel = "I agree, continue",
}: {
  onAgree: () => void;
  agreeing?: boolean;
  agreeLabel?: string;
}) {
  const [reachedBottom, setReachedBottom] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  function checkBottom(el: HTMLDivElement) {
    if (reachedBottom) return;
    const distanceFromBottom = el.scrollHeight - el.clientHeight - el.scrollTop;
    if (distanceFromBottom <= BOTTOM_THRESHOLD) setReachedBottom(true);
  }

  function handleScroll(e: UIEvent<HTMLDivElement>) {
    checkBottom(e.currentTarget);
  }

  return (
    <div className="flex max-h-[70vh] flex-col">
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="min-h-0 flex-1 space-y-8 overflow-y-auto pr-1"
      >
        <div className="space-y-5">
          <h2 className="text-lg font-bold">Privacy Policy</h2>
          <PrivacyPolicyContent />
        </div>
        <div className="space-y-5">
          <h2 className="text-lg font-bold">Terms of Service</h2>
          <TermsOfServiceContent />
        </div>
      </div>
      <div className="mt-4 border-t border-border pt-4">
        {!reachedBottom && (
          <p className="mb-2 text-center text-xs text-muted-foreground">Scroll to the bottom to continue</p>
        )}
        <Button className="w-full" size="lg" onClick={onAgree} disabled={!reachedBottom || agreeing}>
          {agreeLabel}
        </Button>
      </div>
    </div>
  );
}
