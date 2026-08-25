import { isSupabaseConfigured, supabaseAdmin } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    if (!isSupabaseConfigured) {
      return NextResponse.json(
        { success: false, error: "Database not configured" },
        { status: 500 },
      );
    }

    const { id } = await params;
    const locale = req.nextUrl.searchParams.get("locale") ?? "vi";

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Id is required" },
        { status: 400 },
      );
    }

    const { data, error } = await supabaseAdmin
      .from("orders")
      .select(
        `
        *,
        order_items(
          id,
          product_id,
          product_name,
          unit_price,
          quantity,
          subtotal,
          created_at,
          products(
            id,
            image_url,
            product_translations!inner(
                locale,
                name
                )
            )
        ),
        payments(
            id, transaction_id, payment_intent_id
        ),
        stores(
          id,
          name,
          address,
          city,
          district,
          phone
        ),
        users(
          id,
          full_name,
          role,
          status
        )
      `,
      )
      .eq("id", id)
      .eq("order_items.products.product_translations.locale", locale)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 },
      );
    }

    const normalizedData = {
      ...data,
      payments: Array.isArray(data.payments)
        ? (data.payments[0] ?? null)
        : (data.payments ?? null),
    };

    return NextResponse.json({ success: true, data: normalizedData });
  } catch (error) {
    console.error("Get admin order detail error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
