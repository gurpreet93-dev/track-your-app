import { NextResponse } from 'next/server';
import { createClient } from '../../../../lib/supabase-server';
import { createAdminClient } from '../../../../lib/supabase-admin';
import { getStripe } from '../../../../lib/stripe';
import { getBillingAccount } from '../../../../lib/billing';

export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Not logged in' }, { status: 401 });
  }

  const admin = createAdminClient();

  // Cancel any active Stripe subscription first so deleting the account
  // doesn't leave a subscription billing a customer nobody can manage anymore.
  const account = await getBillingAccount(supabase, user.id);
  if (account?.stripe_subscription_id && process.env.STRIPE_SECRET_KEY) {
    try {
      await getStripe().subscriptions.cancel(account.stripe_subscription_id);
    } catch (err) {
      console.error('Failed to cancel Stripe subscription during account deletion:', err);
    }
  }

  await admin.from('subscriptions').delete().eq('user_id', user.id);
  await admin.from('billing_accounts').delete().eq('user_id', user.id);

  const { error } = await admin.auth.admin.deleteUser(user.id);
  if (error) {
    return NextResponse.json({ error: 'Failed to delete account. Please contact support.' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
