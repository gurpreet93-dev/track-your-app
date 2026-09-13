-- Tracks whether the developer has already replied to a review on the
-- Play Store, so the dashboard can surface "response rate" and unreplied
-- negative reviews (a feature competitors like ReviewPilot lead with).
-- Run this once in the Supabase SQL editor.

alter table public.reviews
  add column if not exists replied boolean not null default false,
  add column if not exists reply_text text,
  add column if not exists reply_date timestamptz;
