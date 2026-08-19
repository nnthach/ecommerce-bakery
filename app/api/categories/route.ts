import { generateCacheKey, getCache, setCache } from "@/lib/redis-cache";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import { getSearchParams } from "@/lib/utils";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    if (!isSupabaseConfigured) {
      return NextResponse.json(
        { success: false, error: "Database not configured" },
        { status: 500 },
      );
    }

    // 1. GET PARAMETERS
    const { is_active, sort_by, order } = getSearchParams(req);

    const validSortBy = ["name", "created_at"].includes(sort_by)
      ? sort_by
      : "created_at";
    const ascending = order === "asc";

    // 2. Generate redis cache key
    const cacheKey = generateCacheKey(
      "categories",
      "",
      0,
      0,
      validSortBy,
      ascending ? "asc" : "desc",
      "",
      is_active === "true" ? true : is_active === "false" ? false : null,
      null,
      null,
      null,
      null,
    );

    console.log("cache key product", cacheKey);

    // 3. GET redis cache
    const cached = await getCache(cacheKey);

    if (cached) {
      return NextResponse.json(
        {
          success: true,
          ...cached,
        },
        { status: 200 },
      );
    }

    // 4. Create query database
    let query = supabase
      .from("categories")
      .select("*")
      .order(validSortBy, { ascending });

    if (is_active !== null && is_active !== "") {
      query = query.eq("is_active", is_active === "true");
    }

    // 5. RUN QUERY
    const { data, error } = await query;
    if (error) throw error;

    // 6. SET CACHE REDIS
    const responseData = {
      data: data,
    };

    void setCache(cacheKey, responseData, 5 * 60 * 60);

    return NextResponse.json(
      { success: true, ...responseData },
      { status: 200 },
    );
  } catch (error) {
    console.error("Fetch categories error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
