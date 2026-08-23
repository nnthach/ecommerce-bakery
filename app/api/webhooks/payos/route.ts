import { NextRequest, NextResponse } from "next/server";

import { payosConfig } from "@/lib/payos";
import { PayOSWebhookBody } from "@/types";
import { supabaseAdmin } from "@/lib/supabase";
import { deleteCacheByResource } from "@/lib/redis-cache";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as PayOSWebhookBody;

    // 1. Verify PayOS webhook
    const webhookData = await payosConfig.webhooks.verify(body);

    const { code, orderCode, reference } = webhookData;

    // 2. Check order
    const { data: order, error: orderFetchError } = await supabaseAdmin
      .from("orders")
      .select("id, user_id, store_id, payment_status")
      .eq("order_code", orderCode)
      .maybeSingle();

    if (orderFetchError) throw orderFetchError;

    // 3. Order không tồn tại
    if (!order) {
      return NextResponse.json({
        error: 0,
        message: "OK",
      });
    }

    // =========================================================
    // 4. PAYMENT FAILED
    // =========================================================
    if (code !== "00") {
      // Update order
      const { error: orderError } = await supabaseAdmin
        .from("orders")
        .update({
          payment_status: "failed",
          updated_at: new Date().toISOString(),
        })
        .eq("id", order.id)
        .neq("payment_status", "paid");

      if (orderError) throw orderError;

      // Update payment
      const { error: paymentError } = await supabaseAdmin
        .from("payments")
        .update({
          status: "failed",
          transaction_id: reference,
          gateway_response: webhookData,
          updated_at: new Date().toISOString(),
        })
        .eq("order_id", order.id);

      if (paymentError) throw paymentError;

      return NextResponse.json({
        error: 0,
        message: "Payment failed",
      });
    }

    // =========================================================
    // 5. PAYMENT SUCCESS
    // =========================================================
    const businessDate = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Ho_Chi_Minh",
    }).format(new Date());

    // 5.1 Process payment + inventory inside PostgreSQL transaction
    const { data: result, error: processError } = await supabaseAdmin.rpc(
      "process_successful_payment",
      {
        p_order_id: order.id,
        p_reference: reference,
        p_gateway_response: webhookData,
        p_business_date: businessDate,
      },
    );

    if (processError) {
      throw processError;
    }

    if (!result?.success) {
      throw new Error("Failed to process successful payment");
    }

    if (result?.already_processed) {
      return NextResponse.json({
        error: 0,
        message: "Already processed",
      });
    }

    // 5.2 Delete product cache
    void deleteCacheByResource("products");

    // 5.3 Clear cart
    const { error: clearCartError } = await supabaseAdmin.rpc(
      "clear_order_cart",
      {
        p_user_id: order.user_id,
        p_order_id: order.id,
      },
    );

    if (clearCartError) {
      throw clearCartError;
    }

    // 6. PayOS requires HTTP 200
    return NextResponse.json({
      error: 0,
      message: "success",
    });
  } catch (error) {
    console.error("PayOS webhook error:", error);

    return NextResponse.json(
      {
        error: -1,
        message: "Webhook processing failed",
      },
      { status: 400 },
    );
  }
}
