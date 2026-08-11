import { isSupabaseConfigured, supabaseAdmin } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    if (!isSupabaseConfigured) {
      return NextResponse.json(
        { success: false, error: "Database not configured" },
        { status: 500 },
      );
    }

    // Current month in Vietnam timezone
    const now = new Date();

    const vietnamDate = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Ho_Chi_Minh",
    }).format(now);

    const [year, month] = vietnamDate.split("-").map(Number);

    const startDate = `${year}-${String(month).padStart(2, "0")}-01`;

    const nextMonth = new Date(year, month, 1);
    const endDate = `${nextMonth.getFullYear()}-${String(
      nextMonth.getMonth() + 1,
    ).padStart(2, "0")}-01`;

    // get total order of month
    const { count: totalOrders, error: orderError } = await supabaseAdmin
      .from("orders")
      .select("id", {
        count: "exact",
        head: true,
      })
      .eq("payment_status", "paid")
      .gte("created_at", `${startDate}T00:00:00+07:00`)
      .lt("created_at", `${endDate}T00:00:00+07:00`);

    if (orderError) throw orderError;

    // get total revenue of month from order
    const { data: revenueOrders, error: revenueError } = await supabaseAdmin
      .from("orders")
      .select("total")
      .eq("payment_status", "paid")
      .gte("created_at", `${startDate}T00:00:00+07:00`)
      .lt("created_at", `${endDate}T00:00:00+07:00`);

    if (revenueError) throw revenueError;

    const totalRevenue = (revenueOrders ?? []).reduce(
      (sum, order) => sum + Number(order.total || 0),
      0,
    );

    // get total product sold of month from order
    const { data: orderItems, error: orderItemsError } = await supabaseAdmin
      .from("order_items")
      .select(
        `
          quantity,
          order:orders!inner (
            payment_status,
            created_at
          )
        `,
      )
      .eq("order.payment_status", "paid")
      .gte("order.created_at", `${startDate}T00:00:00+07:00`)
      .lt("order.created_at", `${endDate}T00:00:00+07:00`);

    if (orderItemsError) throw orderItemsError;

    const totalProductsSold = (orderItems ?? []).reduce(
      (sum, item) => sum + Number(item.quantity || 0),
      0,
    );

    // get total new user of month
    const { count: totalNewUsers, error: userError } = await supabaseAdmin
      .from("users")
      .select("id", {
        count: "exact",
        head: true,
      })
      .gte("created_at", `${startDate}T00:00:00+07:00`)
      .lt("created_at", `${endDate}T00:00:00+07:00`);

    if (userError) throw userError;

    return NextResponse.json(
      {
        success: true,
        data: {
          total_orders: totalOrders ?? 0,
          total_revenue: totalRevenue,
          total_products_sold: totalProductsSold,
          total_new_users: totalNewUsers ?? 0,
          month: `${year}-${String(month).padStart(2, "0")}`,
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
