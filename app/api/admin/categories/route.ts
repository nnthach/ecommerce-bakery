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

    const { is_active, sort_by, order, page, limit } = getSearchParams(req);

    const validSortBy = ["name", "created_at"].includes(sort_by)
      ? sort_by
      : "created_at";
    const ascending = order === "asc";

    // parse page/limit & pagination
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 10));
    const from = (pageNum - 1) * limitNum;
    const to = from + limitNum - 1;

    let query = supabaseAdmin
      .from("categories")
      .select("*", { count: "exact" })
      .order(validSortBy, { ascending })
      .range(from, to);

    if (is_active !== null && is_active !== "") {
      query = query.eq("is_active", is_active === "true");
    }

    const { data, error, count } = await query;
    if (error) throw error;

    // total page
    const totalPages = count ? Math.ceil(count / limitNum) : 0;

    return NextResponse.json(
      {
        success: true,
        data,
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
    console.error("Fetch categories error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!isSupabaseConfigured) {
      return NextResponse.json(
        { success: false, error: "Database not configured" },
        { status: 500 },
      );
    }

    const body = await req.json();
    const {
      name_vi,
      name_en,
      description_vi,
      description_en,
      slug_vi,
      slug_en,
    } = body;

    if (!name_vi || !name_en) {
      return NextResponse.json(
        { success: false, error: "Names are required" },
        { status: 400 },
      );
    }

    const { data, error } = await supabaseAdmin
      .from("categories")
      .insert({
        name: { vi: name_vi, en: name_en },
        description: { vi: description_vi ?? "", en: description_en ?? "" },
        slug: { vi: slug_vi, en: slug_en },
      })
      .select()
      .single();
    if (error) throw error;

    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (error) {
    console.error("Create categories error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
