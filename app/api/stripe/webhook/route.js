import { NextResponse } from 'next/server';
import { getStripe } from '../../../../lib/stripe';
import { createAdminClient } from '../../../../lib/supabase-admin';

// Stripe subscription statuses we care about map straight onto our own
// billing_accounts.status column, except "trialing"/"unpaid" which we fold
// into the closest thing that keeps the paywall behaving sensibly.
function toAccountStatus(stripeStatus) {
  if (stripeStatus === 'active' || stripeStatus === 'trialing') return 'active';
  if (stripeStatus === 'past_due' || stripeStatus === 'unpaid') return 'past_due';
  return 'canceled';
}

export async function POST(request) {
  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 });
  }

  const body = await request.text();
  const signature = request.headers.get('stripe-signature');
  const stripe = getStripe();

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return NextResponse.json({ error: `Invalid signature: ${err.message}` }, { status: 400 });
  }

  const supabase = createAdminClient();

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object;
      const userId = session.client_reference_id || session.metadata?.user_id;

      if (userId && session.subscription) {
        const subscription = await stripe.subscriptions.retrieve(session.subscription);

        await supabase
          .from('billing_accounts')
          .update({
            stripe_customer_id: session.customer,
            stripe_subscription_id: subscription.id,
            status: toAccountStatus(subscription.status),
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId);
      }
      break;
    }

    case 'customer.subscription.updated':
    case 'customer.subscription.deleted': {
      const subscription = event.data.object;
      const status = event.type === 'customer.subscription.deleted' ? 'canceled' : toAccountStatus(subscription.status);

      await supabase
        .from('billing_accounts')
        .update({
          stripe_subscription_id: subscription.id,
          status,
          updated_at: new Date().toISOString()
        })
        .eq('stripe_customer_id', subscription.customer);
      break;
    }

    default:
      break;
  }

  return NextResponse.json({ received: true });
}
