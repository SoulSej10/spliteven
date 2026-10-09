"use client";

import { iconSectionsFor } from "@evensplit/shared";
import { AppIcon } from "@/components/ui/app-icon";

/**
 * Icon grid for group, account and category creation: every icon in the catalog, grouped by
 * what people spend on (phone & internet, electronics, baby & kids...), with the sections that
 * suit this screen first. Scrolls inside its own box so the dialog stays short.
 */
export function IconPicker({
  kind,
  value,
  onChange,
}: {
  kind: "group" | "account" | "category";
  value: string;
  onChange: (emoji: string) => void;
}) {
  const sections = iconSectionsFor(kind);

  return (
    <div className="max-h-60 space-y-3 overflow-y-auto rounded-xl border border-border p-3">
      {sections.map((section) => (
        <div key={section.id} className="space-y-1.5">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{section.label}</p>
          <div className="flex flex-wrap gap-2">
            {section.items.map(([emoji, , label]) => (
              <button
                type="button"
                key={emoji}
                title={label}
                aria-label={label}
                aria-pressed={value === emoji}
                onClick={() => onChange(emoji)}
                className={`flex h-10 w-10 items-center justify-center rounded-xl transition-colors ${
                  value === emoji ? "bg-primary-light ring-2 ring-primary" : "bg-muted"
                }`}
              >
                <AppIcon value={emoji} size={22} />
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
