import { NextRequest, NextResponse } from "next/server";

import { payosConfig } from "@/lib/payos";
import { PayOSWebhookBody } from "@/types";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as PayOSWebhookBody;

    const webhookData = await payosConfig.webhooks.verify(body);

    const { code, orderCode } = webhookData;

    // check order
    const { data: order, error: orderError } = await supabaseAdmin
      .from("orders")
      .select("id, user_id, payment_status")
      .eq("order_code", orderCode)
      .single();

    if (orderError || !order) {
      throw orderError;
    }

    // webhook bị gọi lại
    if (order.payment_status === "paid") {
      return NextResponse.json({
        error: 0,
        message: "Already processed",
      });
    }

    // Chỉ xử lý khi thanh toán thành công
    if (code === "00") {
      const { data: order, error: orderError } = await supabaseAdmin
        .from("orders")
        .update({
          payment_status: "paid",
          status: "confirmed",
        })
        .eq("order_code", orderCode)
        .select("user_id, id")
        .single();

      if (orderError) {
        console.error("Update order error:", orderError);
      }

      // update stock
      const { data: items, error: itemsError } = await supabaseAdmin
        .from("order_items")
        .select(
          `
          product_id,
          quantity,
          store_id
        `,
        )
        .eq("order_id", order?.id);

      if (itemsError) throw itemsError;

      const businessDate = new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Ho_Chi_Minh",
      }).format(new Date());

      for (const item of items) {
        const { data: inventory } = await supabaseAdmin
          .from("daily_inventories")
          .select("remaining_quantity")
          .eq("store_id", item.store_id)
          .eq("product_id", item.product_id)
          .eq("business_date", businessDate)
          .single();

        if (!inventory) continue;

        await supabaseAdmin
          .from("daily_inventories")
          .update({
            remaining_quantity: Math.max(
              0,
              inventory.remaining_quantity - item.quantity,
            ),
          })
          .eq("store_id", item.store_id)
          .eq("product_id", item.product_id)
          .eq("business_date", businessDate);
      }

      // update payment
      await supabaseAdmin
        .from("payments")
        .update({
          status: "paid",
        })
        .eq("order_id", order?.id || "");

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
    }

    // PayOS yêu cầu trả 200
    return NextResponse.json({
      error: 0,
      message: "success",
    });
  } catch (error) {
    console.error("Webhook verify failed:", error);

    return NextResponse.json(
      {
        error: -1,
        message: "Invalid webhook",
      },
      { status: 400 },
    );
  }
}
