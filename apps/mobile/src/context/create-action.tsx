import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useIsFocused } from "expo-router";

interface CreateActionContextValue {
  /** Whether the visible page has something to create. The middle tab button is dimmed and inert when it doesn't. */
  enabled: boolean;
  /** Runs the visible page's create action. */
  run: () => void;
  register: (handler: (() => void) | null) => void;
}

const CreateActionContext = createContext<CreateActionContextValue | null>(null);

/**
 * The middle button of the bottom bar is one shared "Create" button. Each tab screen says what it
 * creates (Home: a menu of things to add, Groups: a new group, Finances: whatever the open tab
 * adds); screens with nothing to create (Insights) register nothing, which turns the button off.
 */
export function CreateActionProvider({ children }: { children: ReactNode }) {
  const handlerRef = useRef<(() => void) | null>(null);
  const [enabled, setEnabled] = useState(false);

  const register = useCallback((handler: (() => void) | null) => {
    handlerRef.current = handler;
    setEnabled(handler !== null);
  }, []);
  const run = useCallback(() => handlerRef.current?.(), []);

  const value = useMemo(() => ({ enabled, run, register }), [enabled, run, register]);
  return <CreateActionContext.Provider value={value}>{children}</CreateActionContext.Provider>;
}

export function useCreateAction(): CreateActionContextValue {
  const ctx = useContext(CreateActionContext);
  if (!ctx) throw new Error("useCreateAction must be used within CreateActionProvider");
  return ctx;
}

/**
 * Call from a tab screen: while that screen is the visible one, the middle button runs `handler`.
 * Pass null when the screen has nothing to create right now.
 */
export function useRegisterCreateAction(handler: (() => void) | null) {
  const { register } = useCreateAction();
  const focused = useIsFocused();
  const latest = useRef(handler);
  latest.current = handler;
  const active = handler !== null;

  useEffect(() => {
    if (!focused || !active) return;
    register(() => latest.current?.());
    return () => register(null);
  }, [focused, active, register]);
}
