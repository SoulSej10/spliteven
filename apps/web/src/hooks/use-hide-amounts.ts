"use client";

import { useCallback, useSyncExternalStore } from "react";

const KEY = "evensplit:hide-balances";
export const MASKED = "••••••";

const listeners = new Set<() => void>();

function read(): boolean {
  try {
    return localStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

/** Whether balances on the Home and Finances cards are masked, plus a toggle. Remembered on this device. */
export function useHideAmounts() {
  const hidden = useSyncExternalStore(subscribe, read, () => false);
  const toggle = useCallback(() => {
    try {
      localStorage.setItem(KEY, read() ? "0" : "1");
    } catch {
      // Storage blocked: the choice just won't be remembered.
    }
    listeners.forEach((l) => l());
  }, []);
  return { hidden, toggle };
}
