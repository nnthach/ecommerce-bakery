import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import { getSearchParams } from "@/lib/utils";
import { ProductIngredientRow, RawProduct } from "@/types";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    if (!isSupabaseConfigured) {
      return NextResponse.json(
        { success: false, error: "Database not configured" },
        { status: 500 },
      );
    }

    const { is_active, category_id, sort_by, order, locale, page, limit } =
      getSearchParams(req);

    const validSortBy = ["name", "created_at"].includes(sort_by)
      ? sort_by
      : "created_at";
    const ascending = order === "asc";

    // parse page/limit & pagination
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 10));
    const from = (pageNum - 1) * limitNum;
    const to = from + limitNum - 1;

    let query = supabase
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
        { count: "exact" }, // tổng số dòng theo params, ko tính pagination
      )
      .eq("product_translations.locale", locale)
      .order(validSortBy, { ascending })
      .range(from, to); // add pagination

    if (is_active !== null && is_active !== "") {
      query = query.eq("is_active", is_active === "true");
    }

    if (category_id !== null && category_id !== "") {
      query = query.eq("category_id", category_id);
    }

    const { data, error, count } = await query;
    if (error) throw error;

    // product format
    const formatted = data.map((product: RawProduct) => {
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
      };
    });

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
    console.error("Fetch products error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
