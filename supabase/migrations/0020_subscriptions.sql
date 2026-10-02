-- Manual-payment subscription plans (Free / Pro / Premium).
--
-- There's no payment processor integration here - EvenSplit isn't on the
-- Play Store yet, so users pay the app owner directly via GCash/Maya/bank
-- transfer and submit a reference number. The owner reviews pending
-- requests and approves them, which flips the user's subscription_tier via
-- the trigger below. `public.is_admin()` checks the JWT email rather than a
-- column so there's nothing to backfill for the one owner account.

alter table public.users
  add column if not exists subscription_tier text not null default 'free'
    check (subscription_tier in ('free', 'pro', 'premium'));

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer set search_path = public
as $$
  select coalesce((auth.jwt() ->> 'email') = 'jesstahil10@gmail.com', false);
$$;

create table if not exists public.subscription_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  plan text not null check (plan in ('pro', 'premium')),
  payment_method text not null check (payment_method in ('gcash', 'maya', 'bdo', 'maribank')),
  amount numeric(12, 2) not null,
  reference_number text not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  admin_note text,
  created_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by uuid references public.users (id)
);

comment on table public.subscription_requests is
  'Manual payment claims awaiting owner approval. Approval flips users.subscription_tier via trigger.';

alter table public.subscription_requests enable row level security;

create policy "users can view their own subscription requests"
  on public.subscription_requests for select
  using (user_id = auth.uid() or public.is_admin());

create policy "users can submit their own subscription requests"
  on public.subscription_requests for insert
  with check (user_id = auth.uid() and status = 'pending');

create policy "admin can update subscription requests"
  on public.subscription_requests for update
  using (public.is_admin())
  with check (public.is_admin());

create or replace function public.apply_subscription_approval()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if new.status = 'approved' and old.status is distinct from 'approved' then
    update public.users set subscription_tier = new.plan where id = new.user_id;
  end if;
  return new;
end;
$$;

drop trigger if exists on_subscription_request_approved on public.subscription_requests;
create trigger on_subscription_request_approved
  after update on public.subscription_requests
  for each row execute procedure public.apply_subscription_approval();

alter publication supabase_realtime add table public.subscription_requests;
