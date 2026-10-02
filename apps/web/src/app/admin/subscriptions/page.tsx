"use client";

import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { PAYMENT_METHODS, SUBSCRIPTION_ADMIN_EMAIL, SUBSCRIPTION_PLANS } from "@evensplit/shared";
import { AuthGuard } from "@/components/auth/auth-guard";
import { AppShell } from "@/components/app-shell/top-nav";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { listPendingSubscriptionRequests, reviewSubscriptionRequest } from "@/lib/api/subscriptions";

function AdminSubscriptionsContent() {
  const { authUser } = useAuth();
  const queryClient = useQueryClient();
  const isAdmin = authUser?.email === SUBSCRIPTION_ADMIN_EMAIL;

  const { data: requests, isLoading } = useQuery({
    queryKey: ["pending-subscription-requests"],
    queryFn: listPendingSubscriptionRequests,
    enabled: isAdmin,
  });

  async function onReview(id: string, status: "approved" | "rejected") {
    if (!authUser) return;
    try {
      await reviewSubscriptionRequest(id, status, authUser.id);
      await queryClient.invalidateQueries({ queryKey: ["pending-subscription-requests"] });
      toast.success(status === "approved" ? "Approved" : "Rejected");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update");
    }
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-2xl space-y-6">
        <h1 className="text-2xl font-semibold tracking-tight">Subscription requests</h1>

        {!isAdmin ? (
          <p className="text-sm text-muted-foreground">Not available.</p>
        ) : isLoading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : !requests || requests.length === 0 ? (
          <p className="text-sm text-muted-foreground">No pending requests.</p>
        ) : (
          <div className="space-y-3">
            {requests.map((req) => (
              <Card key={req.id} className="rounded-2xl border-border/60">
                <CardContent className="space-y-2 py-4">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold">{req.users.display_name}</p>
                    <p className="font-mono text-sm font-semibold text-primary">
                      {SUBSCRIPTION_PLANS[req.plan].priceLabel}
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {SUBSCRIPTION_PLANS[req.plan].name} via {PAYMENT_METHODS[req.payment_method].label} · ref{" "}
                    {req.reference_number}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    Submitted {new Date(req.created_at).toLocaleString()}
                  </p>
                  <div className="flex gap-2 pt-1">
                    <Button size="sm" className="flex-1" onClick={() => onReview(req.id, "approved")}>
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 border-destructive/40 text-destructive"
                      onClick={() => onReview(req.id, "rejected")}
                    >
                      Reject
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}

export default function AdminSubscriptionsPage() {
  return (
    <AuthGuard>
      <AdminSubscriptionsContent />
    </AuthGuard>
  );
}
