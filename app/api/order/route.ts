import stripeClient from "@/lib/stripe";
import { createSupabaseServerClient, supabaseAdmin } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

// TODO: replace with real store selection once multi-store checkout is wired up
const STORE_ID = "bdedc75d-06a9-42c6-9199-f0de16a43daf";

// create order
export async function POST(req: NextRequest) {
  const res = new NextResponse();

  try {
    const supabaseServerClient = createSupabaseServerClient(req, res);

    const {
      data: { user: authUser },
      error: authError,
    } = await supabaseServerClient.auth.getUser();

    if (authError || !authUser) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401, headers: res.headers },
      );
    }

    const body = await req.json();
    const {
      name,
      phone,
      address,
      note,
      city,
      district,
      ward,
      paymentMethod,
      subtotal,
      shipping_fee,
      total,
      items,
    } = body;

    if (!name || !phone || !address || !city || !district || !ward) {
      return NextResponse.json(
        { success: false, error: "Missing required delivery information" },
        { status: 400, headers: res.headers },
      );
    }

    if (paymentMethod !== "payos" && paymentMethod !== "visa") {
      return NextResponse.json(
        { success: false, error: "Invalid payment method" },
        { status: 400, headers: res.headers },
      );
    }

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: "Order must have at least one item" },
        { status: 400, headers: res.headers },
      );
    }

    // Create db order
    const { data: order, error: orderError } = await supabaseAdmin
      .from("orders")
      .insert({
        user_id: authUser.id,
        store_id: STORE_ID,
        payment_method: paymentMethod,
        name,
        phone,
        address,
        note: note || null,
        city,
        district,
        ward,
        subtotal,
        shipping_fee,
        total,
      })
      .select("id")
      .single();

    if (orderError) throw orderError;

    // Create order items
    const { error: orderItemsError } = await supabaseAdmin
      .from("order_items")
      .insert(
        items.map(
          (item: {
            product_id: string;
            product_name: string;
            unit_price: number;
            quantity: number;
            subtotal: number;
          }) => ({
            order_id: order.id,
            product_id: item.product_id,
            product_name: item.product_name,
            unit_price: item.unit_price,
            quantity: item.quantity,
            subtotal: item.subtotal,
          }),
        ),
      );

    if (orderItemsError) throw orderItemsError;

    // Create payment stripe
    const paymentIntent = await stripeClient.paymentIntents.create({
      amount: total,
      currency: "vnd",
      payment_method_types: ["card"], // đồng bộ với bên client
      metadata: {
        orderId: order.id,
      },
    });

    // Create payment table
    const { data: payment, error: paymentError } = await supabaseAdmin
      .from("payments")
      .insert({
        order_id: order.id,
        method: paymentMethod,
        amount: total,
        payment_intent_id: paymentIntent.id,
      })
      .single();
    if (paymentError) throw paymentError;

    return NextResponse.json(
      {
        success: true,
        data: {
          id: order.id,
          clientSecret: paymentIntent.client_secret,
          payment,
        },
      },
      { status: 201, headers: res.headers },
    );
  } catch (error) {
    console.error("Create order error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500, headers: res.headers },
    );
  }
}
