"use client";

import { useSyncExternalStore, type ComponentProps } from "react";
import { APP_DOWNLOAD_PATH } from "@/lib/app-download";

function subscribe() {
  return () => {};
}

function detectIos() {
  const ua = navigator.userAgent;
  return /iphone|ipad|ipod/i.test(ua) || (ua.includes("Mac") && navigator.maxTouchPoints > 1);
}

/**
 * "Download the app" link. Android and desktop get the APK; iPhones can't install an APK,
 * so they're sent to /install, which shows how to add SplitEven to the home screen.
 */
export function AppDownloadLink(props: Omit<ComponentProps<"a">, "href" | "download">) {
  const ios = useSyncExternalStore(subscribe, detectIos, () => false);
  return ios ? <a {...props} href="/install" /> : <a {...props} href={APP_DOWNLOAD_PATH} download />;
}
