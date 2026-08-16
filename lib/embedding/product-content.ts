import { ProductIngredientRow, ProductItem, ProductTranslation } from "@/types";

type ProductForEmbedding = {
  price: number;
  categories: {
    id: string;
    name: {
      vi: string;
      en: string;
    };
  } | null;
  product_translations: ProductTranslation[];
  product_ingredients: ProductIngredientRow[];
};

interface ProductWithSimilarity extends ProductItem {
  similarity: number;
  rerankScore: number;
}

export function buildProductEmbeddingContent(product: ProductForEmbedding) {
  const viTranslation = product.product_translations.find(
    (item) => item.locale === "vi",
  );

  const enTranslation = product.product_translations.find(
    (item) => item.locale === "en",
  );

  const ingredientsVi = product.product_ingredients
    .map((item) => item.ingredients?.name.vi)
    .filter(Boolean)
    .join(", ");

  const ingredientsEn = product.product_ingredients
    .map((item) => item.ingredients?.name.en)
    .filter(Boolean)
    .join(", ");

  return `
      Product: ${viTranslation?.name ?? ""} / ${enTranslation?.name ?? ""}

      Description (Vietnamese): ${viTranslation?.description ?? ""}
      Description (English): ${enTranslation?.description ?? ""}

      Category (Vietnamese): ${product.categories?.name.vi ?? ""}
      Category (English): ${product.categories?.name.en ?? ""}

      Ingredients (Vietnamese): ${ingredientsVi}
      Ingredients (English): ${ingredientsEn}

      Price: ${product.price} VND
      `.trim();
}

export function buildRAGContext(products: ProductWithSimilarity[]) {
  return products
    .map((product, index) => {
      // lấy tên
      const viTranslation = product.product_translations?.find(
        (item) => item.locale === "vi",
      );

      const enTranslation = product.product_translations?.find(
        (item) => item.locale === "en",
      );

      // lấy cate
      const category = product.categories?.name;

      // lấy nguyên liệu
      const ingredientsVi =
        product.product_ingredients
          ?.map((item: ProductIngredientRow) => item.ingredients?.name.vi)
          .filter(Boolean)
          .join(", ") || "N/A";

      const ingredientsEn =
        product.product_ingredients
          ?.map((item: ProductIngredientRow) => item.ingredients?.name.en)
          .filter(Boolean)
          .join(", ") || "N/A";

      return `
        Product ${index + 1}

        Name (Vietnamese): ${viTranslation?.name ?? "N/A"}
        Name (English): ${enTranslation?.name ?? "N/A"}

        Description (Vietnamese): ${viTranslation?.description ?? "N/A"}
        Description (English): ${enTranslation?.description ?? "N/A"}

        Category (Vietnamese): ${category?.vi ?? "N/A"}
        Category (English): ${category?.en ?? "N/A"}

        Ingredients (Vietnamese): ${ingredientsVi}
        Ingredients (English): ${ingredientsEn}

        Price: ${product.price} VND
        Similarity: ${product.similarity?.toFixed(3) ?? "N/A"}
        Rerank Score: ${product.rerankScore?.toFixed(3) ?? "N/A"}
      `.trim();
    })
    .join("\n\n");
}
