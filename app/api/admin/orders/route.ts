import { isSupabaseConfigured, supabaseAdmin } from "@/lib/supabase";
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

    const { is_active, store_id, sort_by, order, search, page, limit } =
      getSearchParams(req);

    const validSortBy = ["created_at"].includes(sort_by)
      ? sort_by
      : "created_at";
    const ascending = order === "asc";

    // parse page/limit & pagination
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 10));
    const from = (pageNum - 1) * limitNum;
    const to = from + limitNum - 1;

    let query = supabaseAdmin
      .from("orders")
      .select(
        `
        *,store:stores (
        id,
        name,
        address
      )
      `,
        { count: "exact" },
      )
      .range(from, to);

    if (validSortBy === "full_name") {
      query = query.order("full_name", {
        ascending,
      });
    } else {
      query = query.order("created_at", { ascending });
    }

    if (is_active !== null && is_active !== "") {
      query = query.eq("is_active", is_active === "true");
    }
    if (store_id) {
      query = query.eq("store_id", store_id);
    }

    if (search) {
      query = query.ilike("order_code", `%${search}%`);
    }

    const { data, error, count } = await query;
    if (error) throw error;

    // total page
    const totalPages = count ? Math.ceil(count / limitNum) : 0;

    return NextResponse.json(
      {
        success: true,
        data: data ?? [],
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
    console.error("Fetch orders error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
