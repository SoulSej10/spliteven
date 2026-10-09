import { useEffect, useState } from "react";
import { Alert, Switch, View } from "react-native";
import { Fingerprint } from "phosphor-react-native";
import { Card } from "@/components/ui/Card";
import { Text } from "@/components/ui/typography";
import {
  getBiometricSupport,
  promptUnlock,
  setBiometricEnabled,
  useBiometricEnabled,
  type BiometricSupport,
} from "@/lib/biometrics";
import { palette } from "@/theme/palette";

/**
 * Settings switch for unlocking the app with the phone's fingerprint or face.
 * Turning it on asks for one successful scan first, so it can't be enabled on
 * a phone where it won't work. Hidden on phones without biometric hardware.
 */
export function BiometricToggle() {
  const enabled = useBiometricEnabled();
  const [support, setSupport] = useState<BiometricSupport | null>(null);

  useEffect(() => {
    let active = true;
    void getBiometricSupport().then((s) => {
      if (active) setSupport(s);
    });
    return () => {
      active = false;
    };
  }, []);

  if (!support || !support.hasHardware) return null;

  async function onChange(next: boolean) {
    if (!next) {
      await setBiometricEnabled(false);
      return;
    }
    if (!support?.enrolled) {
      Alert.alert(
        "Set up biometrics first",
        `No ${support?.label ?? "biometrics"} is set up on this phone yet. Add one in your phone's settings, then come back and turn this on.`
      );
      return;
    }
    const result = await promptUnlock("Confirm to turn on biometric unlock");
    if (result.success) await setBiometricEnabled(true);
    else if (result.message) Alert.alert("Not turned on", result.message);
  }

  return (
    <Card>
      <View className="flex-row items-center justify-between gap-3">
        <View className="flex-1 flex-row items-center gap-2.5">
          <Fingerprint size={17} color={palette.primary} />
          <View className="flex-1">
            <Text className="text-neutral-900 dark:text-neutral-100">Unlock with {support.label}</Text>
            <Text className="text-xs text-neutral-500">
              Ask for it when you open SplitEven, so only you can see your money.
            </Text>
          </View>
        </View>
        <Switch
          value={enabled === true}
          onValueChange={(v) => void onChange(v)}
          trackColor={{ true: palette.primaryFill, false: palette.track }}
          thumbColor={palette.primary}
        />
      </View>
    </Card>
  );
}
