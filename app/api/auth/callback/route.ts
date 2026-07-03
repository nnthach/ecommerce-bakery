import { createSupabaseServerClient, supabaseAdmin } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const params = req.nextUrl.searchParams;
    const code = params.get("code");
    const next = params.get("next") ?? "/";

    if (code) {
      const res = NextResponse.redirect(new URL(next, req.url));
      const supabaseServerClient = createSupabaseServerClient(req, res);

      const { data, error } =
        await supabaseServerClient.auth.exchangeCodeForSession(code);

      if (!error && data.user) {
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

        const { data: userProfile } = await supabaseAdmin
          .from("users")
          .select("status")
          .eq("id", data.user.id)
          .single();

        if (
          userProfile?.status === "banned" ||
          userProfile?.status === "inactive"
        ) {
          await supabaseServerClient.auth.signOut();
          return NextResponse.redirect(
            new URL("/signin?error=banned", req.url),
          );
        }

        return res;
      }
    }

    return NextResponse.redirect(new URL("/signin?error=auth", req.url));
  } catch (error) {
    console.error("Error in auth callback:", error);
    return NextResponse.redirect(new URL("/signin?error=auth", req.url));
  }
}
