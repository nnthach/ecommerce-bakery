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

export async function POST(req: NextRequest) {
  try {
    if (!isSupabaseConfigured) {
      return NextResponse.json(
        { success: false, error: "Database not configured" },
        { status: 500 },
      );
    }

    // check staff
    const staff = {
      store_id: "bdedc75d-06a9-42c6-9199-f0de16a43daf",
      id: "a467367b-3f2c-496f-910c-31080506233b",
    };

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
        quantity: item.quantity,
        updated_by: staff.id,
        updated_at: new Date().toISOString(),
      }),
    );

    const { error } = await supabaseAdmin
      .from("store_inventories")
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
