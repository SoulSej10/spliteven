import { Stack } from "expo-router";
import { AuthGuard } from "@/components/AuthGuard";
import { UpdatePrompt } from "@/components/UpdatePrompt";

export default function AppLayout() {
  return (
    <AuthGuard>
      <UpdatePrompt />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="groups/[groupId]/index" />
      </Stack>
    </AuthGuard>
  );
}
