import {
  createSupabaseServerClient,
  isSupabaseConfigured,
  supabaseAdmin,
} from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    if (!isSupabaseConfigured) {
      return NextResponse.json(
        { success: false, error: "Database not configured" },
        { status: 500 },
      );
    }

    // step 1: check input
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email and password are required." },
        { status: 400 },
      );
    }

    // step 2: sign in with supabaseServerClient => create and save session
    const res = new NextResponse(null);
    // res là chỗ chứa cho createSupabaseServerClient
    const supabase = createSupabaseServerClient(req, res);
    // createSupabaseServerClient nhận res để biết
    // "khi cần ghi cookie, ghi vào res.headers này"
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    // sau khi signInWithPassword thành công
    // Supabase tự gọi setAll() trong createSupabaseServerClient
    // → ghi session cookie vào res.headers

    if (error) {
      return NextResponse.json(
        { success: false, error: "Invalid email or password." },
        { status: 401 },
      );
    }

    // step 3: fetch user profile
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
      .eq("id", data.user.id)
      .single();

    // check err
    if (profileError || !userProfile) {
      return NextResponse.json(
        { success: false, error: "User profile not found." },
        { status: 404 },
      );
    }

    // check status
    if (userProfile?.status === "banned") {
      return NextResponse.json(
        { success: false, error: "Account is banned." },
        { status: 403 },
      );
    }
    if (userProfile?.status === "inactive") {
      return NextResponse.json(
        { success: false, error: "Account is not activated yet." },
        { status: 403 },
      );
    }

    // step 4: return
    const isStaff = userProfile?.role === "staff";
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
      {
        status: 200,
        headers: res.headers, // bắt buộc để cookie được set
      },
    );
  } catch (error) {
    console.error("Error signing in:", error);
    return NextResponse.json(
      { success: false, error: "Failed to sign in." },
      { status: 500 },
    );
  }
}
