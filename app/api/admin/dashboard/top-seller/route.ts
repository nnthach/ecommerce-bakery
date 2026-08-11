import { isSupabaseConfigured, supabaseAdmin } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    if (!isSupabaseConfigured) {
      return NextResponse.json(
        {
          success: false,
          error: "Database not configured",
        },
        { status: 500 },
      );
    }

    const locale = req.nextUrl.searchParams.get("locale") || "vi";

    // Current month - Vietnam timezone
    const vietnamDate = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Ho_Chi_Minh",
    }).format(new Date());

    const [year, month] = vietnamDate.split("-").map(Number);

    const startDate = `${year}-${String(month).padStart(2, "0")}-01`;

    const nextMonth = new Date(year, month, 1);

    const endDate = `${nextMonth.getFullYear()}-${String(
      nextMonth.getMonth() + 1,
    ).padStart(2, "0")}-01`;

    // 1. Get order items of this month => lấy ra sp và số lượng theo order
    const { data: orderItems, error: orderItemsError } = await supabaseAdmin
      .from("order_items")
      .select(
        `
          product_id,
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

    if (orderItemsError) {
      throw orderItemsError;
    }

    if (!orderItems || orderItems.length === 0) {
      return NextResponse.json(
        {
          success: true,
          data: [],
        },
        { status: 200 },
      );
    }

    // 2. Get unique product IDs 
    const productIds = Array.from(
      new Set(orderItems.map((item) => item.product_id)),
    );

    // 3. Get product translations
    const { data: translations, error: translationsError } = await supabaseAdmin
      .from("product_translations")
      .select("product_id, name")
      .in("product_id", productIds)
      .eq("locale", locale);

    if (translationsError) {
      throw translationsError;
    }

    // 4. Create product name map => map product <id, name>
    const productNameMap = new Map(
      (translations ?? []).map((translation) => [
        translation.product_id,
        translation.name,
      ]),
    );

    // 5. Calculate quantity sold
    const productMap = new Map<
      string,
      {
        product_id: string;
        product_name: string;
        quantity_sold: number;
      }
    >();

    // map từng sp từ order items
    for (const item of orderItems) {
      const productId = item.product_id;

      const productName = productNameMap.get(productId) ?? "Unknown product";

      const existing = productMap.get(productId);

      if (existing) {
        existing.quantity_sold += Number(item.quantity);
      } else {
        productMap.set(productId, {
          product_id: productId,
          product_name: productName,
          quantity_sold: Number(item.quantity),
        });
      }
    }

    // 6. Sort and get top 5
    const topProducts = Array.from(productMap.values())
      .sort((a, b) => b.quantity_sold - a.quantity_sold)
      .slice(0, 5);

    return NextResponse.json(
      {
        success: true,
        data: topProducts,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Fetch top selling products error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 },
    );
  }
}
