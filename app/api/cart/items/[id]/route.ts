import { createSupabaseServerClient, supabaseAdmin } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

// get user cart item
async function getOwnedCartItem(
  itemId: string,
  userId: string,
): Promise<{ id: string; cart_id: string } | null> {
  const { data: item, error } = await supabaseAdmin
    .from("cart_items")
    .select("id, cart_id, carts!inner(user_id)")
    .eq("id", itemId)
    .single();

  if (error || !item) return null;

  // check cart belong user
  const carts = item.carts as unknown as
    | { user_id: string }
    | { user_id: string }[];
  const cartUserId = Array.isArray(carts) ? carts[0]?.user_id : carts?.user_id;

  if (cartUserId !== userId) return null;

  return { id: item.id, cart_id: item.cart_id };
}

// edit item quantity in cart
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const res = new NextResponse();

  try {
    // check user
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

    // product & quantity id input
    const { id } = await params;
    const body = await req.json();
    const { quantity } = body;

    if (!Number.isInteger(quantity) || quantity <= 0) {
      return NextResponse.json(
        { success: false, error: "Quantity must be a positive integer" },
        { status: 400, headers: res.headers },
      );
    }

    // check item belong user cart?
    const ownedItem = await getOwnedCartItem(id, authUser.id);
    if (!ownedItem) {
      return NextResponse.json(
        { success: false, error: "Cart item not found" },
        { status: 404, headers: res.headers },
      );
    }

    // đúng người đúng cart => update quantity
    const { error: updateError } = await supabaseAdmin
      .from("cart_items")
      .update({ quantity, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (updateError) throw updateError;

    return NextResponse.json({ success: true }, { headers: res.headers });
  } catch (error) {
    console.error("Update cart item error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500, headers: res.headers },
    );
  }
}

// delete item from cart
export async function DELETE(
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

    // item id input
    const { id } = await params;

    // check item in right user cart
    const ownedItem = await getOwnedCartItem(id, authUser.id);
    if (!ownedItem) {
      return NextResponse.json(
        { success: false, error: "Cart item not found" },
        { status: 404, headers: res.headers },
      );
    }

    // delete
    const { error: deleteError } = await supabaseAdmin
      .from("cart_items")
      .delete()
      .eq("id", id);

    if (deleteError) throw deleteError;

    return new NextResponse(null, { status: 204, headers: res.headers });
  } catch (error) {
    console.error("Delete cart item error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500, headers: res.headers },
    );
  }
}
