import Stripe from "stripe";
// Test mode key; don't put live keys in code. See https://docs.stripe.com/keys-best-practices.
const stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY || "");

export default stripeClient;

interface CreatePaymentProp {
  amount: number;
  currency: string;
}

export const createPayment = async ({
  amount,
  currency,
}: CreatePaymentProp) => {
  const paymentIntent = await stripeClient.paymentIntents.create({
    amount: amount,
    currency: currency,
    automatic_payment_methods: {
      enabled: true,
    },
  });
  return paymentIntent;
};

export const confirmPayment = async (paymentIntentId: string) => {
  return await stripeClient.paymentIntents.confirm(paymentIntentId);
};
