import { useEffect, useState } from "react";
import { Pressable, View } from "react-native";
import { isValidRate } from "@evensplit/shared";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import { Text } from "@/components/ui/typography";
import { CURRENCIES } from "@/lib/format";
import { setFxRate } from "@/lib/fx-rates";
import { cn } from "@/lib/cn";

/** Add, edit or remove the conversion rate for one foreign currency. */
export function AddRateSheet({
  visible,
  onClose,
  base,
  initialCurrency,
  existingRate,
}: {
  visible: boolean;
  onClose: () => void;
  /** The user's default currency: rates convert into this. */
  base: string;
  initialCurrency?: string | null;
  existingRate?: number;
}) {
  const options = CURRENCIES.filter((c) => c !== base);
  const [currency, setCurrency] = useState<string>(initialCurrency ?? options[0] ?? "USD");
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      setCurrency(initialCurrency ?? options[0] ?? "USD");
      setText(existingRate !== undefined ? String(existingRate) : "");
      setError(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, initialCurrency, existingRate]);

  function onSave() {
    const value = parseFloat(text.replace(/,/g, ""));
    if (!isValidRate(value)) {
      setError("Enter a rate greater than 0, for example 58.25.");
      return;
    }
    setFxRate(currency, value);
    onClose();
  }

  const editing = existingRate !== undefined;

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title={editing ? `Edit ${currency} rate` : "Add a currency rate"}
      footer={
        <View className="gap-2">
          <Button onPress={onSave} size="lg">
            Save rate
          </Button>
          {editing && (
            <Button
              variant="outline"
              onPress={() => {
                setFxRate(currency, null);
                onClose();
              }}
            >
              Remove this rate
            </Button>
          )}
        </View>
      }
    >
      {!editing && (
        <View className="gap-1.5">
          <Text className="text-sm font-medium text-neutral-900 dark:text-neutral-100">Currency</Text>
          <View className="flex-row flex-wrap gap-2">
            {options.map((c) => (
              <Pressable
                key={c}
                onPress={() => setCurrency(c)}
                className={cn(
                  "rounded-pill border px-3 py-1.5",
                  currency === c ? "border-primary bg-primary-light" : "border-neutral-500/20"
                )}
              >
                <Text className={cn("text-sm font-medium", currency === c ? "text-primary-deep" : "text-neutral-500")}>
                  {c}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      )}

      <TextField
        label={`1 ${currency} equals how many ${base}?`}
        placeholder="0.00"
        keyboardType="decimal-pad"
        value={text}
        onChangeText={(t) => {
          setText(t.replace(/[^0-9.,]/g, ""));
          setError(null);
        }}
        error={error ?? undefined}
      />
      <Text className="text-xs text-neutral-500">
        An approximate rate is fine. Everything in {currency} is converted to {base} with it, and the original amount
        stays visible. You can change it any time.
      </Text>
    </BottomSheet>
  );
}
