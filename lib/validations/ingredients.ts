import { z } from "zod";

export const createIngredientSchema = (
  t: (path: string) => string,
  namespace: "createModal" | "updateModal" = "createModal",
) =>
  z.object({
    name_vi: z
      .string()
      .min(1, t(`admin.ingredientsPage.${namespace}.errors.nameViRequired`)),
    name_en: z
      .string()
      .min(1, t(`admin.ingredientsPage.${namespace}.errors.nameEnRequired`)),
  });

export type IngredientFormData = z.infer<
  ReturnType<typeof createIngredientSchema>
>;
