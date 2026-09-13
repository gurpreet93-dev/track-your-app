import Stripe from 'stripe';

// Built lazily (not at module load) so importing this file doesn't crash
// Next's build-time page-data collection when STRIPE_SECRET_KEY isn't set
// yet — e.g. before Stripe has been configured in this deployment.
let stripeClient;

export function getStripe() {
  if (!stripeClient) {
    // No apiVersion pinned here on purpose: the stripe package pins the
    // matching API version for whatever SDK version is installed.
    stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY);
  }
  return stripeClient;
}
