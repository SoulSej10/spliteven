import { Stack } from "expo-router";
import { AuthGuard } from "@/components/AuthGuard";
import { BiometricGate } from "@/components/BiometricGate";
import { UpdatePrompt } from "@/components/UpdatePrompt";

export default function AppLayout() {
  return (
    <AuthGuard>
      <BiometricGate>
        <UpdatePrompt />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="groups/[groupId]/index" />
        </Stack>
      </BiometricGate>
    </AuthGuard>
  );
}
