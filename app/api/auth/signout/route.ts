import { createSupabaseServerClient } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const res = NextResponse.json(
      { success: true, message: "Logout successful!" },
      { status: 200 },
    );

    // session lưu ở cookie => xóa bằng server
    const supabase = createSupabaseServerClient(req, res);
    await supabase.auth.signOut();

    return NextResponse.json(
      { success: true },
      {
        status: 200,
        headers: res.headers, // copy headers để xóa cookie
      },
    );
  } catch (error) {
    console.log("fail to logout err", error);
    return NextResponse.json(
      { success: false, error: "Logout failed" },
      { status: 500 },
    );
  }
}
