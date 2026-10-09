import { useEffect, useState } from "react";
import { Modal, Pressable, View } from "react-native";
import type { AlertButton } from "react-native";
import { Text } from "@/components/ui/typography";
import { Button } from "@/components/ui/Button";
import { attachDialogListener, closeDialog, type DialogRequest } from "@/lib/dialog";

/**
 * Renders every Alert.alert() as an on-brand centered card (see lib/dialog.ts and the
 * override in app/_layout.tsx), instead of the phone's grey system dialog.
 */
export function DialogHost() {
  const [request, setRequest] = useState<DialogRequest | null>(null);

  useEffect(() => attachDialogListener(setRequest), []);

  if (!request) return null;

  function press(button: AlertButton) {
    closeDialog();
    button.onPress?.();
  }

  function dismiss() {
    if (!request?.cancelable) return;
    closeDialog();
    request.onDismiss?.();
  }

  const buttons = request.buttons;
  const stacked = buttons.length > 2 || buttons.some((b) => (b.text ?? "").length > 14);

  return (
    <Modal visible transparent animationType="fade" onRequestClose={dismiss} statusBarTranslucent>
      <Pressable className="flex-1 items-center justify-center bg-black/50 px-6" onPress={dismiss}>
        <Pressable
          onPress={(e) => e.stopPropagation()}
          className="w-full max-w-sm rounded-card bg-surface p-6 shadow-lg dark:bg-surface-dark"
        >
          <Text className="text-lg font-bold text-neutral-900 dark:text-neutral-100">{request.title}</Text>
          {!!request.message && (
            <Text className="mt-2 text-sm leading-5 text-neutral-500">{request.message}</Text>
          )}
          <View className={stacked ? "mt-6 gap-2" : "mt-6 flex-row gap-2"}>
            {(stacked ? [...buttons].reverse() : buttons).map((b, i) => (
              <Button
                key={`${b.text}-${i}`}
                className={stacked ? undefined : "flex-1"}
                variant={b.style === "destructive" ? "destructive" : b.style === "cancel" ? "outline" : "primary"}
                onPress={() => press(b)}
              >
                {b.text}
              </Button>
            ))}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
