import type { AlertButton, AlertOptions } from "react-native";

export type DialogRequest = {
  title: string;
  message?: string;
  buttons: AlertButton[];
  cancelable: boolean;
  onDismiss?: () => void;
};

type Listener = (request: DialogRequest | null) => void;

let listener: Listener | null = null;
const queue: DialogRequest[] = [];
let current: DialogRequest | null = null;

function show(next: DialogRequest | null) {
  current = next;
  listener?.(next);
}

/** Called by DialogHost once mounted; shows anything queued before that. */
export function attachDialogListener(fn: Listener) {
  listener = fn;
  if (!current && queue.length) show(queue.shift()!);
  else fn(current);
  return () => {
    if (listener === fn) listener = null;
  };
}

/** Closes the visible dialog and shows the next queued one. */
export function closeDialog() {
  show(queue.shift() ?? null);
}

/** Drop-in for Alert.alert(): same arguments, but rendered by the app's own DialogHost. */
export function themedAlert(
  title: string,
  message?: string,
  buttons?: AlertButton[],
  options?: AlertOptions
) {
  const request: DialogRequest = {
    title,
    message,
    buttons: buttons && buttons.length ? buttons : [{ text: "OK" }],
    cancelable: options?.cancelable ?? false,
    onDismiss: options?.onDismiss,
  };
  if (current) queue.push(request);
  else show(request);
}
