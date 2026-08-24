import {
  createSupabaseServerClient,
  isSupabaseConfigured,
  supabaseAdmin,
} from "@/lib/supabase";
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

    const { status, page, limit, date } = getSearchParams(req);

    // parse page/limit & pagination
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 10));
    const from = (pageNum - 1) * limitNum;
    const to = from + limitNum - 1;

    // 1. lấy user hiện tại từ session
    const res = new NextResponse(null);
    const supabase = createSupabaseServerClient(req, res);

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    // 2. lấy staff từ session
    const { data: staff, error: staffError } = await supabaseAdmin
      .from("staffs")
      .select("store_id")
      .eq("user_id", user.id)
      .single();

    if (staffError || !staff) {
      return NextResponse.json(
        { success: false, error: "Staff not found" },
        { status: 403 },
      );
    }

    // 3. lấy đúng store của staff
    const store_id = staff.store_id;

    // 4. Tạo query
    let query = supabaseAdmin
      .from("daily_inventories")
      .select(
        `
        *,
        products!inner(
          id,
          price,
          image_url,
          is_active,
          product_translations(locale, name, slug),
          categories(id, name)
        ),
        staffs(
          id,
          users(id, full_name)
        )
      `,
        { count: "exact" },
      )
      .eq("store_id", store_id)
      .order("created_at", { ascending: false })
      .range(from, to);

    if (date) {
      query = query.eq("business_date", date);
    }

    if (status !== null && status !== "") {
      query = query.eq("status", status);
    }

    const { data, error, count } = await query;
    if (error) throw error;

    // 5. Total page
    const totalPages = count ? Math.ceil(count / limitNum) : 0;

    return NextResponse.json(
      {
        success: true,
        data: data,
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
    console.error("Fetch store inventory error:", error);
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

    // check staff => lấy user hiện tại từ session (cookie)
    const res = new NextResponse(null);
    const supabase = createSupabaseServerClient(req, res);

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    // lấy staff record
    const { data: staff, error: staffError } = await supabaseAdmin
      .from("staffs")
      .select("id, store_id")
      .eq("user_id", user.id)
      .single();

    if (staffError || !staff) {
      return NextResponse.json(
        { success: false, error: "Staff not found" },
        { status: 403 },
      );
    }

    const body = await req.json();
    const { items } = body;

    if (!items?.length) {
      return NextResponse.json(
        { success: false, error: "Items is required" },
        { status: 400 },
      );
    }

    // map items thành rows để upsert 1 lần
    const rows = items.map(
      (item: { product_id: string; quantity: number }) => ({
        store_id: staff.store_id,
        product_id: item.product_id,
        planned_quantity: item.quantity,
        updated_by: staff.id,
        updated_at: new Date().toISOString(),
        business_date: new Date().toISOString().split("T")[0],
        status: "draft",
      }),
    );

    const { error } = await supabaseAdmin
      .from("daily_inventories")
      .upsert(rows, {
        onConflict: "store_id, product_id, business_date",
      });

    if (error) throw error;

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Update inventory error:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
