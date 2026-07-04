import { z } from "zod";

export const createCategorySchema = (
  t: (path: string) => string,
  namespace: "createModal" | "updateModal" = "createModal",
) =>
  z.object({
    name_vi: z
      .string()
      .min(1, t(`admin.categoriesPage.${namespace}.errors.nameViRequired`)),
    name_en: z
      .string()
      .min(1, t(`admin.categoriesPage.${namespace}.errors.nameEnRequired`)),
    description_vi: z.string(),
    description_en: z.string(),
  });

export type CategoryFormData = z.infer<
  ReturnType<typeof createCategorySchema>
>;
