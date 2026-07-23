import Stripe from "stripe";
// Test mode key; don't put live keys in code. See https://docs.stripe.com/keys-best-practices.
const stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY || "");

export default stripeClient;


