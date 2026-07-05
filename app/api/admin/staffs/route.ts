import { isSupabaseConfigured, supabaseAdmin } from "@/lib/supabase";
import { getSearchParams } from "@/lib/utils";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    if (!isSupabaseConfigured) {
      return NextResponse.json(
        { success: false, error: "Database not configured" },
        { status: 500 },
      );
    }

    const { is_active, store_id, sort_by, order, search, page, limit } =
      getSearchParams(req);

    const validSortBy = ["full_name", "created_at"].includes(sort_by)
      ? sort_by
      : "created_at";
    const ascending = order === "asc";

    // parse page/limit & pagination
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 10));
    const from = (pageNum - 1) * limitNum;
    const to = from + limitNum - 1;

    // email không lưu ở bảng users nên phải lấy từ supabase auth
    // cần lấy trước để vừa map email vừa phục vụ search theo email
    const { data: authData, error: authError } =
      await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 });
    if (authError) throw authError;

    const emailByUserId = new Map(authData.users.map((u) => [u.id, u.email]));

    let query = supabaseAdmin
      .from("staffs")
      .select(
        `
        *,
        users(id, full_name, role, status),
        stores(id, name, city, district)
      `,
        { count: "exact" },
      )
      .range(from, to);

    // "full_name" lives on the joined users table, not on staffs
    if (validSortBy === "full_name") {
      query = query.order("full_name", {
        ascending,
        referencedTable: "users",
      });
    } else {
      query = query.order("created_at", { ascending });
    }

    if (is_active !== null && is_active !== "") {
      query = query.eq("is_active", is_active === "true");
    }
    if (store_id) {
      query = query.eq("store_id", store_id);
    }

    if (search) {
      // gộp kết quả tìm theo tên (bảng users) và theo email (supabase auth)
      const matchingUserIdsByEmail = authData.users
        .filter((u) => u.email?.toLowerCase().includes(search.toLowerCase()))
        .map((u) => u.id);

      const { data: matchingUsersByName, error: nameSearchError } =
        await supabaseAdmin
          .from("users")
          .select("id")
          .ilike("full_name", `%${search}%`);
      if (nameSearchError) throw nameSearchError;

      const matchingUserIds = Array.from(
        new Set([
          ...matchingUserIdsByEmail,
          ...(matchingUsersByName ?? []).map((u) => u.id),
        ]),
      );

      if (matchingUserIds.length === 0) {
        return NextResponse.json(
          {
            success: true,
            data: [],
            pagination: {
              page: pageNum,
              limit: limitNum,
              total_items: 0,
              total_pages: 0,
            },
          },
          { status: 200 },
        );
      }

      query = query.in("user_id", matchingUserIds);
    }

    const { data, error, count } = await query;
    if (error) throw error;

    const formatted = data.map((staff) => ({
      ...staff,
      email: emailByUserId.get(staff.user_id) ?? null,
    }));

    // total page
    const totalPages = count ? Math.ceil(count / limitNum) : 0;

    return NextResponse.json(
      {
        success: true,
        data: formatted,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total_items: count ?? 0,
          total_pages: totalPages,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Fetch staffs error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { email, password, fullname, store_id, dob, gender } = body;

  if (!password || password.length < 6) {
    return NextResponse.json(
      { success: false, error: "Password must be at least 6 characters" },
      { status: 400 },
    );
  }

  // step 1: create account in supabase auth
  const { data: authUser, error: authError } =
    await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // auto confirm, không cần verify email
    });
  if (authError) throw authError;

  // step 2: create row in users table
  const { error: userError } = await supabaseAdmin.from("users").insert({
    id: authUser.user.id, // use id với auth.users
    full_name: fullname,
    role: "staff",
    status: "active", // auto active
  });

  if (userError) {
    // rollback => delete auth user if create users failed
    await supabaseAdmin.auth.admin.deleteUser(authUser.user.id);
    throw userError;
  }

  // step 3: create row in staffs table
  const { error: staffError } = await supabaseAdmin.from("staffs").insert({
    user_id: authUser.user.id,
    store_id,
    dob,
    gender,
  });

  if (staffError) {
    // rollback => delete auth user if create staffs failed
    await supabaseAdmin.auth.admin.deleteUser(authUser.user.id);
    throw staffError;
  }

  return NextResponse.json({ success: true }, { status: 201 });
}
