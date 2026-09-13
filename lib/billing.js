export const TRIAL_DAYS = 30;
export const PRICE_DISPLAY = process.env.NEXT_PUBLIC_PRICE_DISPLAY || '$9/month';

// `supabase` can be either the request-scoped server client or the admin
// client — both can read this table (RLS just narrows the user client to
// its own row).
export async function getBillingAccount(supabase, userId) {
  const { data } = await supabase
    .from('billing_accounts')
    .select('status, trial_ends_at, stripe_customer_id, stripe_subscription_id')
    .eq('user_id', userId)
    .single();

  return data;
}

// Turns a billing_accounts row into the flags the UI/API actually need.
// Missing row (e.g. account created before the billing migration ran and
// the backfill hasn't reached it yet) is treated as "no access" rather
// than silently granting a free pass.
export function evaluateBillingAccount(account) {
  if (!account) {
    return { hasAccess: false, status: 'none', trialEndsAt: null, daysLeft: 0 };
  }

  const trialEndsAt = account.trial_ends_at ? new Date(account.trial_ends_at) : null;
  const trialActive = account.status === 'trialing' && trialEndsAt && trialEndsAt.getTime() > Date.now();
  const hasAccess = account.status === 'active' || trialActive;

  const daysLeft = trialEndsAt
    ? Math.max(0, Math.ceil((trialEndsAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0;

  return {
    hasAccess,
    status: trialActive ? 'trialing' : account.status,
    trialEndsAt,
    daysLeft,
    stripeCustomerId: account.stripe_customer_id,
    stripeSubscriptionId: account.stripe_subscription_id
  };
}

export async function getBillingStatus(supabase, userId) {
  const account = await getBillingAccount(supabase, userId);
  return evaluateBillingAccount(account);
}
