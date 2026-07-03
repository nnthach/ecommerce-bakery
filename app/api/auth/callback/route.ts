import { createSupabaseServerClient, supabaseAdmin } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const params = req.nextUrl.searchParams;
    const code = params.get("code");

    if (!code) {
      return NextResponse.redirect(new URL("/signin?error=auth", req.url));
    }

    const res = new NextResponse(null);
    const supabaseServerClient = createSupabaseServerClient(req, res);

    const { data, error } =
      await supabaseServerClient.auth.exchangeCodeForSession(code);
    // save session => httpOnly cookie

    if (error || !data.user) {
      return NextResponse.redirect(new URL("/signin?error=auth", req.url));
    }

    // upsert profile
    await supabaseAdmin.from("users").upsert(
      {
        id: data.user.id,
        full_name: data.user.user_metadata.full_name,
        role: "customer",
        status: "active",
      },
      {
        onConflict: "id",
        ignoreDuplicates: true,
      },
    );

    // check status
    const { data: userProfile } = await supabaseAdmin
      .from("users")
      .select("status, has_password")
      .eq("id", data.user.id)
      .single();

    if (
      userProfile?.status === "banned" ||
      userProfile?.status === "inactive"
    ) {
      await supabaseServerClient.auth.signOut();
      return NextResponse.redirect(new URL("/signin?error=banned", req.url));
    }

    // redirect to set password
    const redirectUrl = !userProfile?.has_password ? "/register-password" : "/";
    const redirectRes = NextResponse.redirect(new URL(redirectUrl, req.url));

    // copy cookie từ res sang redirectRes
    res.headers.forEach((value, key) => {
      if (key.toLowerCase() === "set-cookie") {
        redirectRes.headers.append(key, value);
      }
    });

    return redirectRes;
  } catch (error) {
    console.error("Error in auth callback:", error);
    return NextResponse.redirect(new URL("/signin?error=auth", req.url));
  }
}
