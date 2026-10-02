import type { SubscriptionPaymentMethod, SubscriptionRequest, SubscriptionTier } from "@evensplit/shared";
import { getSupabaseClient } from "@/lib/supabase/client";

export async function submitSubscriptionRequest(
  userId: string,
  plan: Exclude<SubscriptionTier, "free">,
  paymentMethod: SubscriptionPaymentMethod,
  amount: number,
  referenceNumber: string
): Promise<SubscriptionRequest> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("subscription_requests")
    .insert({
      user_id: userId,
      plan,
      payment_method: paymentMethod,
      amount,
      reference_number: referenceNumber,
    })
    .select()
    .single();
  if (error) throw error;
  return data as SubscriptionRequest;
}

export async function listMySubscriptionRequests(userId: string): Promise<SubscriptionRequest[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("subscription_requests")
    .select()
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data as SubscriptionRequest[];
}

export async function listPendingSubscriptionRequests(): Promise<
  (SubscriptionRequest & { users: { display_name: string } })[]
> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("subscription_requests")
    .select("*, users!subscription_requests_user_id_fkey(display_name)")
    .eq("status", "pending")
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data as (SubscriptionRequest & { users: { display_name: string } })[];
}

export async function reviewSubscriptionRequest(
  requestId: string,
  status: "approved" | "rejected",
  reviewerId: string,
  adminNote?: string
): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase
    .from("subscription_requests")
    .update({
      status,
      reviewed_at: new Date().toISOString(),
      reviewed_by: reviewerId,
      admin_note: adminNote ?? null,
    })
    .eq("id", requestId);
  if (error) throw error;
}
