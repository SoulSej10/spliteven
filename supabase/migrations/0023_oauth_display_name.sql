-- Google (and other OAuth) sign-ins carry the person's name as full_name / name,
-- not display_name: use it so new Google users don't start as their email prefix.
-- Also restores the PHP default currency that 0019 accidentally reverted to USD.
-- Everything else is unchanged from 0019 (seed categories + Cash account).

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  v_currency text;
begin
  v_currency := coalesce(new.raw_user_meta_data ->> 'default_currency', 'PHP');

  insert into public.users (id, display_name, default_currency)
  values (
    new.id,
    coalesce(
      nullif(new.raw_user_meta_data ->> 'display_name', ''),
      nullif(new.raw_user_meta_data ->> 'full_name', ''),
      nullif(new.raw_user_meta_data ->> 'name', ''),
      split_part(new.email, '@', 1)
    ),
    v_currency
  )
  on conflict (id) do nothing;

  insert into public.personal_categories (user_id, name, icon, kind)
  values
    (new.id, 'Food & Dining', '🍔', 'expense'),
    (new.id, 'Groceries', '🛒', 'expense'),
    (new.id, 'Transport', '🚗', 'expense'),
    (new.id, 'Housing', '🏠', 'expense'),
    (new.id, 'Utilities', '💡', 'expense'),
    (new.id, 'Shopping', '🛍️', 'expense'),
    (new.id, 'Health', '💊', 'expense'),
    (new.id, 'Entertainment', '🎬', 'expense'),
    (new.id, 'Travel', '✈️', 'expense'),
    (new.id, 'Other', '🏷️', 'expense'),
    (new.id, 'Salary', '💰', 'income'),
    (new.id, 'Gifts', '🎁', 'income'),
    (new.id, 'Other income', '💵', 'income')
  on conflict (user_id, name, kind) do nothing;

  insert into public.personal_accounts (user_id, name, type, currency, starting_balance, icon)
  values (new.id, 'Cash', 'cash', v_currency, 0, '💵');

  return new;
end;
$$;
