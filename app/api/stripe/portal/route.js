import { NextResponse } from 'next/server';
import { createClient } from '../../../../lib/supabase-server';
import { getStripe } from '../../../../lib/stripe';
import { getBillingAccount } from '../../../../lib/billing';

export async function POST(request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Not logged in' }, { status: 401 });
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: 'Payments are not configured yet.' }, { status: 500 });
  }

  const account = await getBillingAccount(supabase, user.id);

  if (!account?.stripe_customer_id) {
    return NextResponse.json({ error: 'No billing account found yet. Subscribe first.' }, { status: 400 });
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin;

  const session = await getStripe().billingPortal.sessions.create({
    customer: account.stripe_customer_id,
    return_url: `${siteUrl}/dashboard`
  });

  return NextResponse.json({ url: session.url });
}
