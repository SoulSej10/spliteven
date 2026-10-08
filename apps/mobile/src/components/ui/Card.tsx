import { View, type ViewProps } from "react-native";
import { cn } from "@/lib/cn";

/**
 * Big rounded card with soft elevation — the base visual unit across the
 * app per PROJECT_PLAN §3.5 (consumer-fintech direction: no boxy forms,
 * no dense tables).
 */
export function Card({ className, style, ...props }: ViewProps & { className?: string }) {
  return (
    <View
      className={cn(
        "rounded-card border border-neutral-200 bg-surface p-4 dark:bg-surface-dark",
        className
      )}
      style={[
        { shadowColor: "#2A2528", shadowOpacity: 0.03, shadowRadius: 6, shadowOffset: { width: 0, height: 1 }, elevation: 0 },
        style,
      ]}
      {...props}
    />
  );
}
