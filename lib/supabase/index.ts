import { createClient } from "@supabase/supabase-js";
import { createBrowserClient, createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "";
const supabaseServiceKey = process.env.SUPABASE_SECRET_KEY || "";

export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const supabaseAdmin = supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })
  : supabase;

// server client — dùng trong API route khi cần đọc/ghi cookie
export function createSupabaseServerClient(
  req: NextRequest,
  res: NextResponse,
) {
  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookieOptions: {
      httpOnly: true,
      // secure: process.env.NODE_ENV === "production",
      secure: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 365, // 1 năm
      path: "/",
    },
    cookies: {
      getAll: () => req.cookies.getAll(),
      setAll: (cookiesToSet) => {
        cookiesToSet.forEach(({ name, value, options }) => {
          res.cookies.set(name, value, {
            ...options,
            httpOnly: true, // override với các giá trị bảo mật
            secure: true,
            sameSite: "lax",
            path: "/",
          });
        });
      },
    },
  });
}

// browser
export const supabaseBrowser = createBrowserClient(
  supabaseUrl,
  supabaseAnonKey,
);
