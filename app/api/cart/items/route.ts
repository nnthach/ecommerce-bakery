import { createSupabaseServerClient, supabaseAdmin } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

// create / update user cart
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

    // input item
    const body = await req.json();
    const { product_id, quantity } = body;

    const qty = Number.isInteger(quantity) && quantity > 0 ? quantity : 1;

    if (!product_id || typeof product_id !== "string") {
      return NextResponse.json(
        { success: false, error: "Product is required" },
        { status: 400, headers: res.headers },
      );
    }

    // get product
    const { data: product, error: productError } = await supabaseAdmin
      .from("products")
      .select("id")
      .eq("id", product_id)
      .single();

    if (productError || !product) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404, headers: res.headers },
      );
    }

    // find or create the user's cart
    let cartId: string;
    const { data: existingCart, error: cartError } = await supabaseAdmin
      .from("carts")
      .select("id")
      .eq("user_id", authUser.id)
      .maybeSingle();

    if (cartError) throw cartError;

    // cart existing
    if (existingCart) {
      cartId = existingCart.id;
    } else {
      // cart not exist => create cart
      const { data: newCart, error: createCartError } = await supabaseAdmin
        .from("carts")
        .insert({ user_id: authUser.id })
        .select("id")
        .single();

      if (createCartError) throw createCartError;
      cartId = newCart.id;
    }

    // find or create the cart item
    const { data: existingItem, error: existingItemError } = await supabaseAdmin
      .from("cart_items")
      .select("id, quantity")
      .eq("cart_id", cartId)
      .eq("product_id", product_id)
      .maybeSingle();

    if (existingItemError) throw existingItemError;

    // if item existing => update quantity
    if (existingItem) {
      const { error: updateError } = await supabaseAdmin
        .from("cart_items")
        .update({
          quantity: existingItem.quantity + qty,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingItem.id);

      if (updateError) throw updateError;
    } else {
      // add item to cart if item not exist
      const { error: insertError } = await supabaseAdmin
        .from("cart_items")
        .insert({ cart_id: cartId, product_id, quantity: qty });

      if (insertError) throw insertError;
    }

    return NextResponse.json(
      { success: true },
      { status: 201, headers: res.headers },
    );
  } catch (error) {
    console.error("Add cart item error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500, headers: res.headers },
    );
  }
}
