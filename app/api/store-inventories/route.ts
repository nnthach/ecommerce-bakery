import { isSupabaseConfigured, supabaseAdmin } from "@/lib/supabase";
import { getSearchParams } from "@/lib/utils";
import { ProductIngredientRow, ProductTranslation } from "@/types";
import { NextRequest, NextResponse } from "next/server";

interface StoreInventoryMenuRow {
  quantity: number;
  status: string | null;
  products: {
    id: string;
    price: number;
    image_url: string[];
    is_active: boolean;
    created_at: string;
    updated_at: string | null;
    categories: { id: string; name: string } | null;
    product_translations: ProductTranslation[];
    product_ingredients: ProductIngredientRow[];
  };
}

export async function GET(req: NextRequest) {
  try {
    if (!isSupabaseConfigured) {
      return NextResponse.json(
        { success: false, error: "Database not configured" },
        { status: 500 },
      );
    }

    const { is_active, category_id, order, locale, page, limit } =
      getSearchParams(req);

    const ascending = order === "asc";

    // parse page/limit & pagination
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 10));
    const from = (pageNum - 1) * limitNum;
    const to = from + limitNum - 1;

    let query = supabaseAdmin
      .from("store_inventories")
      .select(
        `
        quantity,
        status,
        stores!inner(id, type),
        products!inner(
          id,
          price,
          image_url,
          is_active,
          created_at,
          updated_at,
          categories(id, name),
          product_translations!inner(locale, name, description, slug),
          product_ingredients(
            ingredients(id, name)
          )
        )
      `,
        { count: "exact" },
      )
      .eq("stores.type", "online")
      .eq("products.product_translations.locale", locale)
      .order("created_at", { ascending })
      .range(from, to);

    if (is_active !== null && is_active !== "") {
      query = query.eq("products.is_active", is_active === "true");
    }

    if (category_id !== null && category_id !== "") {
      query = query.eq("products.category_id", category_id);
    }

    const { data, error, count } = await query;
    if (error) throw error;

    // product format
    const formatted = (data as unknown as StoreInventoryMenuRow[]).map(
      (row) => {
        const product = row.products;
        const translation = product.product_translations?.[0] ?? {};

        return {
          id: product.id,
          price: product.price,
          image_url: product.image_url,
          is_active: product.is_active,
          created_at: product.created_at,
          updated_at: product.updated_at,
          category: product.categories,
          name: translation.name ?? null,
          description: translation.description ?? null,
          slug: translation.slug ?? null,
          ingredients: (product.product_ingredients ?? []).map(
            (pi: ProductIngredientRow) => pi.ingredients,
          ),
          quantity: row.quantity,
          status: row.status,
        };
      },
    );

    // total page
    const totalPages = count ? Math.ceil(count / limitNum) : 0;

    return NextResponse.json(
      {
        success: true,
        data: formatted,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total_items: count ?? 0,
          total_pages: totalPages,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Fetch menu store inventories error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
