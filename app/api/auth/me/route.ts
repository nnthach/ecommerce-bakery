import { createSupabaseServerClient, supabaseAdmin } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const res = new NextResponse();

  try {
    const supabaseServerClient = createSupabaseServerClient(req, res);

    const {
      data: { user: authUser },
    } = await supabaseServerClient.auth.getUser();

    if (!authUser) {
      return NextResponse.json(
        { success: false, error: "Not authenticated." },
        { status: 401, headers: res.headers },
      );
    }

    const { data: userProfile, error: profileError } = await supabaseAdmin
      .from("users")
      .select(
        `
          id,
          full_name,
          role,
          status,
          staffs(
            id,
            store_id,
            is_active
          )
        `,
      )
      .eq("id", authUser.id)
      .single();

    if (profileError || !userProfile) {
      return NextResponse.json(
        { success: false, error: "User profile not found." },
        { status: 404, headers: res.headers },
      );
    }

    if (userProfile.status === "banned" || userProfile.status === "inactive") {
      return NextResponse.json(
        { success: false, error: "Account is not active." },
        { status: 403, headers: res.headers },
      );
    }

    const isStaff = userProfile.role === "staff";
    return NextResponse.json(
      {
        success: true,
        data: {
          user: {
            id: userProfile.id,
            full_name: userProfile.full_name,
            role: userProfile.role,
            status: userProfile.status,
            ...(isStaff && { staff: userProfile.staffs?.[0] ?? null }),
          },
        },
      },
      { headers: res.headers },
    );
  } catch (error) {
    console.error("Error fetching current user:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch user." },
      { status: 500, headers: res.headers },
    );
  }
}
