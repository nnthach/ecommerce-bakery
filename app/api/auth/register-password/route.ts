import { createSupabaseServerClient, supabaseAdmin } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(req: NextRequest) {
  try {
    const { password } = await req.json();

    if (!password || password.length < 6) {
      return NextResponse.json(
        { success: false, error: "Password must be at least 6 characters." },
        { status: 400 },
      );
    }

    // lấy user hiện tại từ session (cookie)
    const res = new NextResponse(null);
    const supabase = createSupabaseServerClient(req, res);

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    // set password cho user này
    const { error } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
      password,
    });

    if (error) throw error;

    // mark that has password
    await supabaseAdmin
      .from("users")
      .update({ has_password: true })
      .eq("id", user.id);

    return NextResponse.json(
      { success: true, message: "Password register successfully." },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error setting password:", error);
    return NextResponse.json(
      { success: false, error: "Failed to register password." },
      { status: 500 },
    );
  }
}
