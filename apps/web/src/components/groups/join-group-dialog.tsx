"use client";

import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { UserPlus } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

/** Accepts either a bare invite code or a full invite link and returns just the code. */
function extractInviteCode(input: string): string {
  const trimmed = input.trim();
  const match = /\/invite\/([^/?#\s]+)/.exec(trimmed);
  return match ? match[1] : trimmed.replace(/[?#].*$/, "");
}

/** Join a group by pasting the invite code or link someone shared (otherwise only possible by opening the link itself). */
export function JoinGroupDialog({
  trigger,
  open: controlledOpen,
  onOpenChange,
}: { trigger?: ReactNode | null; open?: boolean; onOpenChange?: (open: boolean) => void }) {
  const router = useRouter();
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  const setOpen = (next: boolean) => {
    setInternalOpen(next);
    onOpenChange?.(next);
  };
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const code = extractInviteCode(value);
    if (!code) {
      setError("Paste the invite code or link a group member shared with you.");
      return;
    }
    setOpen(false);
    setValue("");
    setError(null);
    router.push(`/invite/${code}`);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger !== null && (
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="outline" className="rounded-full">
            <UserPlus className="mr-1 h-4 w-4" /> Join group
          </Button>
        )}
      </DialogTrigger>
      )}
      <DialogContent className="rounded-2xl sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Join a group</DialogTitle>
          <DialogDescription>Paste the invite link or code a group member shared with you.</DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="invite_code">Invite link or code</Label>
            <Input
              id="invite_code"
              value={value}
              onChange={(e) => {
                setValue(e.target.value);
                setError(null);
              }}
              placeholder="https://…/invite/abc123"
              autoComplete="off"
            />
            {error && <p className="text-xs text-destructive">{error}</p>}
          </div>
          <DialogFooter>
            <Button type="submit" className="w-full">
              Continue
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
