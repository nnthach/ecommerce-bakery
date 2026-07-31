import {
  createSupabaseServerClient,
  isSupabaseConfigured,
  supabaseAdmin,
} from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    if (!isSupabaseConfigured) {
      return NextResponse.json(
        { success: false, error: "Database not configured" },
        { status: 500 },
      );
    }

    // lấy user hiện tại từ session
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

    // lấy staff từ session
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

    // lấy đúng store của staff
    const store_id = staff.store_id;

    const { data, error } = await supabaseAdmin
      .from("daily_inventories")
      .select(
        `
        *,
        products(
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
      )
      .eq("store_id", store_id)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json({ success: true, data: data }, { status: 200 });
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
        onConflict: "store_id, product_id",
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
