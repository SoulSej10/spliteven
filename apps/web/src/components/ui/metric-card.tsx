import type { ComponentType, ReactNode } from "react";
import { cn } from "@/lib/utils";

type MetricTone = "primary" | "positive" | "negative" | "warning" | "muted";

const TONE_CLASSES: Record<MetricTone, string> = {
  primary: "bg-primary-light text-primary-deep",
  positive: "bg-positive/10 text-positive",
  negative: "bg-negative/10 text-negative",
  warning: "bg-warning/15 text-warning",
  muted: "bg-muted text-muted-foreground",
};

const VALUE_TONE_CLASSES: Record<MetricTone, string> = {
  primary: "text-foreground",
  positive: "text-positive",
  negative: "text-negative",
  warning: "text-foreground",
  muted: "text-foreground",
};

export interface MetricSplit {
  label: string;
  value: string;
}

/**
 * SaaS-dashboard style stat tile: icon square top-left, label top-right,
 * a large primary value, and optionally a two-column split underneath
 * (mirrors the "Outbound 9 / Inbound 5" pattern from the reference
 * warehouse dashboard). Used for KPI rows across Dashboard/Groups/Insights.
 */
export function MetricCard({
  icon: Icon,
  label,
  value,
  tone = "primary",
  split,
  className,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
  tone?: MetricTone;
  split?: [MetricSplit, MetricSplit];
  className?: string;
}) {
  return (
    <div className={cn("min-w-0 rounded-2xl border border-border bg-card p-3.5 shadow-sm sm:rounded-xl sm:p-4", className)}>
      <div className="flex items-start justify-between gap-2">
        <span className={cn("hidden h-9 w-9 shrink-0 items-center justify-center rounded-lg sm:flex", TONE_CLASSES[tone])}>
          <Icon className="h-4 w-4" />
        </span>
        <span className="text-[11px] font-medium leading-tight text-muted-foreground sm:truncate sm:text-xs">{label}</span>
      </div>

      <p className={cn("mt-1.5 truncate text-lg font-bold tabular-nums sm:mt-3 sm:text-2xl", VALUE_TONE_CLASSES[tone])}>{value}</p>

      {split && (
        <div className="mt-3 grid grid-cols-2 gap-2 border-t border-border/60 pt-2.5">
          {split.map((s) => (
            <div key={s.label}>
              <p className="text-[11px] text-muted-foreground">{s.label}</p>
              <p className="text-sm font-semibold tabular-nums">{s.value}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/** Responsive grid wrapper so every MetricCard row lines up the same way. */
export function MetricCardGrid({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("grid grid-cols-2 gap-3 lg:grid-cols-4", className)}>{children}</div>;
}
