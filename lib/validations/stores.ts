import { z } from "zod";

export const createStoreSchema = (
  t: (path: string) => string,
  namespace: "createModal" | "updateModal" = "createModal",
) =>
  z.object({
    name: z
      .string()
      .min(1, t(`admin.storesPage.${namespace}.errors.nameRequired`)),
    address_vi: z
      .string()
      .min(1, t(`admin.storesPage.${namespace}.errors.addressViRequired`)),
    address_en: z
      .string()
      .min(1, t(`admin.storesPage.${namespace}.errors.addressEnRequired`)),
    city: z.string(),
    district: z.string(),
    phone: z.string(),
  });

export type StoreFormData = z.infer<ReturnType<typeof createStoreSchema>>;
