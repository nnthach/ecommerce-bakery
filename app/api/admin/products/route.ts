import { createEmbedding } from "@/lib/cohere";
import { buildProductEmbeddingContent } from "@/lib/embedding/product-content";
import { isSupabaseConfigured, supabaseAdmin } from "@/lib/supabase";
import { getSearchParams } from "@/lib/utils";
import { ProductIngredientRow, RawProduct } from "@/types";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    if (!isSupabaseConfigured) {
      return NextResponse.json(
        { success: false, error: "Database not configured" },
        { status: 500 },
      );
    }

    // get params input
    const { is_active, order, category_id, locale, page, limit, search } =
      getSearchParams(req);

    const ascending = order === "asc";

    // parse page/limit & pagination
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 10));
    const from = (pageNum - 1) * limitNum;
    const to = from + limitNum - 1;

    // query
    let query = supabaseAdmin
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
        { count: "exact" },
      )
      .eq("product_translations.locale", locale)
      .order("created_at", { ascending })
      .range(from, to);

    // add params to query
    if (is_active !== null && is_active !== "") {
      query = query.eq("is_active", is_active === "true");
    }

    if (category_id !== null && category_id !== "") {
      query = query.eq("category_id", category_id);
    }

    if (search) {
      query = query.ilike("product_translations.name", `%${search}%`);
    }

    const { data, error, count } = await query;
    if (error) throw error;

    // total page
    const totalPages = count ? Math.ceil(count / limitNum) : 0;

    // product format
    const formatted = data.map((product: RawProduct) => {
      const translation = product.product_translations?.[0] ?? {};

      return {
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
    });

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
    console.error("Fetch products error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!isSupabaseConfigured) {
      return NextResponse.json(
        { success: false, error: "Database not configured" },
        { status: 500 },
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

    if (!name_vi || !name_en) {
      return NextResponse.json(
        { success: false, error: "Name is required" },
        { status: 400 },
      );
    }

    // Step 1: Create product
    const { data: product, error: productError } = await supabaseAdmin
      .from("products")
      .insert({
        price: price,
        category_id: category_id,
        image_url: image_url,
      })
      .select("id")
      .single();
    if (productError) throw productError;

    // Step 2: Create translation (vi + en) kèm slug
    const { error: translationError } = await supabaseAdmin
      .from("product_translations")
      .insert([
        {
          product_id: product.id,
          locale: "vi",
          name: name_vi,
          description: description_vi,
          slug: slug_vi,
        },
        {
          product_id: product.id,
          locale: "en",
          name: name_en,
          description: description_en,
          slug: slug_en,
        },
      ]);
    if (translationError) {
      // rollback and delete product if translation err
      await supabaseAdmin.from("products").delete().eq("id", product.id);
      throw translationError;
    }

    // Step 3: Create product_ingredients
    if (body.ingredient_ids?.length) {
      const rows = ingredient_ids.map((ingredient_id: string) => ({
        product_id: product.id,
        ingredient_id,
      }));

      const { error: ingredientError } = await supabaseAdmin
        .from("product_ingredients")
        .insert(rows);

      if (ingredientError) {
        // rollback and delete product (cascade xóa luôn translation)
        await supabaseAdmin.from("products").delete().eq("id", product.id);
        throw ingredientError;
      }
    }

    // Step 4: Get full product info vừa tạo
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
      .eq("id", product.id)
      .single();
    if (fetchError) throw fetchError;

    // Step 5: Embedding
    const content = buildProductEmbeddingContent(fullProduct);
    
    const embedding = await createEmbedding(content);
    const { error: embeddingError } = await supabaseAdmin
      .from("product_embeddings")
      .insert({
        product_id: product.id,
        content,
        embedding,
      });

    if (embeddingError) {
      console.error("Create product embedding error:", embeddingError);
    }

    return NextResponse.json(
      { success: true, data: fullProduct },
      { status: 201 },
    );
  } catch (error) {
    console.error("Create products error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
