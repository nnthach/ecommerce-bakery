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

    const { status, sort_by, order, page, limit } = getSearchParams(req);

    const validSortBy = ["date", "created_at", "updated_at"].includes(sort_by)
      ? sort_by
      : "date";

    const ascending = order === "asc";

    // Parse page/limit & pagination
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 10));
    const from = (pageNum - 1) * limitNum;
    const to = from + limitNum - 1;

    let query = supabaseAdmin
      .from("preorder_schedules")
      .select("*", { count: "exact" })
      .order(validSortBy, { ascending })
      .range(from, to);

    // Filter by status
    if (status !== null && status !== "") {
      query = query.eq("status", status === "true");
    }

    const { data, error, count } = await query;

    if (error) throw error;

    // Total page
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
    console.error("Fetch preorder schedules error:", error);

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
    const { date } = body;

    // Validate date
    if (!date) {
      return NextResponse.json(
        { success: false, error: "Date is required" },
        { status: 400 },
      );
    }

    // Check if date is already in the past
    const today = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Ho_Chi_Minh",
    }).format(new Date());

    if (date < today) {
      return NextResponse.json(
        {
          success: false,
          error: "Preorder date cannot be in the past",
        },
        { status: 400 },
      );
    }

    const { data, error } = await supabaseAdmin
      .from("preorder_schedules")
      .insert({
        date,
      })
      .select()
      .single();

    if (error) {
      // Unique constraint violation
      if (error.code === "23505") {
        return NextResponse.json(
          {
            success: false,
            error: "Preorder schedule for this date already exists",
          },
          { status: 409 },
        );
      }

      throw error;
    }

    return NextResponse.json(
      {
        success: true,
        data,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Create preorder schedule error:", error);

    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
