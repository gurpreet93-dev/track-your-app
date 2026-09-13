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

  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_PRICE_ID) {
    return NextResponse.json({ error: 'Payments are not configured yet.' }, { status: 500 });
  }

  const account = await getBillingAccount(supabase, user.id);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin;

  const session = await getStripe().checkout.sessions.create({
    mode: 'subscription',
    line_items: [{ price: process.env.STRIPE_PRICE_ID, quantity: 1 }],
    client_reference_id: user.id,
    customer: account?.stripe_customer_id || undefined,
    customer_email: account?.stripe_customer_id ? undefined : user.email,
    success_url: `${siteUrl}/dashboard?upgraded=true`,
    cancel_url: `${siteUrl}/dashboard?upgrade=canceled`,
    metadata: { user_id: user.id },
    subscription_data: { metadata: { user_id: user.id } }
  });

  return NextResponse.json({ url: session.url });
}
