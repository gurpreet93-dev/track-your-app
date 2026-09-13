import Stripe from 'stripe';

// No apiVersion pinned here on purpose: the stripe package pins the
// matching API version for whatever SDK version is installed.
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
