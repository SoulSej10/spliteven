-- Server-side enforcement of subscription plan limits (see packages/shared/src/subscriptions.ts PLAN_LIMITS).
--
--   Free:    up to 2 active (non-archived) groups, no receipt photos, no recurring expenses
--   Pro:     unlimited groups, receipt photos
--   Premium: everything, including recurring expenses
--
-- Enforced with triggers on the tables themselves so every path is covered
-- (create group, join via invite, create/update expense). Existing data is
-- grandfathered: a free user already over a limit keeps what they have, they
-- just can't add more. Calls with no user (the service-role Edge Functions
-- that materialize recurring expenses) are never blocked.

create or replace function public.tier_of(p_user_id uuid)
returns text
language sql
stable
security definer set search_path = public
as $$
  select case
    when exists (select 1 from auth.users where id = p_user_id and email = 'jesstahil10@gmail.com') then 'premium'
    else coalesce((select subscription_tier from public.users where id = p_user_id), 'free')
  end;
$$;

revoke all on function public.tier_of(uuid) from public, anon, authenticated;

-- Group limit: runs on every new membership, which covers both creating a
-- group (the owner row is inserted by on_group_created) and accepting an invite.
create or replace function public.enforce_group_limit()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  v_count integer;
begin
  if public.tier_of(new.user_id) <> 'free' then
    return new;
  end if;

  select count(*) into v_count
  from public.group_members gm
  join public.groups g on g.id = gm.group_id
  where gm.user_id = new.user_id and g.archived_at is null;

  if v_count >= 2 then
    raise exception 'plan_limit:groups' using errcode = 'P0001';
  end if;
  return new;
end;
$$;

drop trigger if exists enforce_group_limit_trigger on public.group_members;
create trigger enforce_group_limit_trigger
  before insert on public.group_members
  for each row execute procedure public.enforce_group_limit();

-- Receipt photos need Pro; recurring expenses need Premium. Only newly
-- added/changed values are checked, so editing an old expense that already
-- has a receipt or recurrence keeps working.
create or replace function public.enforce_expense_plan()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  v_tier text;
begin
  if auth.uid() is null then
    return new;
  end if;

  v_tier := public.tier_of(auth.uid());
  if v_tier = 'premium' then
    return new;
  end if;

  if v_tier = 'free'
     and new.receipt_url is not null
     and (tg_op = 'INSERT' or new.receipt_url is distinct from old.receipt_url) then
    raise exception 'plan_limit:receipts' using errcode = 'P0001';
  end if;

  if new.is_recurring
     and (tg_op = 'INSERT' or not old.is_recurring) then
    raise exception 'plan_limit:recurring' using errcode = 'P0001';
  end if;

  return new;
end;
$$;

drop trigger if exists enforce_expense_plan_trigger on public.expenses;
create trigger enforce_expense_plan_trigger
  before insert or update on public.expenses
  for each row execute procedure public.enforce_expense_plan();
