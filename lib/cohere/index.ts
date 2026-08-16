import { ProductSearchVectorItem } from "@/types";
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
  query: string,
  products: ProductSearchVectorItem[],
  limit = 5,
) {
  const response = await cohere.rerank({
    model: "rerank-v4.0-pro",
    query,
    documents: products.map((product) => product.content),
    topN: limit,
  });

  return response.results.map((result) => ({
    ...products[result.index],
    rerankScore: result.relevanceScore,
  }));
}

// chat
export async function generateProductAnswer(query: string, context: string) {
  const response = await cohere.chat({
    model: "command-a-plus-05-2026",
    messages: [
      {
        role: "system",
        content: `
You are a bakery shopping assistant.

Answer using only the provided products.
Do not invent information.
Reply in the user's language.
Be concise.

Products:
${context}
        `.trim(),
      },
      {
        role: "user",
        content: query,
      },
    ],
  });

  const textContent = response.message?.content?.find(
    (item) => item.type === "text",
  );

  return textContent?.type === "text" ? textContent.text : "";
}
