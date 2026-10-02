-- Fixes two WARN findings from Supabase's security linter
-- (anon_security_definer_function_executable /
-- authenticated_security_definer_function_executable):
-- public.handle_new_user_billing() is a SECURITY DEFINER trigger function
-- (see supabase/billing.sql) meant only to run automatically after a row is
-- inserted into auth.users. It was still directly callable by anyone via
-- the PostgREST RPC endpoint (/rest/v1/rpc/handle_new_user_billing).
--
-- Calling it that way would fail anyway — Postgres trigger functions rely
-- on a trigger context (NEW/OLD) that only exists when fired by the trigger
-- itself — but it should not be reachable from the API surface at all.
-- The trigger on auth.users keeps firing normally after this: that insert
-- runs as Supabase's internal auth role, not `anon`/`authenticated`, so it
-- never needed this grant in the first place.
-- Run this once in the Supabase SQL editor (Project -> SQL Editor -> New query).

revoke execute on function public.handle_new_user_billing() from anon, authenticated;
