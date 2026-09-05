import { useEffect, useRef, useState, type RefObject } from "react";
import { Dimensions, Modal, Pressable, Text, View } from "react-native";
import { Button } from "@/components/ui/Button";
import { hasSeenPageTour, setPageTourShown } from "@/lib/device-flags";

export interface TourStep {
  ref: RefObject<View | null>;
  title: string;
  body: string;
}

interface TargetRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Drives one page's guided tour: shows itself once per device (per `tourKey`)
 * on first visit, and can be replayed on demand by bumping `replaySignal`
 * (e.g. from a "?" header button) - each page's tour is independent.
 */
export function usePageTour(tourKey: string) {
  const [replaySignal, setReplaySignal] = useState(0);
  return { replaySignal, replay: () => setReplaySignal((n) => n + 1) };
}

/**
 * Sequential coach-mark overlay: highlights the real, measured position of
 * each step's target element (via `measureInWindow`) with a tooltip next to
 * it, rather than a generic full-screen slideshow - so "major parts of the
 * screen" actually point at those parts. Targets must pass
 * `collapsable={false}` on Android or `measureInWindow` can return stale/zero
 * values for otherwise-optimized-away Views.
 */
export function PageTour({
  tourKey,
  steps,
  replaySignal,
}: {
  tourKey: string;
  steps: TourStep[];
  replaySignal?: number;
}) {
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(0);
  const [rect, setRect] = useState<TargetRect | null>(null);
  const didAutoShow = useRef(false);

  useEffect(() => {
    if (didAutoShow.current) return;
    didAutoShow.current = true;
    void hasSeenPageTour(tourKey).then((seen) => {
      if (!seen) {
        const t = setTimeout(() => setVisible(true), 500);
        return () => clearTimeout(t);
      }
    });
  }, [tourKey]);

  useEffect(() => {
    if (replaySignal === undefined || replaySignal === 0) return;
    setStep(0);
    setVisible(true);
  }, [replaySignal]);

  useEffect(() => {
    if (!visible) return;
    const target = steps[step]?.ref.current;
    if (!target) {
      setRect(null);
      return;
    }
    const id = setTimeout(() => {
      target.measureInWindow((x, y, width, height) => setRect({ x, y, width, height }));
    }, 60);
    return () => clearTimeout(id);
  }, [visible, step, steps]);

  function finish() {
    setVisible(false);
    setRect(null);
    void setPageTourShown(tourKey);
  }

  if (!visible || steps.length === 0) return null;

  const current = steps[step];
  const isLast = step === steps.length - 1;
  const screenHeight = Dimensions.get("window").height;
  const showBelow = !rect || rect.y < screenHeight * 0.55;

  return (
    <Modal visible transparent animationType="fade" onRequestClose={finish}>
      <View className="flex-1 bg-black/70">
        <Pressable className="absolute inset-0" onPress={finish} accessibilityLabel="Close tour" />

        {rect && (
          <View
            pointerEvents="none"
            style={{
              position: "absolute",
              left: rect.x - 6,
              top: rect.y - 6,
              width: rect.width + 12,
              height: rect.height + 12,
              borderRadius: 16,
              borderWidth: 2,
              borderColor: "#5FBBA5",
            }}
          />
        )}

        <View
          style={
            rect
              ? showBelow
                ? { position: "absolute", left: 20, right: 20, top: rect.y + rect.height + 16 }
                : { position: "absolute", left: 20, right: 20, bottom: screenHeight - rect.y + 16 }
              : { position: "absolute", left: 20, right: 20, top: screenHeight / 2 - 90 }
          }
          className="gap-3 rounded-2xl bg-surface p-4 dark:bg-surface-dark"
        >
          <View className="flex-row items-start justify-between gap-2">
            <Text className="flex-1 text-base font-bold text-neutral-900 dark:text-neutral-100">
              {current.title}
            </Text>
            <Pressable onPress={finish} hitSlop={8}>
              <Text className="text-sm font-medium text-neutral-500">Skip</Text>
            </Pressable>
          </View>
          <Text className="text-sm text-neutral-500">{current.body}</Text>

          <View className="flex-row items-center justify-between gap-3 pt-1">
            <View className="flex-row gap-1.5">
              {steps.map((_, i) => (
                <View
                  key={i}
                  className={i === step ? "h-1.5 w-4 rounded-full bg-primary" : "h-1.5 w-1.5 rounded-full bg-neutral-500/30"}
                />
              ))}
            </View>
            <Button size="sm" onPress={() => (isLast ? finish() : setStep((s) => s + 1))}>
              <Text className="text-sm font-semibold text-white">{isLast ? "Got it" : "Next"}</Text>
            </Button>
          </View>
        </View>
      </View>
    </Modal>
  );
}
