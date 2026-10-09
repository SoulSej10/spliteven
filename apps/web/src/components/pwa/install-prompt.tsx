"use client";

import { useEffect, useState } from "react";
import { DeviceMobile, ShareNetwork, X } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";

const DISMISS_KEY = "evensplit:install-hint-dismissed";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

function isStandalone() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

/**
 * Phone-only banner that helps people install SplitEven to the home screen. iPhones have no
 * install button, so it shows the Share -> Add to Home Screen steps; Android browsers get a
 * real Install button. Hidden once installed (or dismissed), and never on desktop.
 */
export function InstallPrompt() {
  const [mode, setMode] = useState<"ios" | "android" | null>(null);
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    try {
      if (localStorage.getItem(DISMISS_KEY) === "1") return;
    } catch {
      // Storage blocked: just show the hint.
    }
    if (isStandalone()) return;

    const ua = navigator.userAgent;
    const isIos = /iphone|ipad|ipod/i.test(ua) || (ua.includes("Mac") && navigator.maxTouchPoints > 1);
    if (isIos) {
      setMode("ios");
      return;
    }
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
      setMode("android");
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  if (!mode) return null;

  function dismiss() {
    try {
      localStorage.setItem(DISMISS_KEY, "1");
    } catch {
      // Best effort.
    }
    setMode(null);
  }

  return (
    <div className="mb-4 flex items-start gap-3 rounded-2xl border border-border bg-card p-3.5 shadow-sm lg:hidden">
      <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary-light text-primary-deep">
        <DeviceMobile className="h-5 w-5" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold">Add SplitEven to your home screen</p>
        {mode === "ios" ? (
          <p className="mt-0.5 text-xs leading-5 text-muted-foreground">
            Tap <ShareNetwork className="mx-0.5 inline h-3.5 w-3.5 align-text-bottom" /> Share in Safari, then{" "}
            <span className="font-semibold text-foreground">Add to Home Screen</span>. It opens like an app.
          </p>
        ) : (
          <>
            <p className="mt-0.5 text-xs leading-5 text-muted-foreground">Open it like an app, full screen.</p>
            <Button
              size="sm"
              className="mt-2 rounded-full"
              onClick={async () => {
                if (!deferred) return;
                await deferred.prompt();
                await deferred.userChoice;
                setMode(null);
              }}
            >
              Install
            </Button>
          </>
        )}
      </div>
      <button
        type="button"
        aria-label="Dismiss"
        onClick={dismiss}
        className="-mr-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-muted-foreground active:bg-muted"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
