import { isSupabaseConfigured, supabaseAdmin } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    if (!isSupabaseConfigured) {
      return NextResponse.json(
        { success: false, error: "Database not configured" },
        { status: 500 },
      );
    }

    const params = req.nextUrl.searchParams;
    const store_id = params.get("store_id");

    if (!store_id) {
      return NextResponse.json(
        { success: false, error: "store_id is required" },
        { status: 400 },
      );
    }

    const { data, error } = await supabaseAdmin
      .from("store_inventories")
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
