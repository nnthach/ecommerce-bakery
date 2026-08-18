import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin, isSupabaseConfigured } from "@/lib/supabase";
import {
  createQueryEmbedding,
  detectIntent,
  detectLanguage,
  expandProductQuery,
  generateGeneralAnswer,
  generateProductAnswer,
  generateProductListAnswer,
  generateProductNotFoundAnswer,
  generateStoreInfoAnswer,
  generateStoreInfoNotFoundAnswer,
  rerankProducts,
} from "@/lib/cohere";
import { buildRAGContext } from "@/lib/embedding/product-content";
import { KnowledgeSearchResult, ProductSearchVectorItem } from "@/types";

export async function POST(req: NextRequest) {
  try {
    // 1. Check Supabase
    if (!isSupabaseConfigured) {
      return NextResponse.json(
        {
          success: false,
          error: "Database not configured",
        },
        { status: 500 },
      );
    }

    // 2. Get request body
    const body = await req.json();

    const {
      message,
      limit = 5,
    }: {
      message?: string;
      limit?: number;
    } = body;

    // Search configuration
    const candidateLimit = 20;
    const resultLimit = limit;
    const rerankThreshold = 0.75;

    // 3. Validate message
    if (!message || typeof message !== "string") {
      return NextResponse.json(
        {
          success: false,
          error: "Message is required",
        },
        { status: 400 },
      );
    }

    // 4. Detect message
    const intent = await detectIntent(message);
    const language = await detectLanguage(message);

    // 5. GENERAL
    if (intent === "GENERAL") {
      const answer = await generateGeneralAnswer(message);

      return NextResponse.json({
        success: true,
        data: {
          answer,
          intent,
          products: [],
        },
      });
    }

    // 6. PRODUCT_SEARCH
    if (intent === "PRODUCT_SEARCH") {
      // 6.1. Create query embedding
      const expandedQuery = await expandProductQuery(message);

      const queryEmbedding = await createQueryEmbedding(expandedQuery);
      if (!queryEmbedding) {
        throw new Error("Failed to create query embedding");
      }

      // 6.2. Vector search
      const { data: matches, error: vectorSearchError } =
        await supabaseAdmin.rpc("match_products", {
          query_embedding: queryEmbedding,
          match_count: candidateLimit,
        });

      if (vectorSearchError) {
        throw vectorSearchError;
      }

      // 6.3. No vector candidates
      if (!matches || matches.length === 0) {
        const answer = await generateProductNotFoundAnswer(message);

        return NextResponse.json({
          success: true,
          data: {
            answer,
            intent,
            products: [],
          },
        });
      }

      // 6.4. Rerank
      const rerankedMatches = await rerankProducts(
        message,
        expandedQuery,
        matches,
        candidateLimit,
      );

      // 6.5. Filter by rerank threshold
      const relevantMatches = rerankedMatches
        .filter(
          (item) =>
            typeof item.rerankScore === "number" &&
            item.rerankScore >= rerankThreshold,
        )
        .slice(0, resultLimit);

      // 6.6. No sufficiently relevant products
      if (relevantMatches.length === 0) {
        const answer = await generateProductNotFoundAnswer(message);

        return NextResponse.json({
          success: true,
          data: {
            answer,
            intent,
            products: [],
          },
        });
      }

      // 6.7. Get product IDs
      const productIds = relevantMatches.map(
        (item: ProductSearchVectorItem) => item.product_id,
      );

      // 6.8. Get full product information
      const { data: products, error: productsError } = await supabaseAdmin
        .from("products")
        .select(
          `
        *,
        categories(
          id,
          name
        ),
        product_translations(
          locale,
          name,
          description,
          slug
        ),
        product_ingredients(
          ingredients(
            id,
            name
          )
        )
      `,
        )
        .in("id", productIds);

      if (productsError) {
        throw productsError;
      }

      // 6.9. Map products with ranking information
      const formattedProducts = products
        .map((product) => {
          const match = relevantMatches.find(
            (item: ProductSearchVectorItem) => item.product_id === product.id,
          );

          return {
            ...product,
            similarity: match?.similarity ?? 0,
            rerankScore: match?.rerankScore ?? 0,
          };
        })
        .sort((a, b) => b.rerankScore - a.rerankScore);

      // 6.10. Build RAG context
      const context = buildRAGContext(formattedProducts);

      // 6.11. Generate answer
      const answer = await generateProductAnswer(message, context);

      // 6.12. Response
      return NextResponse.json({
        success: true,
        data: {
          answer,
          intent,
          products: formattedProducts,
        },
      });
    }

    // 7. PRODUCT_LIST
    if (intent === "PRODUCT_LIST") {
      // 7.1. Get currently available daily-baked products
      const { data: products, error: productsError } = await supabaseAdmin
        .from("products")
        .select(
          `
        *,
        categories(
          id,
          name
        ),
        product_translations!inner(
          locale,
          name,
          description,
          slug
        ),
        product_ingredients(
          ingredients(
            id,
            name
          )
        )
      `,
        )
        .eq("is_active", true)
        .eq("is_daily_bake", true)
        .eq("product_translations.locale", "vi");

      if (productsError) {
        throw productsError;
      }

      // 7.2. No available products
      if (!products || products.length === 0) {
        const answer = await generateProductListAnswer(message, []);

        return NextResponse.json({
          success: true,
          data: {
            answer,
            intent,
            products: [],
          },
        });
      }

      // 7.3. Generate answer from current catalog
      const answer = await generateProductListAnswer(message, products);

      // 7.4. Response
      return NextResponse.json({
        success: true,
        data: {
          answer,
          intent,
          products,
        },
      });
    }

    // 8. STORE_INFO
    if (intent === "STORE_INFO") {
      // 8.1. Create query embedding
      const queryEmbedding = await createQueryEmbedding(message);

      if (!queryEmbedding) {
        throw new Error("Failed to create query embedding");
      }

      // 8.2. Vector search knowledge chunks
      const { data: matches, error: vectorSearchError } =
        await supabaseAdmin.rpc("match_knowledge_chunks", {
          query_embedding: queryEmbedding,
          match_count: 10,
        });

      if (vectorSearchError) {
        throw vectorSearchError;
      }

      // 8.3. No relevant knowledge
      if (!matches || matches.length === 0) {
        const answer = await generateStoreInfoNotFoundAnswer(message);

        return NextResponse.json({
          success: true,
          data: {
            answer,
            intent,
            products: [],
          },
        });
      }

      // 8.4. Build RAG context
      const context = matches
        .map(
          (item: KnowledgeSearchResult, index: number) =>
            `[Context ${index + 1}]\n${item.content}`,
        )
        .join("\n\n");

      // 8.5. Generate answer
      const answer = await generateStoreInfoAnswer(message, context, language);

      // 8.6. Response
      return NextResponse.json({
        success: true,
        data: {
          answer,
          intent,
          products: [],
        },
      });
    }
  } catch (error) {
    console.error("AI chat error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 },
    );
  }
}
