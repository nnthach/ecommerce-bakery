import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin, isSupabaseConfigured } from "@/lib/supabase";
import {
  createQueryEmbedding,
  generateProductAnswer,
  rerankProducts,
} from "@/lib/cohere";
import { buildRAGContext } from "@/lib/embedding/product-content";
import { ProductSearchVectorItem } from "@/types";

export async function POST(req: NextRequest) {
  try {
    if (!isSupabaseConfigured) {
      return NextResponse.json(
        { success: false, error: "Database not configured" },
        { status: 500 },
      );
    }

    const body = await req.json();
    const { query, limit = 5 } = body;

    const candidateLimit = 20;
    const resultLimit = limit;
    const rerankThreshold = 0.85;

    if (!query || typeof query !== "string") {
      return NextResponse.json(
        {
          success: false,
          error: "Query is required",
        },
        { status: 400 },
      );
    }

    // 1. Convert user query → vector
    const queryEmbedding = await createQueryEmbedding(query);

    if (!queryEmbedding) {
      throw new Error("Failed to create query embedding");
    }

    // 2. Vector similarity search
    const { data: matches, error } = await supabaseAdmin.rpc("match_products", {
      query_embedding: queryEmbedding,
      match_count: candidateLimit,
    });

    if (error) throw error;

    // 3. rerank
    const rerankedMatches = await rerankProducts(query, matches, limit);

    // 4. relevant match base on rerank score
    const relevantMatches = rerankedMatches
      .filter((item) => item.rerankScore >= rerankThreshold)
      .slice(0, resultLimit);

    // 5. get product ids list
    const productIds = relevantMatches.map(
      (item: ProductSearchVectorItem) => item.product_id,
    );

    const { data: products, error: productsError } = await supabaseAdmin
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
      .in("id", productIds);

    if (productsError) throw productsError;

    // 6. format add similar to product list
    const formattedProducts = products.map((product) => {
      const match = relevantMatches.find(
        (item: ProductSearchVectorItem) => item.product_id === product.id,
      );

      return {
        ...product,
        similarity: match?.similarity ?? 0,
        rerankScore: match?.rerankScore ?? 0,
      };
    });

    formattedProducts.sort((a, b) => b.rerankScore - a.rerankScore);

    // 7. build RAG
    const context = buildRAGContext(formattedProducts);

    // 8. answer
    const answer = await generateProductAnswer(query, context);

    return NextResponse.json({
      success: true,
      data: {
        answer,
        formattedProducts,
      },
    });
  } catch (error) {
    console.error("Semantic product search error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 },
    );
  }
}
