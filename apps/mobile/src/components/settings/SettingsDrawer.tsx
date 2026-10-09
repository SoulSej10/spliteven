import { useEffect } from "react";
import { BackHandler, Pressable, StyleSheet, useWindowDimensions, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { useSettingsDrawer } from "@/context/settings-drawer";
import { SettingsPanelContent } from "./SettingsPanelContent";

const OPEN_DURATION = 230;
const CLOSE_DURATION = 190;

/**
 * Left-sliding Settings panel over the tabs, dismissed by tapping the dimmed backdrop or the
 * Android back button.
 *
 * It used to be a React Native <Modal> mounted on open: that spins up a whole new native window
 * and renders the full panel in the same frame the animation starts, which made the first
 * frames of the slide stutter. Now the panel is always mounted as a plain absolutely-positioned
 * layer (the menu inside is cheap) and opening only moves it with a native-driven transform, so
 * there is nothing to build while it slides.
 */
export function SettingsDrawer() {
  const { visible, close } = useSettingsDrawer();
  const { width, height } = useWindowDimensions();
  const panelWidth = Math.min(Math.round(width * 0.82), 380);
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(visible ? 1 : 0, {
      duration: visible ? OPEN_DURATION : CLOSE_DURATION,
      easing: visible ? Easing.out(Easing.cubic) : Easing.in(Easing.cubic),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- shared values are stable refs, not reactive deps
  }, [visible]);

  useEffect(() => {
    if (!visible) return;
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      close();
      return true;
    });
    return () => sub.remove();
  }, [visible, close]);

  const panelStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: (progress.value - 1) * panelWidth }],
  }));
  const backdropStyle = useAnimatedStyle(() => ({ opacity: progress.value }));

  return (
    <View
      pointerEvents={visible ? "auto" : "none"}
      style={[StyleSheet.absoluteFill, { zIndex: 50, elevation: 50 }]}
      accessibilityElementsHidden={!visible}
      importantForAccessibility={visible ? "auto" : "no-hide-descendants"}
    >
      <Animated.View style={[StyleSheet.absoluteFill, backdropStyle]}>
        <Pressable className="flex-1 bg-black/40" onPress={close} accessibilityLabel="Close settings" />
      </Animated.View>
      <Animated.View
        className="bg-surface dark:bg-surface-dark"
        style={[{ position: "absolute", left: 0, top: 0, bottom: 0, width: panelWidth, height }, panelStyle]}
      >
        <SafeAreaView className="flex-1" edges={["top", "bottom"]}>
          <SettingsPanelContent onClose={close} />
        </SafeAreaView>
      </Animated.View>
    </View>
  );
}
