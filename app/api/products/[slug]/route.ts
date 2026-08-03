import { isSupabaseConfigured, supabase, supabaseAdmin } from "@/lib/supabase";
import {
  ProductIngredientRow,
  ProductStoreInventory,
  RawProduct,
} from "@/types";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    if (!isSupabaseConfigured) {
      return NextResponse.json(
        { success: false, error: "Database not configured" },
        { status: 500 },
      );
    }

    const { slug } = await params;
    const locale = req.nextUrl.searchParams.get("locale") ?? "vi";

    if (!slug) {
      return NextResponse.json(
        { success: false, error: "Slug is required" },
        { status: 400 },
      );
    }

    // Step 1: Tìm product_id từ slug trong product_translations
    const { data: translation, error: translationError } = await supabase
      .from("product_translations")
      .select("product_id")
      .eq("slug", slug)
      .single();

    if (translationError || !translation) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 },
      );
    }

    // Step 2: Query full product bằng product_id vừa lấy được
    const { data, error } = await supabase
      .from("products")
      .select(
        `
        *,
        categories(id, name),
        product_translations!inner(locale, name, description, slug),
        product_ingredients(
          ingredients(id, name)
        )
      `,
      )
      .eq("id", translation.product_id)
      .eq("product_translations.locale", locale)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 },
      );
    }

    const product = data as RawProduct;
    const trans = product.product_translations?.[0] ?? {};

    // query các store còn hàng
    const businessDate = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Ho_Chi_Minh",
    }).format(new Date());

    const { data: stores } = await supabaseAdmin
      .from("daily_inventories")
      .select(
        `
    remaining_quantity,
    planned_quantity,
    status,
    stores(
      id,
      name,
      city,
      district,
      address,
      phone
    )
  `,
      )
      .eq("product_id", product.id)
      .eq("business_date", businessDate)
      .gt("remaining_quantity", 0);

    // format and return
    const availableStores = (stores ??
      []) as unknown as ProductStoreInventory[];

    const formatted = {
      id: product.id,
      price: product.price,
      image_url: product.image_url,
      is_active: product.is_active,
      created_at: product.created_at,
      updated_at: product.updated_at,

      category: product.categories,

      name: trans.name ?? null,
      description: trans.description ?? null,
      slug: trans.slug ?? null,

      ingredients: (product.product_ingredients ?? []).map(
        (pi: ProductIngredientRow) => pi.ingredients,
      ),

      status: availableStores.length > 0 ? "available" : "out_of_stock",

      stores: availableStores.map((inventory) => ({
        id: inventory.stores.id,
        name: inventory.stores.name,
        city: inventory.stores.city,
        district: inventory.stores.district,
        address: inventory.stores.address,
        phone: inventory.stores.phone,

        planned_quantity: inventory.planned_quantity,
        remaining_quantity: inventory.remaining_quantity,
        status: inventory.status,
      })),
    };

    return NextResponse.json(
      { success: true, data: formatted },
      { status: 200 },
    );
  } catch (error) {
    console.error("Get product by slug error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
