"use client";

import { useSyncExternalStore } from "react";
import { isValidRate, type FxRates } from "@evensplit/shared";

const KEY = "evensplit:fx-rates";

/**
 * Conversion rates the user typed in, kept in this browser: units of the
 * default currency per 1 unit of each foreign currency. Tiny external store so
 * every total on screen updates the moment a rate changes.
 */
let rates: FxRates = {};
const EMPTY: FxRates = {};
const listeners = new Set<() => void>();
let loaded = false;

function read(): FxRates {
  try {
    const raw = window.localStorage.getItem(KEY);
    const parsed = raw ? (JSON.parse(raw) as unknown) : {};
    if (parsed && typeof parsed === "object") {
      return Object.fromEntries(Object.entries(parsed).filter(([, v]) => isValidRate(v))) as FxRates;
    }
  } catch {
    // Unreadable storage just means no saved rates yet.
  }
  return {};
}

function ensureLoaded() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  rates = read();
  window.addEventListener("storage", (e) => {
    if (e.key === KEY) {
      rates = read();
      listeners.forEach((l) => l());
    }
  });
}

function subscribe(listener: () => void) {
  ensureLoaded();
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot(): FxRates {
  ensureLoaded();
  return rates;
}

export function setFxRate(currency: string, rate: number | null) {
  ensureLoaded();
  const next = { ...rates };
  if (rate !== null && isValidRate(rate)) next[currency] = rate;
  else delete next[currency];
  rates = next;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(rates));
  } catch {
    // Best effort: the rate still applies for this session.
  }
  listeners.forEach((l) => l());
}

export function useFxRates(): FxRates {
  return useSyncExternalStore(subscribe, getSnapshot, () => EMPTY);
}
