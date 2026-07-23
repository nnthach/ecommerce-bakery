"use client";

// Load Stripe.js SDK vào browser và tạo một instance Stripe để frontend giao tiếp với Stripe
import { loadStripe, Stripe } from "@stripe/stripe-js";

let stripePromise: Promise<Stripe | null>;

export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(
      process.env.NEXT_PUBLIC_STRIPE_PUBLISH_KEY || "",
    );
  }
  return stripePromise;
};
