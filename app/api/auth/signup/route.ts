import { isSupabaseConfigured, supabase, supabaseAdmin } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    if (!isSupabaseConfigured) {
      return NextResponse.json(
        { success: false, error: "Database not configured" },
        { status: 500 },
      );
    }

    // step 1: check input
    const { full_name, email, password } = await req.json();

    if (!full_name || !email || !password) {
      return NextResponse.json(
        { success: false, error: "All field are required." },
        { status: 400 },
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: "Password must be at least 6 characters" },
        { status: 400 },
      );
    }

    // step 2: create account in supabase auth, gửi email verify cho user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      return NextResponse.json(
        { success: false, error: authError.message },
        { status: 400 },
      );
    }

    if (!authData.user) {
      return NextResponse.json(
        { success: false, error: "Failed to sign up." },
        { status: 500 },
      );
    }

    // step 3: create row in users table
    const { error: userError } = await supabaseAdmin.from("users").insert({
      id: authData.user.id, // use id với auth.users
      full_name,
      role: "customer",
      status: "active",
      has_password: true,
    });

    if (userError) {
      // rollback => delete auth user if create users failed
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      throw userError;
    }

    return NextResponse.json(
      {
        success: true,
        message:
          "Sign up successful. Please check your email to verify your account.",
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error signing up:", error);
    return NextResponse.json(
      { success: false, error: "Failed to sign up." },
      { status: 500 },
    );
  }
}
