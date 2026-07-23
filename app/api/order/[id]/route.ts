import { createSupabaseServerClient, supabaseAdmin } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

// get order detail (joined with order_items, store, user)
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const res = new NextResponse();

  try {
    const supabaseServerClient = createSupabaseServerClient(req, res);

    const {
      data: { user: authUser },
      error: authError,
    } = await supabaseServerClient.auth.getUser();

    if (authError || !authUser) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401, headers: res.headers },
      );
    }

    const { id } = await params;
    if (!id) {
      return NextResponse.json(
        { success: false, error: "Id is required" },
        { status: 400, headers: res.headers },
      );
    }

    const { data: order, error: orderError } = await supabaseAdmin
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
            created_at
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
      .single();

    if (orderError || !order) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404, headers: res.headers },
      );
    }

    // only the order's owner can view it
    if (order.user_id !== authUser.id) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404, headers: res.headers },
      );
    }

    return NextResponse.json(
      { success: true, data: order },
      { headers: res.headers },
    );
  } catch (error) {
    console.error("Get order detail error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500, headers: res.headers },
    );
  }
}
