import { deleteCacheByResource } from "@/lib/redis-cache";
import { isSupabaseConfigured, supabaseAdmin } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    if (!isSupabaseConfigured) {
      return NextResponse.json(
        { success: false, error: "Database not configured" },
        { status: 500 },
      );
    }

    const { id } = await params;
    if (!id) {
      return NextResponse.json(
        { success: false, error: "Id is required" },
        { status: 400 },
      );
    }

    const body = await req.json();
    const {
      name_vi,
      name_en,
      description_vi,
      description_en,
      slug_vi,
      slug_en,
    } = body;
    if (!name_vi || !name_en) {
      return NextResponse.json(
        { success: false, error: "Names are required" },
        { status: 400 },
      );
    }
    const { data, error } = await supabaseAdmin
      .from("categories")
      .update({
        name: { vi: name_vi, en: name_en },
        description: { vi: description_vi ?? "", en: description_en ?? "" },
        slug: { vi: slug_vi, en: slug_en },
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    if (!data) {
      return NextResponse.json(
        { success: false, error: "Category not found" },
        { status: 404 },
      );
    }

    // delete redis cache
    void deleteCacheByResource("categories");

    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch (error) {
    console.error("Update categories error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    if (!isSupabaseConfigured) {
      return NextResponse.json(
        { success: false, error: "Database not configured" },
        { status: 500 },
      );
    }

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Id is required" },
        { status: 400 },
      );
    }

    const { error, count } = await supabaseAdmin
      .from("categories")
      .delete({ count: "exact" })
      .eq("id", id);

    if (error) throw error;

    if (count === 0) {
      return NextResponse.json(
        { success: false, error: "Category not found" },
        { status: 404 },
      );
    }

    // delete redis cache
    void deleteCacheByResource("categories");

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Delete categories error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete" },
      { status: 500 },
    );
  }
}
