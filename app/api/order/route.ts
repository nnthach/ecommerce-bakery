import { payosConfig } from "@/lib/payos";
import stripeClient from "@/lib/stripe";
import { createSupabaseServerClient, supabaseAdmin } from "@/lib/supabase";
import { generateOrderCode } from "@/lib/utils";
import { NextRequest, NextResponse } from "next/server";

const appUrl = process.env.NEXT_PUBLIC_APP_URL!;

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

    // check store by city
    const { data: store, error: storeError } = await supabaseAdmin
      .from("stores")
      .select("id")
      .eq("city", city)
      .eq("type", "online")
      .single();

    if (storeError || !store) {
      return NextResponse.json(
        { success: false, error: "Invalid delivery city" },
        { status: 400, headers: res.headers },
      );
    }

    // check item is available in store
    const productIds = items.map((item) => item.product_id);

    const businessDate = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Ho_Chi_Minh",
    }).format(new Date());

    const { data: inventories, error: inventoryError } = await supabaseAdmin
      .from("daily_inventories")
      .select(
        `
        product_id,
        remaining_quantity,
        status
      `,
      )
      .eq("store_id", store.id)
      .eq("business_date", businessDate)
      .in("product_id", productIds);

    if (inventoryError) {
      return NextResponse.json(
        {
          success: false,
          error: "Failed to check inventory",
        },
        {
          status: 500,
          headers: res.headers,
        },
      );
    }

    // check each item
    for (const item of items) {
      const inventory = inventories?.find(
        (inv) => inv.product_id === item.product_id,
      );

      // out of stock
      if (!inventory) {
        return NextResponse.json(
          {
            success: false,
            error: "Product is not available today",
            product_id: item.product_id,
          },
          {
            status: 400,
            headers: res.headers,
          },
        );
      }

      // ko đủ quantity
      if (
        inventory.status !== "available" ||
        inventory.remaining_quantity < item.quantity
      ) {
        return NextResponse.json(
          {
            success: false,
            error: "Insufficient stock",
            product_id: item.product_id,
            available_quantity: inventory.remaining_quantity,
            requested_quantity: item.quantity,
          },
          {
            status: 400,
            headers: res.headers,
          },
        );
      }
    }

    const orderCode = generateOrderCode();

    // Create db order
    const { data: order, error: orderError } = await supabaseAdmin
      .from("orders")
      .insert({
        user_id: authUser.id,
        store_id: store.id,
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
        order_code: orderCode,
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

    if (paymentMethod === "payos") {
      // create payment payos

      const paymentData = {
        orderCode: Number(orderCode),
        amount: total,
        description: "#" + orderCode,
        items: items.map(
          (item: {
            product_name: string;
            quantity: number;
            unit_price: number;
          }) => ({
            name: item.product_name,
            quantity: item.quantity,
            price: item.unit_price,
          }),
        ),
        cancelUrl: `${appUrl}/payment`,
        returnUrl: `${appUrl}/payment`,
      };

      const paymentLink = await payosConfig.paymentRequests.create(paymentData);

      console.log("PayOS payment link:", paymentLink);

      // Create payment table
      const { error: paymentError } = await supabaseAdmin
        .from("payments")
        .insert({
          order_id: order.id,
          method: paymentMethod,
          amount: total,
        })
        .single();
      if (paymentError) throw paymentError;

      return NextResponse.json(
        {
          success: true,
          data: {
            id: order.id,
            payment_link: paymentLink.checkoutUrl,
          },
        },
        { status: 201, headers: res.headers },
      );
    } else {
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
    }
  } catch (error) {
    console.error("Create order error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500, headers: res.headers },
    );
  }
}

