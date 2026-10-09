"use client";

import { useEffect, useRef, useState, type ComponentType } from "react";
import { ArrowDownLeft, ArrowsLeftRight, ArrowUpRight, Plus, UserPlus } from "@phosphor-icons/react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { AddTransactionDialog } from "@/components/personal/add-transaction-dialog";
import { CreateGroupDialog } from "@/components/groups/create-group-dialog";
import { JoinGroupDialog } from "@/components/groups/join-group-dialog";

type Choice = "expense" | "income" | "transfer" | "group" | "join";

const OPTIONS: { value: Choice; label: string; hint: string; icon: ComponentType<{ className?: string }>; tone: string }[] = [
  { value: "expense", label: "Expense", hint: "Money you spent", icon: ArrowUpRight, tone: "text-negative" },
  { value: "income", label: "Income", hint: "Money you received", icon: ArrowDownLeft, tone: "text-positive" },
  { value: "transfer", label: "Transfer", hint: "Move money between your accounts", icon: ArrowsLeftRight, tone: "text-muted-foreground" },
  { value: "group", label: "New group", hint: "Start a shared ledger", icon: Plus, tone: "text-primary-deep" },
  { value: "join", label: "Join group", hint: "Use an invite code", icon: UserPlus, tone: "text-primary-deep" },
];

/**
 * What the bottom bar's middle button offers on Home: one place to add anything, the same list the
 * phone app shows. Picking an option closes the sheet and opens the matching dialog.
 */
export function CreateMenu({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [choice, setChoice] = useState<Choice | null>(null);
  const timer = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (timer.current) window.clearTimeout(timer.current);
    },
    []
  );

  function pick(next: Choice) {
    onOpenChange(false);
    // Let the sheet finish closing before the dialog opens, so the two never fight over focus.
    timer.current = window.setTimeout(() => setChoice(next), 220);
  }

  const close = (isOpen: boolean) => {
    if (!isOpen) setChoice(null);
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="bottom" className="rounded-t-3xl pb-[max(1rem,env(safe-area-inset-bottom))]">
          <SheetHeader>
            <SheetTitle>Create</SheetTitle>
            <SheetDescription className="sr-only">Choose what to add</SheetDescription>
          </SheetHeader>
          <div className="space-y-1 px-3 pb-2">
            {OPTIONS.map((o) => (
              <button
                key={o.value}
                type="button"
                onClick={() => pick(o.value)}
                className="flex w-full items-center gap-3 rounded-2xl px-2 py-3 text-left active:bg-muted"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-muted">
                  <o.icon className={`h-5 w-5 ${o.tone}`} />
                </span>
                <span>
                  <span className="block text-sm font-semibold">{o.label}</span>
                  <span className="block text-xs text-muted-foreground">{o.hint}</span>
                </span>
              </button>
            ))}
          </div>
        </SheetContent>
      </Sheet>

      <AddTransactionDialog
        trigger={null}
        initialKind={choice === "income" ? "income" : choice === "transfer" ? "transfer" : "expense"}
        open={choice === "expense" || choice === "income" || choice === "transfer"}
        onOpenChange={close}
      />
      <CreateGroupDialog trigger={null} open={choice === "group"} onOpenChange={close} />
      <JoinGroupDialog trigger={null} open={choice === "join"} onOpenChange={close} />
    </>
  );
}
