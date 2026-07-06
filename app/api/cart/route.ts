import { createSupabaseServerClient, supabaseAdmin } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

// get user cart
export async function GET(req: NextRequest) {
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

    const locale = req.nextUrl.searchParams.get("locale") ?? "vi";

    // get cart
    const { data: cart, error: cartError } = await supabaseAdmin
      .from("carts")
      .select("id")
      .eq("user_id", authUser.id)
      .maybeSingle();

    if (cartError) throw cartError;

    // if user do not have cart
    if (!cart) {
      return NextResponse.json(
        { success: true, data: { id: null, items: [] } },
        { headers: res.headers },
      );
    }

    // get cart items
    const { data: items, error: itemsError } = await supabaseAdmin
      .from("cart_items")
      .select("id, product_id, quantity, created_at")
      .eq("cart_id", cart.id)
      .order("created_at", { ascending: true });

    if (itemsError) throw itemsError;

    // if no items
    if (!items || items.length === 0) {
      return NextResponse.json(
        { success: true, data: { id: cart.id, items: [] } },
        { headers: res.headers },
      );
    }

    // get products
    const productIds = items.map((item) => item.product_id);

    const { data: products, error: productsError } = await supabaseAdmin
      .from("products")
      .select(
        `
        id,
        price,
        image_url,
        product_translations!inner(locale, name, slug)
      `,
      )
      .in("id", productIds)
      .eq("product_translations.locale", locale);

    if (productsError) throw productsError;

    // map product
    const productMap = new Map(
      (products ?? []).map((product) => [
        product.id,
        {
          id: product.id,
          price: product.price,
          image_url: product.image_url,
          name: product.product_translations?.[0]?.name ?? "",
          slug: product.product_translations?.[0]?.slug ?? "",
        },
      ]),
    );

    // format
    const formatted = items
      .map((item) => {
        const product = productMap.get(item.product_id);
        if (!product) return null;
        return {
          id: item.id,
          product_id: item.product_id,
          quantity: item.quantity,
          product,
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);

    // return user cart
    return NextResponse.json(
      { success: true, data: { id: cart.id, items: formatted } },
      { headers: res.headers },
    );
  } catch (error) {
    console.error("Fetch cart error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500, headers: res.headers },
    );
  }
}
