-- Fixes two CRITICAL findings from Supabase's security linter
-- (rls_disabled_in_public): `public.apps` and `public.reviews` had no Row
-- Level Security enabled, so anyone with the project URL could read, edit,
-- or delete every row in those tables directly via the PostgREST API —
-- not just the rows the app's own queries expose.
-- Run this once in the Supabase SQL editor (Project -> SQL Editor -> New query).

alter table public.apps enable row level security;
alter table public.reviews enable row level security;

-- Apps aren't owned by a single user — the same app can be tracked by many
-- users (tracking a competitor's app is an explicit feature), and app_name /
-- package_name are public Play Store listing data, not private. Any signed-in
-- user can look up or add an app; only the server (service-role client, used
-- by the cron digest job) writes to apps/reviews on their behalf otherwise.
drop policy if exists "Authenticated users can view apps" on public.apps;
create policy "Authenticated users can view apps"
  on public.apps for select
  to authenticated
  using (true);

drop policy if exists "Authenticated users can add apps" on public.apps;
create policy "Authenticated users can add apps"
  on public.apps for insert
  to authenticated
  with check (true);

-- Reviews belong to an app, not a user, but should only be visible/insertable
-- to users who are actually tracking that app (have a subscriptions row for
-- it) — matching how the rest of the dashboard already scopes access.
drop policy if exists "Users can view reviews for apps they track" on public.reviews;
create policy "Users can view reviews for apps they track"
  on public.reviews for select
  to authenticated
  using (
    exists (
      select 1 from public.subscriptions s
      where s.app_id = reviews.app_id
        and s.user_id = auth.uid()
    )
  );

drop policy if exists "Users can add reviews for apps they track" on public.reviews;
create policy "Users can add reviews for apps they track"
  on public.reviews for insert
  to authenticated
  with check (
    exists (
      select 1 from public.subscriptions s
      where s.app_id = reviews.app_id
        and s.user_id = auth.uid()
    )
  );
