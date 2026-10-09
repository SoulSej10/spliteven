import { useCallback, useEffect, useState } from "react";
import { Alert } from "react-native";
import { router } from "expo-router";
import { disableBiometricLogin, getBiometricLoginState, readBiometricCredentials } from "@/lib/biometric-login";
import { getSupabaseClient } from "@/lib/supabase/client";

/**
 * Fingerprint / face sign-in for the login and forgot-password screens. `available`
 * is true once the person has turned it on after a previous password sign-in.
 */
export function useBiometricSignIn() {
  const [available, setAvailable] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    void getBiometricLoginState().then((state) => {
      if (active) setAvailable(state === "on");
    });
    return () => {
      active = false;
    };
  }, []);

  const signIn = useCallback(async (destination: "home" | "reset" = "home") => {
    setBusy(true);
    try {
      const credentials = await readBiometricCredentials();
      if (!credentials) return; // cancelled, or the scan failed: stay on the screen
      const { error } = await getSupabaseClient().auth.signInWithPassword(credentials);
      if (error) {
        // The saved password no longer works (changed elsewhere): drop it and fall back to typing.
        await disableBiometricLogin();
        setAvailable(false);
        Alert.alert(
          "Saved sign-in is out of date",
          "Your password has changed since fingerprint sign-in was turned on. Sign in with your password, then turn it on again."
        );
        return;
      }
      if (destination === "reset") router.replace({ pathname: "/auth/reset-password", params: { via: "biometric" } });
      else router.replace("/");
    } finally {
      setBusy(false);
    }
  }, []);

  return { available, busy, signIn };
}
