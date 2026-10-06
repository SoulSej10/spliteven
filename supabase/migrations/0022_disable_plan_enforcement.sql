-- Plans are switched off for the testing phase: every account gets every
-- feature. The enforcement triggers from 0021 stay installed but never fire,
-- because they all decide via tier_of().
--
-- To turn plans back on, re-run the tier_of() definition from
-- 0021_plan_limits.sql and set PLANS_ENABLED = true in
-- packages/shared/src/subscriptions.ts.

create or replace function public.tier_of(p_user_id uuid)
returns text
language sql
stable
security definer set search_path = public
as $$
  select 'premium'::text;
$$;

revoke all on function public.tier_of(uuid) from public, anon, authenticated;
