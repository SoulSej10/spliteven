"use client";

import { useState, type ComponentProps } from "react";
import { Eye, EyeSlash } from "@phosphor-icons/react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

/** A password <Input> with a show/hide eye toggle. */
export function PasswordInput({ className, ...props }: ComponentProps<"input">) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <Input type={visible ? "text" : "password"} className={cn("pr-9", className)} {...props} />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        tabIndex={-1}
        aria-label={visible ? "Hide password" : "Show password"}
        className="absolute top-1/2 right-2 flex h-5 w-5 -translate-y-1/2 items-center justify-center text-muted-foreground hover:text-foreground"
      >
        {visible ? <EyeSlash className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
}
