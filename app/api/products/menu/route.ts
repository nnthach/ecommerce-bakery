import { generateCacheKey, getCache, setCache } from "@/lib/redis-cache";
import { isSupabaseConfigured, supabaseAdmin } from "@/lib/supabase";
import { getSearchParams } from "@/lib/utils";
import { NextRequest, NextResponse } from "next/server";

interface DailyInventoryRow {
  product_id: string;
  planned_quantity: number;
  remaining_quantity: number;
  status: string;
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
    const { is_active, category_id, order, locale, page, limit, city } =
      getSearchParams(req);

    const ascending = order === "asc";

    // 2. parse page/limit & pagination
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 10));
    const from = (pageNum - 1) * limitNum;
    const to = from + limitNum - 1;

    const businessDate = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Ho_Chi_Minh",
    }).format(new Date());

    // 3. generate cache key
    const cacheKey = generateCacheKey(
      "products",
      "",
      limitNum,
      pageNum,
      "created_at",
      ascending ? "asc" : "desc",
      locale,
      is_active === "true" ? true : is_active === "false" ? false : null,
      null,
      category_id || null,
      city || "Thành phố Hồ Chí Minh",
      businessDate,
    );

    // 4. GET CACHE
    const cached = await getCache(cacheKey);

    if (cached) {
      console.log(`[Redis] HIT - ${cacheKey}`);

      return NextResponse.json(
        {
          success: true,
          ...cached,
        },
        { status: 200 },
      );
    }

    console.log(`[Redis] MISS - ${cacheKey}`);

    // 5. query store by city
    const { data: store, error: storeError } = await supabaseAdmin
      .from("stores")
      .select("id")
      .eq("type", "online")
      .eq("city", city ?? "Thành phố Hồ Chí Minh")
      .single();

    if (storeError || !store) {
      return NextResponse.json(
        {
          success: false,
          error: "Store not found",
        },
        {
          status: 404,
        },
      );
    }

    // 6. query product
    let productQuery = supabaseAdmin
      .from("products")
      .select(
        `
        id,
        price,
        image_url,
        is_active,
        created_at,
        updated_at,
        categories(id,name),
        product_translations!inner(
          locale,
          name,
          description,
          slug
        ),
        product_ingredients(
          ingredients(id,name)
        )
      `,
        {
          count: "exact",
        },
      )
      .eq("product_translations.locale", locale)
      .order("created_at", {
        ascending,
      })
      .range(from, to);

    if (is_active !== null && is_active !== "") {
      productQuery = productQuery.eq("is_active", is_active === "true");
    }

    if (category_id !== null && category_id !== "") {
      productQuery = productQuery.eq("category_id", category_id);
    }
    const { data: products, error: productError, count } = await productQuery;

    if (productError) throw productError;

    // 7. query today inventory
    const { data: inventories, error: inventoryError } = await supabaseAdmin
      .from("daily_inventories")
      .select(
        `
          product_id,
          planned_quantity,
          remaining_quantity,
          status
        `,
      )
      .eq("store_id", store?.id || "")
      .eq("business_date", businessDate);

    if (inventoryError) throw inventoryError;

    // 8. map inventory to product
    const inventoryMap = new Map<string, DailyInventoryRow>(
      (inventories ?? []).map((item) => [item.product_id, item]),
    );

    // 9. product format
    const formatted = (products ?? []).map((product) => {
      const translation = product.product_translations[0];

      const inventory = inventoryMap.get(product.id);

      const remainingQuantity = inventory?.remaining_quantity ?? 0;

      const status =
        remainingQuantity <= 0
          ? "out_of_stock"
          : (inventory?.status ?? "available");

      return {
        id: product.id,
        price: product.price,
        image_url: product.image_url,
        is_active: product.is_active,
        created_at: product.created_at,
        updated_at: product.updated_at,

        category: product.categories?.[0] ?? null,

        name: translation?.name ?? "",
        description: translation?.description ?? "",
        slug: translation?.slug ?? "",

        ingredients: product.product_ingredients.map(
          (item) => item.ingredients,
        ),

        planned_quantity: inventory?.planned_quantity ?? 0,
        remaining_quantity: inventory?.remaining_quantity ?? 0,
        status: status,
      };
    });

    // 10. total page
    const totalPages = count ? Math.ceil(count / limitNum) : 0;

    const responseData = {
      data: formatted,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total_items: count ?? 0,
        total_pages: totalPages,
      },
    };

    // 11. SET CACHE
    await setCache(cacheKey, responseData, 5 * 60 * 60);

    console.log(`[Redis] SET - ${cacheKey}`);

    // 12. RESPONSE
    return NextResponse.json(
      {
        success: true,
        ...responseData,
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
