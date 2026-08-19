import { generateCacheKey, getCache, setCache } from "@/lib/redis-cache";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import { getSearchParams } from "@/lib/utils";
import { IngredientItem, ProductIngredientRow, RawProduct } from "@/types";
import { NextRequest, NextResponse } from "next/server";

export interface FormattedProduct {
  id: string;
  price: number;
  image_url: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string | null;

  category: {
    id: string;
    name: string;
  } | null;

  name: string | null;
  description: string | null;
  slug: string | null;

  ingredients: IngredientItem[];
}

interface ProductListResponse {
  data: FormattedProduct[];
  pagination: {
    page: number;
    limit: number;
    total_items: number;
    total_pages: number;
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

    // 1. GET PARAMETERS
    const {
      is_active,
      category_id,
      sort_by,
      order,
      locale,
      page,
      limit,
      is_daily_bake,
      search,
    } = getSearchParams(req);

    const validSortBy = ["name", "created_at"].includes(sort_by)
      ? sort_by
      : "created_at";
    const ascending = order === "asc";

    // 2. Parse page/limit & pagination
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 10));
    const from = (pageNum - 1) * limitNum;
    const to = from + limitNum - 1;

    // 3. Generate redis cache key
    const cacheKey = generateCacheKey(
      "products",
      search,
      limitNum,
      pageNum,
      validSortBy,
      ascending ? "asc" : "desc",
      locale,
      is_active === "true" ? true : is_active === "false" ? false : null,
      is_daily_bake === "true"
        ? true
        : is_daily_bake === "false"
          ? false
          : null,
      category_id || null,
      null,
      null,
    );

    console.log("cache key product", cacheKey);

    // 4. GET redis cache
    const cached = await getCache<ProductListResponse>(cacheKey);

    if (cached) {
      return NextResponse.json(
        {
          success: true,
          ...cached,
        },
        { status: 200 },
      );
    }

    // 5. CREATE Query database
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

    if (is_daily_bake !== null && is_daily_bake !== "") {
      query = query.eq("is_daily_bake", is_daily_bake === "true");
    }

    if (category_id !== null && category_id !== "") {
      query = query.eq("category_id", category_id);
    }

    // 6. RUN QUERY
    const { data, error, count } = await query;
    if (error) throw error;

    // 7. Product format
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

    // 8. Total page
    const totalPages = count ? Math.ceil(count / limitNum) : 0;

    const responseData: ProductListResponse = {
      data: formatted,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total_items: count ?? 0,
        total_pages: totalPages,
      },
    };

    // 9. SET CACHE REDIS
    void setCache(cacheKey, responseData, 5 * 60 * 60);

    // 10. RESPONSE
    return NextResponse.json(
      {
        success: true,
        ...responseData,
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
