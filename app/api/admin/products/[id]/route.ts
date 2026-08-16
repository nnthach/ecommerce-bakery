import { createEmbedding } from "@/lib/cohere";
import { buildProductEmbeddingContent } from "@/lib/embedding/product-content";
import { isSupabaseConfigured, supabaseAdmin } from "@/lib/supabase";
import { ProductIngredientRow, RawProduct } from "@/types";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
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

    const locale = req.nextUrl.searchParams.get("locale") ?? "vi";

    const { data, error } = await supabaseAdmin
      .from("products")
      .select(
        `
        *,
        categories(id, name),
        product_translations!inner(locale, name, description, slug),
        product_ingredients(
          ingredients(id, name)
        )
      `,
      )
      .eq("id", id)
      .eq("product_translations.locale", locale)
      .single();

    if (error) throw error;

    if (!data) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 },
      );
    }

    const product = data as RawProduct;
    const translation = product.product_translations?.[0] ?? {};

    const formatted = {
      id: product.id,
      price: product.price,
      image_url: product.image_url,
      is_active: product.is_active,
      created_at: product.created_at,
      updated_at: product.updated_at,
      category: product.categories,
      name: translation.name ?? null,
      description: translation.description ?? null,
      slug: translation.slug ?? null,
      ingredients: (product.product_ingredients ?? []).map(
        (pi: ProductIngredientRow) => pi.ingredients,
      ),
    };

    return NextResponse.json(
      { success: true, data: formatted },
      { status: 200 },
    );
  } catch (error) {
    console.error("Get product detail error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}

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
      description_vi,
      slug_vi,
      name_en,
      description_en,
      slug_en,
      image_url,
      category_id,
      ingredient_ids,
      price,
    } = body;

    if (!name_vi) {
      return NextResponse.json(
        { success: false, error: "Name is required" },
        { status: 400 },
      );
    }

    // Step 1: Update products table
    const { error: productError } = await supabaseAdmin
      .from("products")
      .update({ price, category_id, image_url })
      .eq("id", id);
    if (productError) throw productError;

    // Step 2: Upsert translations
    const { error: translationError } = await supabaseAdmin
      .from("product_translations")
      .upsert(
        [
          {
            product_id: id,
            locale: "vi",
            name: name_vi,
            description: description_vi,
            slug: slug_vi,
          },
          {
            product_id: id,
            locale: "en",
            name: name_en,
            description: description_en,
            slug: slug_en,
          },
        ],
        { onConflict: "product_id,locale" },
      );
    if (translationError) throw translationError;

    // Step 3: Replace ingredients (delete + insert)
    const { error: deleteError } = await supabaseAdmin
      .from("product_ingredients")
      .delete()
      .eq("product_id", id);
    if (deleteError) throw deleteError;

    if (ingredient_ids?.length) {
      const rows = ingredient_ids.map((ingredient_id: string) => ({
        product_id: id,
        ingredient_id,
      }));
      const { error: ingredientError } = await supabaseAdmin
        .from("product_ingredients")
        .insert(rows);
      if (ingredientError) throw ingredientError;
    }

    // Step 4: Return updated product
    const { data: fullProduct, error: fetchError } = await supabaseAdmin
      .from("products")
      .select(
        `
        *,
        categories(id, name),
        product_translations(locale, name, description, slug),
        product_ingredients(
          ingredients(id, name)
        )
      `,
      )
      .eq("id", id)
      .single();
    if (fetchError) throw fetchError;

    // Step 5: Embedding
    const content = buildProductEmbeddingContent(fullProduct);

    const embedding = await createEmbedding(content);
    const { error: embeddingError } = await supabaseAdmin
      .from("product_embeddings")
      .upsert(
        {
          product_id: id,
          content,
          embedding,
        },
        {
          onConflict: "product_id",
        },
      );

    if (embeddingError) {
      console.error("Create product embedding error:", embeddingError);
    }

    return NextResponse.json(
      { success: true, data: fullProduct },
      { status: 200 },
    );
  } catch (error) {
    console.error("Update products error:", error);
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
      .from("products")
      .delete({ count: "exact" })
      .eq("id", id);

    if (error) throw error;

    if (count === 0) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 },
      );
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Delete products error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete" },
      { status: 500 },
    );
  }
}
