-- Billing / subscription-payment support for Track Your App.
-- Run this once in the Supabase SQL editor (Project -> SQL Editor -> New query).
--
-- Every user gets a 30-day free trial starting at signup (trial_ends_at,
-- set automatically below). After that, `status` must become 'active'
-- (via Stripe Checkout) for them to keep using paid features.

create table if not exists public.billing_accounts (
  user_id uuid primary key references auth.users(id) on delete cascade,
  stripe_customer_id text unique,
  stripe_subscription_id text unique,
  status text not null default 'trialing', -- trialing | active | past_due | canceled
  trial_ends_at timestamptz not null default (now() + interval '30 days'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.billing_accounts enable row level security;

drop policy if exists "Users can view their own billing account" on public.billing_accounts;
create policy "Users can view their own billing account"
  on public.billing_accounts for select
  using (auth.uid() = user_id);

-- Give every new signup a billing_accounts row (and therefore a trial) automatically.
create or replace function public.handle_new_user_billing()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.billing_accounts (user_id)
  values (new.id)
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_billing on auth.users;
create trigger on_auth_user_created_billing
  after insert on auth.users
  for each row execute function public.handle_new_user_billing();

-- Backfill existing users who signed up before this migration ran.
insert into public.billing_accounts (user_id)
select id from auth.users
on conflict (user_id) do nothing;
