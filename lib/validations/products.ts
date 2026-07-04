import { z } from "zod";

export const createProductSchema = (
  t: (path: string) => string,
  namespace: "createModal" | "updateModal" = "createModal",
) =>
  z.object({
    name_vi: z
      .string()
      .min(1, t(`admin.productsPage.${namespace}.errors.nameViRequired`)),
    name_en: z.string(),
    description_vi: z.string(),
    description_en: z.string(),
    price: z
      .number(t(`admin.productsPage.${namespace}.errors.priceRequired`))
      .gt(0, t(`admin.productsPage.${namespace}.errors.priceRequired`)),
    category_id: z
      .string()
      .min(1, t(`admin.productsPage.${namespace}.errors.categoryRequired`)),
    ingredient_ids: z.array(z.string()),
  });

export type ProductFormData = z.infer<ReturnType<typeof createProductSchema>>;
