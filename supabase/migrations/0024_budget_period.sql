-- Budgets can now cover a month, a quarter, or a year. Existing budgets stay monthly.
-- The column `monthly_limit` keeps its name so older app versions keep working; it now means
-- "the limit for one period", whatever `period` says.
alter table public.personal_budgets
  add column if not exists period text not null default 'monthly'
  check (period in ('monthly', 'quarterly', 'yearly'));
