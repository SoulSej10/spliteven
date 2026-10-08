import { Modal, Pressable, Text, View } from "react-native";
import { CheckCircle, Warning } from "phosphor-react-native";
import { Button } from "./Button";
import { cn } from "@/lib/cn";
import { palette } from "@/theme/palette";

type Tone = "info" | "success" | "warning";

const TONE_ICON = {
  info: null,
  success: CheckCircle,
  warning: Warning,
} as const;

const TONE_ICON_BG: Record<Tone, string> = {
  info: "",
  success: "bg-positive/10",
  warning: "bg-negative/10",
};

const TONE_ICON_COLOR: Record<Tone, string> = {
  info: palette.primary,
  success: palette.primary,
  warning: palette.negative,
};

/**
 * A branded, centered confirmation dialog - replaces the OS-styled
 * Alert.alert() for user-facing confirmations (e.g. "Check your email")
 * where a plain system dialog reads as jarring against the rest of the app.
 */
export function AlertModal({
  visible,
  title,
  message,
  onDismiss,
  confirmLabel = "OK",
  tone = "info",
}: {
  visible: boolean;
  title: string;
  message: string;
  onDismiss: () => void;
  confirmLabel?: string;
  tone?: Tone;
}) {
  const Icon = TONE_ICON[tone];

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onDismiss}>
      <Pressable
        className="flex-1 items-center justify-center bg-black/50 px-6"
        onPress={onDismiss}
      >
        <Pressable
          onPress={(e) => e.stopPropagation()}
          className="w-full max-w-sm rounded-card bg-surface p-6 shadow-lg dark:bg-surface-dark"
        >
          {Icon && (
            <View
              className={cn("mb-4 h-11 w-11 items-center justify-center rounded-full", TONE_ICON_BG[tone])}
            >
              <Icon size={22} weight="fill" color={TONE_ICON_COLOR[tone]} />
            </View>
          )}
          <Text className="text-lg font-bold text-neutral-900 dark:text-neutral-100">{title}</Text>
          <Text className="mt-2 text-sm leading-5 text-neutral-500">{message}</Text>
          <Button className="mt-6" onPress={onDismiss}>
            {confirmLabel}
          </Button>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
