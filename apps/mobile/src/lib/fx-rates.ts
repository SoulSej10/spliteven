import { useSyncExternalStore } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { isValidRate, type FxRates } from "@evensplit/shared";

const KEY = "evensplit:fx-rates";

/**
 * The conversion rates the user typed in, kept on this device. Units of the
 * base currency per 1 unit of each foreign currency. Tiny external store so
 * every total on screen updates the moment a rate changes.
 */
let rates: FxRates = {};
let loaded = false;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

async function load() {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    const parsed = raw ? (JSON.parse(raw) as unknown) : {};
    if (parsed && typeof parsed === "object") {
      rates = Object.fromEntries(Object.entries(parsed).filter(([, v]) => isValidRate(v))) as FxRates;
    }
  } catch {
    // Unreadable storage just means no saved rates yet.
  }
  loaded = true;
  emit();
}
void load();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function setFxRate(currency: string, rate: number | null) {
  const next = { ...rates };
  if (rate !== null && isValidRate(rate)) next[currency] = rate;
  else delete next[currency];
  rates = next;
  emit();
  AsyncStorage.setItem(KEY, JSON.stringify(rates)).catch(() => {});
}

export function useFxRates(): { rates: FxRates; loaded: boolean } {
  const current = useSyncExternalStore(subscribe, () => rates);
  const isLoaded = useSyncExternalStore(subscribe, () => loaded);
  return { rates: current, loaded: isLoaded };
}
