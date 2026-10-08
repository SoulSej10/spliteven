import { useState } from "react";
import { Pressable, Text, TextInput, View, type TextInputProps } from "react-native";
import { Eye, EyeSlash } from "phosphor-react-native";
import { cn } from "@/lib/cn";
import { palette } from "@/theme/palette";

/** Any secureTextEntry field (password, confirm password, etc.) automatically gets a show/hide eye toggle. */
export function TextField({
  label,
  error,
  className,
  containerClassName,
  secureTextEntry,
  ...props
}: TextInputProps & { label?: string; error?: string; containerClassName?: string }) {
  const [visible, setVisible] = useState(false);
  const isPassword = !!secureTextEntry;

  return (
    <View className={cn("gap-1.5", containerClassName)}>
      {label && (
        <Text className="text-sm font-medium text-neutral-900 dark:text-neutral-100">{label}</Text>
      )}
      <View className="relative justify-center">
        <TextInput
          placeholderTextColor={palette.muted}
          secureTextEntry={isPassword && !visible}
          className={cn(
            "h-12 rounded-card border border-neutral-500/20 bg-surface px-4 text-base text-neutral-900",
            "dark:bg-surface-dark dark:text-neutral-100",
            isPassword && "pr-11",
            error && "border-negative",
            className
          )}
          {...props}
        />
        {isPassword && (
          <Pressable
            onPress={() => setVisible((v) => !v)}
            hitSlop={10}
            className="absolute right-3.5"
            accessibilityLabel={visible ? "Hide password" : "Show password"}
          >
            {visible ? <EyeSlash size={18} color={palette.muted} /> : <Eye size={18} color={palette.muted} />}
          </Pressable>
        )}
      </View>
      {error && <Text className="text-xs text-negative">{error}</Text>}
    </View>
  );
}
