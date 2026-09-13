import { createClient } from '@supabase/supabase-js';

// Service-role client: bypasses RLS. Only use it server-side, in places
// with no logged-in user to scope queries to (Stripe webhooks, cron jobs).
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}
