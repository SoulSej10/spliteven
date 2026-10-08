import { useEffect, useState } from "react";
import { AppState, Modal, Pressable, ScrollView, View } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { DownloadSimple } from "phosphor-react-native";
import type { AppUpdateInfo } from "@evensplit/shared";
import { Button } from "@/components/ui/Button";
import { Text } from "@/components/ui/typography";
import { dismissUpdate, fetchAvailableUpdate, getDismissedUpdate, openUpdateDownload } from "@/lib/app-update";
import { palette } from "@/theme/palette";

/** Update dialog body, shared by the automatic prompt and the Settings "Check for updates" button. */
export function UpdateDialog({
  info,
  visible,
  onLater,
}: {
  info: AppUpdateInfo;
  visible: boolean;
  onLater: () => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onLater}>
      <Pressable className="flex-1 items-center justify-center bg-black/50 px-6" onPress={onLater}>
        <Pressable
          onPress={(e) => e.stopPropagation()}
          className="w-full max-w-sm rounded-card border border-neutral-200 bg-surface p-6 dark:bg-surface-dark"
        >
          <View className="mb-4 h-11 w-11 items-center justify-center rounded-full bg-primary-light">
            <DownloadSimple size={22} weight="bold" color={palette.primary} />
          </View>
          <Text className="text-lg font-bold text-neutral-900 dark:text-neutral-100">Update available</Text>
          <Text className="mt-1 text-sm text-neutral-500">
            SplitEven {info.latestVersion} is ready. You have {info.currentVersion}.
          </Text>
          {info.notes ? (
            <ScrollView className="mt-3 max-h-40" showsVerticalScrollIndicator={false}>
              <Text className="text-sm leading-5 text-neutral-700 dark:text-neutral-300">{info.notes}</Text>
            </ScrollView>
          ) : null}
          <Text className="mt-3 text-xs text-neutral-500">
            Tap Download, then open the downloaded file to install over your current app. Your data stays in your account.
          </Text>
          <Button className="mt-5" onPress={() => void openUpdateDownload(info)}>
            Download update
          </Button>
          <Button className="mt-2" variant="outline" onPress={onLater}>
            Later
          </Button>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

/**
 * Checks for a newer release on launch and whenever the app returns to the
 * foreground, and offers it once per version (tapping Later hides that
 * version until a newer one ships; Settings can always re-check by hand).
 */
export function UpdatePrompt() {
  const { data: info, refetch } = useQuery({
    queryKey: ["app-update"],
    queryFn: fetchAvailableUpdate,
    enabled: !__DEV__,
    staleTime: 30 * 60 * 1000,
    retry: false,
  });
  const [dismissed, setDismissed] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    void getDismissedUpdate().then((v) => {
      setDismissed(v);
      setReady(true);
    });
  }, []);

  useEffect(() => {
    if (__DEV__) return;
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active") void refetch();
    });
    return () => sub.remove();
  }, [refetch]);

  if (!ready || !info || dismissed === info.latestVersion) return null;

  return (
    <UpdateDialog
      info={info}
      visible
      onLater={() => {
        setDismissed(info.latestVersion);
        void dismissUpdate(info.latestVersion);
      }}
    />
  );
}
