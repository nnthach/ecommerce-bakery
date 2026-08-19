import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

import stripeClient from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabase";

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  const body = await req.text();

  // signature
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      {
        error: "Missing stripe signature",
      },
      {
        status: 400,
      },
    );
  }

  // catch event
  let event: Stripe.Event;

  try {
    event = stripeClient.webhooks.constructEvent(
      body,
      signature,
      webhookSecret,
    );
  } catch (error) {
    console.error("Webhook signature error", error);

    return NextResponse.json(
      {
        error: "Invalid signature",
      },
      {
        status: 400,
      },
    );
  }

  switch (event.type) {
    // Thanh toán thành công
    case "payment_intent.succeeded": {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;

      const orderId = paymentIntent.metadata.orderId;

      // update order
      const { data: order, error: orderError } = await supabaseAdmin
        .from("orders")
        .update({
          payment_status: "paid",
          status: "confirmed",
        })
        .eq("id", orderId)
        .select("user_id")
        .single();

      if (orderError) {
        console.error("Update order error:", orderError);
      }

      // update payment
      await supabaseAdmin
        .from("payments")
        .update({
          status: "paid",
        })
        .eq("payment_intent_id", paymentIntent.id);

      // clear user's cart after successful order
      if (order?.user_id) {
        const { data: cart, error: cartError } = await supabaseAdmin
          .from("carts")
          .select("id")
          .eq("user_id", order.user_id)
          .maybeSingle();

        if (cartError) {
          console.error("Fetch cart error:", cartError);
        } else if (cart) {
          const { error: clearCartError } = await supabaseAdmin
            .from("cart_items")
            .delete()
            .eq("cart_id", cart.id);

          if (clearCartError) {
            console.error("Clear cart error:", clearCartError);
          }
        }
      }

      break;
    }

    // Thanh toán thất bại
    case "payment_intent.payment_failed": {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;

      const orderId = paymentIntent.metadata.orderId;

      await supabaseAdmin
        .from("orders")
        .update({
          payment_status: "failed",
        })
        .eq("id", orderId);

      break;
    }

    default:
      break;
  }

  return NextResponse.json({
    received: true,
  });
}
