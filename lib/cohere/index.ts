import { ProductItem, ProductSearchVectorItem } from "@/types";
import { CohereClientV2 } from "cohere-ai";

const cohere = new CohereClientV2({
  token: process.env.COHERE_API_KEY,
});

// convert text => vector (use for product save to vector db)
export async function createEmbedding(text: string) {
  const response = await cohere.embed({
    model: "embed-v4.0",
    texts: [text],
    inputType: "search_document",
    outputDimension: 1536,
    embeddingTypes: ["float"],
  });

  return response.embeddings.float?.[0] ?? null;
}

// convert user query => vector (user input)
export async function createQueryEmbedding(text: string) {
  const response = await cohere.embed({
    model: "embed-v4.0",
    texts: [text],
    inputType: "search_query",
    outputDimension: 1536,
    embeddingTypes: ["float"],
  });

  return response.embeddings.float?.[0] ?? null;
}

// reranked to optimize search product
export async function rerankProducts(
  originalQuery: string,
  expandedQuery: string,
  products: ProductSearchVectorItem[],
  limit = 5,
) {
  const rerankQuery = `
Original user query:
${originalQuery}

Related terms:
${expandedQuery}
  `.trim();

  const response = await cohere.rerank({
    model: "rerank-v4.0-pro",
    query: rerankQuery,
    documents: products.map((product) => product.content),
    topN: limit,
  });

  return response.results.map((result) => ({
    ...products[result.index],
    rerankScore: result.relevanceScore,
  }));
}

// chat response product RAG
export async function generateProductAnswer(query: string, context: string) {
  const response = await cohere.chat({
    model: "command-a-plus-05-2026",
    temperature: 0.2,
    messages: [
      {
        role: "system",
        content: `
You are a bakery shopping assistant.

The product information below is provided by the application and is the ONLY source of truth.

STRICT RULES:

1. Answer ONLY using the provided product information.
2. NEVER invent products, prices, ingredients, descriptions, or availability.
3. ALWAYS answer in EXACTLY the SAME LANGUAGE as the user's query.
4. If the user writes in English, answer ONLY in English.
5. If the user writes in Vietnamese, answer ONLY in Vietnamese.
6. Do NOT switch to French, Spanish, German, Chinese, or any other language unless the user uses that language.
7. If there is no matching product, clearly say that no matching product is currently available.
8. Keep the answer concise and natural.
9. Do not mention RAG, embeddings, vector search, reranking, scores, APIs, databases, or internal systems.

PRODUCT INFORMATION:
${context}
        `.trim(),
      },
      {
        role: "user",
        content: query,
      },
    ],
  });

  const content = response.message?.content;

  if (!content) {
    return "";
  }

  if (Array.isArray(content)) {
    return content
      .map((item) => ("text" in item ? item.text : ""))
      .join("")
      .trim();
  }

  return String(content).trim();
}

// chat general
export async function generateGeneralAnswer(message: string): Promise<string> {
  const response = await cohere.chat({
    model: "command-a-plus-05-2026",
    temperature: 0.3,
    messages: [
      {
        role: "system",
        content: `
You are a friendly AI assistant for a bakery website.

You can:
- Have casual conversations.
- Answer general questions.
- Help users understand how to use the bakery website.

IMPORTANT RULES:

1. ALWAYS answer in EXACTLY the SAME LANGUAGE as the user's message.
2. If the user speaks English, answer ONLY in English.
3. If the user speaks Vietnamese, answer ONLY in Vietnamese.
4. Never randomly switch languages.
5. Do not invent bakery products.
6. Do not invent prices.
7. Do not invent store policies.
8. If the user asks about specific bakery products, product availability, ingredients, or prices, the product search/list system should handle that request.
9. Keep answers concise and natural.
        `.trim(),
      },
      {
        role: "user",
        content: message,
      },
    ],
  });

  const content = response.message?.content;

  if (!content) {
    return "";
  }

  if (Array.isArray(content)) {
    return content
      .map((item) => ("text" in item ? item.text : ""))
      .join("")
      .trim();
  }

  return String(content).trim();
}

// chat about all product
export async function generateProductListAnswer(
  query: string,
  products: ProductItem[],
): Promise<string> {
  if (!products || products.length === 0) {
    return "There are currently no products available.";
  }

  const productContext = products
    .map((product, index) => {
      const vietnameseTranslation = product.product_translations?.find(
        (translation) => translation.locale === "vi",
      );

      const englishTranslation = product.product_translations?.find(
        (translation) => translation.locale === "en",
      );

      const ingredientsVi =
        product.ingredients
          ?.map(
            (ingredient) =>
              ingredient.name?.vi ??
              ingredient.name?.en ??
              ingredient.name ??
              null,
          )
          .filter(Boolean)
          .join(", ") ??
        product.product_ingredients
          ?.map(
            (item) =>
              item.ingredients?.name?.vi ?? item.ingredients?.name?.en ?? null,
          )
          .filter(Boolean)
          .join(", ") ??
        "Not specified";

      const ingredientsEn =
        product.ingredients
          ?.map(
            (ingredient) =>
              ingredient.name?.en ??
              ingredient.name?.vi ??
              ingredient.name ??
              null,
          )
          .filter(Boolean)
          .join(", ") ??
        product.product_ingredients
          ?.map(
            (item) =>
              item.ingredients?.name?.en ?? item.ingredients?.name?.vi ?? null,
          )
          .filter(Boolean)
          .join(", ") ??
        "Not specified";

      return `
Product ${index + 1}:

Vietnamese:
- Name: ${vietnameseTranslation?.name ?? "N/A"}
- Description: ${vietnameseTranslation?.description ?? "N/A"}
- Ingredients: ${ingredientsVi}

English:
- Name: ${englishTranslation?.name ?? "N/A"}
- Description: ${englishTranslation?.description ?? "N/A"}
- Ingredients: ${ingredientsEn}

Price:
- ${product.price?.toLocaleString("vi-VN")} VND
      `.trim();
    })
    .join("\n\n");

  const prompt = `
You are an AI shopping assistant for a bakery website.

USER QUERY:
"${query}"

CURRENT AVAILABLE PRODUCTS:
${productContext}

STRICT RULES:

1. The product list above is the ONLY source of truth.
2. ALWAYS answer in EXACTLY the SAME LANGUAGE as the user's query.
3. If the user writes in English, answer ONLY in English.
4. If the user writes in Vietnamese, answer ONLY in Vietnamese.
5. NEVER switch to another language.
6. NEVER invent products.
7. NEVER invent prices.
8. NEVER invent ingredients.
9. NEVER invent availability.
10. NEVER claim a product is "best", "most popular", or "delicious" unless the provided data explicitly supports it.
11. If the user asks "What cakes do you have?", introduce the available products.
12. If the user asks for recommendations, recommend only from the provided products.
13. If the user asks about a product that does not exist in the list, clearly say that it is not currently available.
14. Use the exact prices provided.
15. Do not mention RAG, embeddings, vector databases, reranking, APIs, databases, or backend systems.
16. Do not use Markdown tables.
17. Bullet points are allowed.
18. Keep the answer concise and natural.
19. Do not unnecessarily repeat all product information.
20. The user may ask about ingredients, price, product type, or recommendations. Use the available product data to answer.
21. If the user asks a general question about the available products, use the product list to answer instead of saying that you cannot access product information.

Return ONLY the final answer.
  `.trim();

  const response = await cohere.chat({
    model: "command-a-plus-05-2026",
    temperature: 0.2,
    messages: [
      {
        role: "system",
        content: `
You are a precise bakery shopping assistant.

The application provides the product data.
The application data is authoritative.

Your most important requirement is:
ALWAYS respond in EXACTLY the SAME LANGUAGE as the user's query.
        `.trim(),
      },
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  const content = response.message?.content;

  if (!content) {
    return "Sorry, I couldn't retrieve the product information right now.";
  }

  if (Array.isArray(content)) {
    return content
      .map((item) => ("text" in item ? item.text : ""))
      .join("")
      .trim();
  }

  return String(content).trim();
}

// response not found
export async function generateProductNotFoundAnswer(
  query: string,
): Promise<string> {
  const response = await cohere.chat({
    model: "command-a-03-2025",
    temperature: 0.3,
    messages: [
      {
        role: "system",
        content: `
You are a helpful AI shopping assistant for a bakery website.

The product search system could not find a matching product.

Your task is to answer the user's question naturally.

Rules:
1. ALWAYS respond in the SAME LANGUAGE as the user's query.
2. If the user asks in English, answer in English.
3. If the user asks in Vietnamese, answer in Vietnamese.
4. Clearly explain that the requested product or ingredient was not found.
5. Do not invent any bakery products.
6. Do not invent prices, ingredients, or availability.
7. Keep the response short and friendly.
8. You may suggest that the user ask about other available products, but do not name products unless they are provided in context.
9. Do not mention vector search, embeddings, reranking, RAG, thresholds, databases, or backend implementation.

Return ONLY the final answer.
        `.trim(),
      },
      {
        role: "user",
        content: query,
      },
    ],
  });

  const content = response.message?.content;

  if (!content) {
    return "Sorry, I couldn't find a matching product.";
  }

  if (Array.isArray(content)) {
    return content
      .map((item) => ("text" in item ? item.text : ""))
      .join("")
      .trim();
  }

  return String(content).trim();
}

// detect language
export async function expandProductQuery(query: string): Promise<string> {
  const response = await cohere.chat({
    model: "command-a-03-2025",
    temperature: 0,
    messages: [
      {
        role: "system",
        content: `
You are a product search query expansion assistant for a bakery.

Your job is to understand the user's product search intent and expand important
product names, ingredients, flavors, and synonyms.

Rules:
- Preserve the original meaning.
- Add common synonyms and translations when useful.
- For food ingredients, include Vietnamese and English equivalents.
- "matcha" should include "green tea" and "trà xanh".
- "chocolate" should include "sô cô la" and "socola".
- "strawberry" should include "dâu" and "dâu tây".
- "mango" should include "xoài".
- Do not invent unrelated products.
- Return ONLY the expanded search query.
- Do not explain anything.

Examples:

User: "do you have matcha?"
Output:
matcha, green tea, trà xanh

User: "bạn có bánh socola không?"
Output:
socola, sô cô la, chocolate

User: "do you have strawberry cake?"
Output:
strawberry cake, strawberry, dâu, dâu tây

User: "bánh xoài"
Output:
bánh xoài, mango, xoài
        `.trim(),
      },
      {
        role: "user",
        content: query,
      },
    ],
  });

  const content = response.message?.content;

  if (!content) {
    return query;
  }

  if (Array.isArray(content)) {
    return (
      content
        .map((item) => ("text" in item ? item.text : ""))
        .join("")
        .trim() || query
    );
  }

  return String(content).trim() || query;
}

// chat detect intent request
type ChatIntent = "PRODUCT_SEARCH" | "PRODUCT_LIST" | "GENERAL";
export async function detectIntent(message: string): Promise<ChatIntent> {
  const response = await cohere.chat({
    model: "command-a-03-2025",
    temperature: 0,
    messages: [
      {
        role: "system",
        content: `
          You are an intent classifier for a bakery AI assistant.

          Classify the user's message into exactly one of:

          PRODUCT_SEARCH:
          The user wants to find a specific product based on
          name, flavor, ingredient, category, characteristic, etc.

          Examples:
          - "Bạn có bánh matcha không?"
          - "Có bánh chocolate không?"
          - "Bánh nào có dâu?"
          - "Tôi muốn tìm bánh ít ngọt"

          PRODUCT_LIST:
          The user wants to know what products the bakery currently sells
          or wants to see the available menu/catalog.

          Examples:
          - "Bạn bán bánh gì?"
          - "Hôm nay có bánh gì?"
          - "Menu hôm nay có gì?"
          - "Shop có những loại bánh nào?"
          - "Cho tôi xem các loại bánh"

          GENERAL:
          Questions unrelated to searching/listing products.

          Examples:
          - "Xin chào"
          - "Bạn là ai?"
          - "Cửa hàng mở cửa lúc mấy giờ?"
        `,
      },
      {
        role: "user",
        content: message,
      },
    ],
  });

  const content = response.message?.content;

  const text = content
    ?.map((item) => ("text" in item ? item.text : ""))
    .join("")
    .trim()
    .toUpperCase();

  if (text?.includes("PRODUCT_SEARCH")) {
    return "PRODUCT_SEARCH";
  }

  if (text?.includes("PRODUCT_LIST")) {
    return "PRODUCT_LIST";
  }

  return "GENERAL";
}
