import { useCallback, useSyncExternalStore } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "evensplit:hide-balances";

let hidden = false;
const listeners = new Set<() => void>();

// Restore the saved choice once; both balance cards read the same value, so toggling one updates the other.
void AsyncStorage.getItem(KEY)
  .then((v) => {
    if (v === "1" && !hidden) {
      hidden = true;
      listeners.forEach((l) => l());
    }
  })
  .catch(() => {});

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Whether balances on the Home and Finances cards are masked, plus a toggle. Remembered on this phone. */
export function useHideAmounts() {
  const isHidden = useSyncExternalStore(subscribe, () => hidden, () => false);
  const toggle = useCallback(() => {
    hidden = !hidden;
    listeners.forEach((l) => l());
    void AsyncStorage.setItem(KEY, hidden ? "1" : "0").catch(() => {});
  }, []);
  return { hidden: isHidden, toggle };
}

export const MASKED = "••••••";
