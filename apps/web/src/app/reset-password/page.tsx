"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { passwordResetSchema, type PasswordResetInput, describeWeakPassword } from "@evensplit/shared";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { isPasswordPwned } from "@/lib/pwned-password";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit, formState } = useForm<PasswordResetInput>({
    resolver: zodResolver(passwordResetSchema),
  });

  async function onSubmit(values: PasswordResetInput) {
    setSubmitting(true);
    try {
      try {
        const { pwned, count } = await isPasswordPwned(values.password);
        if (pwned) {
          toast.error(
            `This password has appeared in ${count.toLocaleString()} data breach${count === 1 ? "" : "es"}. Please choose a different one.`
          );
          return;
        }
      } catch {
        // Best-effort check - never block a password reset if HaveIBeenPwned is unreachable.
      }

      const supabase = getSupabaseBrowserClient();
      // Requires an active recovery session, established by the reset-link
      // redirect handled at /auth/callback.
      const { error } = await supabase.auth.updateUser({ password: values.password });
      if (error) throw error;
      toast.success("Password updated. Please log in again.");
      router.push("/login");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Could not reset password";
      toast.error(describeWeakPassword(message) ?? message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-sm rounded-2xl border-border/60 shadow-sm">
        <CardHeader>
          <CardTitle>Choose a new password</CardTitle>
          <CardDescription>Enter a new password for your account.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="password">New password</Label>
              <PasswordInput id="password" autoComplete="new-password" {...register("password")} />
              {formState.errors.password && (
                <p className="text-xs text-destructive">{formState.errors.password.message}</p>
              )}
            </div>
            <Button type="submit" className="w-full" disabled={submitting}>
              Update password
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
