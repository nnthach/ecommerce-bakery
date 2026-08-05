import { NextRequest, NextResponse } from "next/server";
import { isSupabaseConfigured, supabaseAdmin } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  try {
    if (!isSupabaseConfigured) {
      return NextResponse.json(
        {
          success: false,
          error: "Database not configured",
        },
        {
          status: 500,
        },
      );
    }

    const orderCode = req.nextUrl.searchParams.get("orderCode");

    if (!orderCode) {
      return NextResponse.json(
        {
          success: false,
          error: "orderCode is required",
        },
        {
          status: 400,
        },
      );
    }

    const { data: order, error } = await supabaseAdmin
      .from("orders")
      .select("id, payment_status")
      .eq("order_code", Number(orderCode))
      .single();

    if (error || !order) {
      return NextResponse.json(
        {
          success: false,
          error: "Order not found",
        },
        {
          status: 404,
        },
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          order_id: order.id,
          status: order.payment_status,
        },
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error("Check payment status error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      {
        status: 500,
      },
    );
  }
}
