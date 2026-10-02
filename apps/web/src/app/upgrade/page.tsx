"use client";

import Image from "next/image";
import { useState } from "react";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Check } from "@phosphor-icons/react";
import {
  PAYABLE_PLANS,
  PAYMENT_METHODS,
  SUBSCRIPTION_PLANS,
  type SubscriptionPaymentMethod,
  type SubscriptionTier,
} from "@evensplit/shared";
import { AuthGuard } from "@/components/auth/auth-guard";
import { AppShell } from "@/components/app-shell/top-nav";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { listMySubscriptionRequests, submitSubscriptionRequest } from "@/lib/api/subscriptions";
import { cn } from "@/lib/utils";

function UpgradeContent() {
  const { authUser, profile } = useAuth();
  const queryClient = useQueryClient();
  const [selectedPlan, setSelectedPlan] = useState<Exclude<SubscriptionTier, "free"> | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<SubscriptionPaymentMethod>("gcash");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { data: requests } = useQuery({
    queryKey: ["subscription-requests", authUser?.id],
    queryFn: () => listMySubscriptionRequests(authUser!.id),
    enabled: !!authUser?.id,
  });

  const pendingRequest = requests?.find((r) => r.status === "pending");
  const currentTier = profile?.subscription_tier ?? "free";
  const method = PAYMENT_METHODS[selectedMethod];

  async function onSubmit() {
    if (!authUser || !selectedPlan) return;
    if (referenceNumber.trim().length < 4) {
      toast.error("Enter the reference number from your payment receipt.");
      return;
    }
    setSubmitting(true);
    try {
      await submitSubscriptionRequest(
        authUser.id,
        selectedPlan,
        selectedMethod,
        SUBSCRIPTION_PLANS[selectedPlan].priceValue,
        referenceNumber.trim()
      );
      await queryClient.invalidateQueries({ queryKey: ["subscription-requests", authUser.id] });
      setSelectedPlan(null);
      setReferenceNumber("");
      toast.success("Submitted - we'll review it and activate your plan shortly.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not submit");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-2xl space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Upgrade</h1>
          <p className="text-sm text-muted-foreground">Pick a plan and pay directly - no card required.</p>
        </div>

        {pendingRequest && (
          <Card className="rounded-2xl border-2 border-accent bg-accent/10">
            <CardContent className="py-4">
              <p className="font-semibold">
                Your {SUBSCRIPTION_PLANS[pendingRequest.plan].name} upgrade is pending review
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Submitted {new Date(pendingRequest.created_at).toLocaleDateString()} · ref{" "}
                {pendingRequest.reference_number}
              </p>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-4 sm:grid-cols-3">
          {(Object.keys(SUBSCRIPTION_PLANS) as SubscriptionTier[]).map((tier) => {
            const plan = SUBSCRIPTION_PLANS[tier];
            const isCurrent = currentTier === tier;
            const isPayable = (PAYABLE_PLANS as readonly string[]).includes(tier);
            return (
              <Card
                key={tier}
                className={cn(
                  "rounded-2xl border-border/60",
                  selectedPlan === tier && "border-2 border-primary"
                )}
              >
                <CardContent className="space-y-3 py-5">
                  <div className="flex items-center justify-between">
                    <p className="text-lg font-bold">{plan.name}</p>
                    <p className="font-mono text-sm font-semibold text-primary">{plan.priceLabel}</p>
                  </div>
                  <ul className="space-y-1.5">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  {isCurrent ? (
                    <div className="rounded-full bg-muted px-4 py-2 text-center text-sm font-semibold text-muted-foreground">
                      Current plan
                    </div>
                  ) : isPayable ? (
                    <Button
                      variant={selectedPlan === tier ? "default" : "outline"}
                      size="sm"
                      className="w-full"
                      disabled={!!pendingRequest}
                      onClick={() => setSelectedPlan(tier as Exclude<SubscriptionTier, "free">)}
                    >
                      {selectedPlan === tier ? "Selected" : `Choose ${plan.name}`}
                    </Button>
                  ) : null}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {selectedPlan && (
          <Card className="rounded-2xl border-border/60">
            <CardContent className="space-y-4 py-5">
              <p className="font-semibold">Pay {SUBSCRIPTION_PLANS[selectedPlan].priceLabel} via</p>
              <div className="flex flex-wrap gap-2">
                {Object.values(PAYMENT_METHODS).map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setSelectedMethod(m.id)}
                    className={cn(
                      "rounded-full border px-3.5 py-1.5 text-xs font-medium",
                      selectedMethod === m.id
                        ? "border-primary bg-primary-light text-primary"
                        : "border-border/60 text-muted-foreground"
                    )}
                  >
                    {m.label}
                  </button>
                ))}
              </div>

              <div className="space-y-1 rounded-xl bg-muted p-4">
                <p className="text-xs text-muted-foreground">Send to</p>
                <p className="font-semibold">{method.accountName}</p>
                <p className="font-mono">{method.accountNumber}</p>
              </div>

              {selectedMethod === "maya" && (
                <Image
                  src="/payments/maya-qr.jpg"
                  alt="Maya QR code"
                  width={400}
                  height={560}
                  className="mx-auto h-auto w-full max-w-xs rounded-xl"
                />
              )}

              <div className="space-y-1.5">
                <Label htmlFor="reference_number">Reference number</Label>
                <Input
                  id="reference_number"
                  value={referenceNumber}
                  onChange={(e) => setReferenceNumber(e.target.value)}
                  placeholder="From your payment receipt"
                />
              </div>

              <Button className="w-full" onClick={onSubmit} disabled={submitting}>
                Submit for review
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                Your plan activates once the payment is verified, usually within a day.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </AppShell>
  );
}

export default function UpgradePage() {
  return (
    <AuthGuard>
      <UpgradeContent />
    </AuthGuard>
  );
}
