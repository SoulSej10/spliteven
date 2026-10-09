"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { logInSchema, signUpSchema, signupHitExistingAccount, type LogInInput, type SignUpInput, describeWeakPassword } from "@evensplit/shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { isPasswordPwned } from "@/lib/pwned-password";
import { Logo } from "@/components/brand/logo";
import { AcceptTermsGate } from "@/components/legal/accept-terms-gate";

export default function LoginPage() {
  const router = useRouter();
  const [tab, setTab] = useState<"login" | "signup">("login");
  const [submitting, setSubmitting] = useState(false);
  // Re-gated every time the signup tab is opened, regardless of whether this
  // browser has seen the terms before - account creation should never be
  // reachable without it, same as the mobile signup flow.
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const loginForm = useForm<LogInInput>({ resolver: zodResolver(logInSchema) });
  const signupForm = useForm<SignUpInput>({ resolver: zodResolver(signUpSchema) });

  async function onLogin(values: LogInInput) {
    setSubmitting(true);
    try {
      const supabase = getSupabaseBrowserClient();
      const { error } = await supabase.auth.signInWithPassword(values);
      if (error) throw error;
      router.push("/dashboard");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not sign in");
    } finally {
      setSubmitting(false);
    }
  }

  async function onGoogle() {
    setSubmitting(true);
    const { error } = await getSupabaseBrowserClient().auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/dashboard` },
    });
    if (error) {
      toast.error(error.message);
      setSubmitting(false);
    }
  }

  async function onSignUp(values: SignUpInput) {
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
        // Best-effort check - never block signup if HaveIBeenPwned is unreachable.
      }

      const supabase = getSupabaseBrowserClient();
      const { data, error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: { emailRedirectTo: `${window.location.origin}/onboarding` },
      });
      if (error) throw error;
      toast.success("Account created. Check your email to confirm, then finish your profile.");
      router.push("/onboarding");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Could not sign up";
      toast.error(describeWeakPassword(message) ?? message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex flex-col items-center gap-2 text-center">
          <Logo size={48} />
          <h1 className="text-2xl font-semibold tracking-tight">SplitEven</h1>
          <p className="text-sm text-muted-foreground">Split expenses. Stay even.</p>
        </div>

        <Card className="rounded-2xl border-border/60 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Welcome</CardTitle>
            <CardDescription>Sign in or create an account to continue</CardDescription>
          </CardHeader>
          <CardContent>
            <Button type="button" variant="outline" className="mb-4 w-full" disabled={submitting} onClick={onGoogle}>
              <svg viewBox="0 0 24 24" className="mr-2 h-4 w-4" aria-hidden="true">
                <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.5-.2-2.3H12v4.5h6.5a5.6 5.6 0 0 1-2.4 3.7v3h3.9c2.3-2.1 3.5-5.2 3.5-8.9z" />
                <path fill="#34A853" d="M12 24c3.2 0 6-1.1 8-2.9l-3.9-3c-1.1.7-2.5 1.2-4.1 1.2-3.1 0-5.8-2.1-6.7-5H1.3v3.1A12 12 0 0 0 12 24z" />
                <path fill="#FBBC05" d="M5.3 14.3a7.2 7.2 0 0 1 0-4.6V6.6H1.3a12 12 0 0 0 0 10.8l4-3.1z" />
                <path fill="#EA4335" d="M12 4.8c1.8 0 3.3.6 4.6 1.8l3.4-3.4A12 12 0 0 0 1.3 6.6l4 3.1c.9-2.8 3.6-4.9 6.7-4.9z" />
              </svg>
              Continue with Google
            </Button>
            <div className="mb-4 flex items-center gap-3 text-xs text-muted-foreground">
              <span className="h-px flex-1 bg-border" /> or <span className="h-px flex-1 bg-border" />
            </div>
            <Tabs value={tab} onValueChange={(v) => setTab(v as "login" | "signup")}>
              <TabsList className="w-full">
                <TabsTrigger value="login" className="flex-1">
                  Log in
                </TabsTrigger>
                <TabsTrigger value="signup" className="flex-1">
                  Sign up
                </TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="mt-4">
                <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="login-email">Email</Label>
                    <Input id="login-email" type="email" {...loginForm.register("email")} />
                    {loginForm.formState.errors.email && (
                      <p className="text-xs text-destructive">
                        {loginForm.formState.errors.email.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="login-password">Password</Label>
                      <Link
                        href="/forgot-password"
                        className="text-xs text-primary-deep hover:underline"
                      >
                        Forgot password?
                      </Link>
                    </div>
                    <PasswordInput
                      id="login-password"
                      {...loginForm.register("password")}
                    />
                    {loginForm.formState.errors.password && (
                      <p className="text-xs text-destructive">
                        {loginForm.formState.errors.password.message}
                      </p>
                    )}
                  </div>
                  <Button type="submit" className="w-full" disabled={submitting}>
                    Log in
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup" className="mt-4">
                {!agreedToTerms ? (
                  <AcceptTermsGate onAgree={() => setAgreedToTerms(true)} />
                ) : (
                  <form onSubmit={signupForm.handleSubmit(onSignUp)} className="space-y-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="signup-email">Email</Label>
                      <Input id="signup-email" type="email" {...signupForm.register("email")} />
                      {signupForm.formState.errors.email && (
                        <p className="text-xs text-destructive">
                          {signupForm.formState.errors.email.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="signup-password">Password</Label>
                      <PasswordInput
                        id="signup-password"
                        {...signupForm.register("password")}
                      />
                      {signupForm.formState.errors.password && (
                        <p className="text-xs text-destructive">
                          {signupForm.formState.errors.password.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="signup-confirm-password">Confirm password</Label>
                      <PasswordInput
                        id="signup-confirm-password"
                        {...signupForm.register("confirmPassword")}
                      />
                      {signupForm.formState.errors.confirmPassword && (
                        <p className="text-xs text-destructive">
                          {signupForm.formState.errors.confirmPassword.message}
                        </p>
                      )}
                    </div>
                    <Button type="submit" className="w-full" disabled={submitting}>
                      Create account
                    </Button>
                    <p className="text-center text-xs text-muted-foreground">
                      By creating an account, you agree to our{" "}
                      <Link href="/terms-of-service" className="underline hover:text-foreground">
                        Terms of Service
                      </Link>{" "}
                      and{" "}
                      <Link href="/privacy-policy" className="underline hover:text-foreground">
                        Privacy Policy
                      </Link>
                      .
                    </p>
                  </form>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground">
          <Link href="/" className="hover:underline">
            ← Back to home
          </Link>
        </p>
      </div>
    </div>
  );
}
