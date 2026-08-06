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
    const { data: order } = await supabaseAdmin
      .from("orders")
      .select("id,user_id,payment_status")
      .eq("order_code", orderCode)
      .maybeSingle();

    if (!order) {
      return NextResponse.json({
        error: 0,
        message: "OK",
      });
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
      // ORDERS
      const { data: order, error: orderError } = await supabaseAdmin
        .from("orders")
        .update({
          payment_status: "paid",
          status: "confirmed",
        })
        .eq("order_code", orderCode)
        .select("id, user_id, store_id")
        .single();

      if (orderError || !order) {
        throw orderError;
      }

      // Lấy danh sách sản phẩm trong đơn ORDER_ITEMS
      const { data: items, error: itemsError } = await supabaseAdmin
        .from("order_items")
        .select(
          `
      product_id,
      quantity
    `,
        )
        .eq("order_id", order.id);

      if (itemsError) throw itemsError;

      if (!items || items.length === 0) {
        return NextResponse.json({
          error: 0,
          message: "No items",
        });
      }

      const businessDate = new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Ho_Chi_Minh",
      }).format(new Date());

      // Trừ tồn kho DAILY_INVENTORIES
      for (const item of items) {
        const { data: inventory, error: inventoryError } = await supabaseAdmin
          .from("daily_inventories")
          .select("remaining_quantity")
          .eq("store_id", order.store_id)
          .eq("product_id", item.product_id)
          .eq("business_date", businessDate)
          .maybeSingle();

        if (inventoryError) throw inventoryError;

        if (!inventory) continue;

        const newRemaining = Math.max(
          0,
          inventory.remaining_quantity - item.quantity,
        );

        let status: "available" | "low_stock" | "out_of_stock";

        if (newRemaining === 0) {
          status = "out_of_stock";
        } else if (newRemaining <= 10) {
          status = "low_stock";
        } else {
          status = "available";
        }

        const { error: updateInventoryError } = await supabaseAdmin
          .from("daily_inventories")
          .update({
            remaining_quantity: newRemaining,
            status,
          })
          .eq("store_id", order.store_id)
          .eq("product_id", item.product_id)
          .eq("business_date", businessDate);

        if (updateInventoryError) throw updateInventoryError;
      }

      // Update payment
      const { error: paymentError } = await supabaseAdmin
        .from("payments")
        .update({
          status: "paid",
        })
        .eq("order_id", order.id);

      if (paymentError) throw paymentError;

      // Clear cart
      if (order.user_id) {
        const { data: cart, error: cartError } = await supabaseAdmin
          .from("carts")
          .select("id")
          .eq("user_id", order.user_id)
          .maybeSingle();

        if (cartError) throw cartError;

        if (cart) {
          const { error: clearCartError } = await supabaseAdmin
            .from("cart_items")
            .delete()
            .eq("cart_id", cart.id);

          if (clearCartError) throw clearCartError;
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
