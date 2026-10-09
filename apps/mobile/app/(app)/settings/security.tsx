import { useState } from "react";
import { Alert, View } from "react-native";
import { Text } from "@/components/ui/typography";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import { SettingsScreen } from "@/components/settings/SettingsScreen";
import { BiometricLoginToggle, BiometricToggle } from "@/components/settings/BiometricToggle";
import { getSupabaseClient } from "@/lib/supabase/client";
import { isPasswordPwned } from "@/lib/pwned-password";
import { disableBiometricLogin } from "@/lib/biometric-login";

/** Change password, fingerprint unlock and fingerprint sign-in. */
export default function SecuritySettingsScreen() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changing, setChanging] = useState(false);

  async function onSubmitPassword() {
    if (newPassword.length < 8) {
      Alert.alert("Password too short", "Use at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert("Passwords don't match", "Re-enter your new password.");
      return;
    }
    setChanging(true);
    try {
      try {
        const { pwned, count } = await isPasswordPwned(newPassword);
        if (pwned) {
          Alert.alert(
            "Choose a different password",
            `This password has appeared in ${count.toLocaleString()} data breach${count === 1 ? "" : "es"}. Please choose a different one.`
          );
          return;
        }
      } catch {
        // Best-effort check - never block a password change if HaveIBeenPwned is unreachable.
      }
      const { error } = await getSupabaseClient().auth.updateUser({ password: newPassword });
      if (error) throw error;
      await disableBiometricLogin(); // the saved password is now out of date
      setNewPassword("");
      setConfirmPassword("");
      Alert.alert("Password updated");
    } catch (err) {
      Alert.alert("Could not update password", err instanceof Error ? err.message : "Try again");
    } finally {
      setChanging(false);
    }
  }

  return (
    <SettingsScreen title="Security & sign-in">
      <Card className="gap-2.5">
        <Text className="font-semibold text-neutral-900 dark:text-neutral-100">Change password</Text>
        <TextField
          value={newPassword}
          onChangeText={setNewPassword}
          placeholder="New password"
          secureTextEntry
          autoCapitalize="none"
          autoComplete="new-password"
          textContentType="newPassword"
          importantForAutofill="yes"
        />
        <TextField
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder="Confirm new password"
          secureTextEntry
          autoCapitalize="none"
          autoComplete="new-password"
          textContentType="newPassword"
          importantForAutofill="yes"
        />
        <Button onPress={onSubmitPassword} loading={changing}>
          Update password
        </Button>
      </Card>

      <View className="gap-4">
        <BiometricToggle />
        <BiometricLoginToggle />
      </View>
    </SettingsScreen>
  );
}
