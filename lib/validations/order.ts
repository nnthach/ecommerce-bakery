import { z } from "zod";

export const createShippingSchema = (t: (path: string) => string) =>
  z.object({
    name: z.string().min(1, t("orderPage.errors.fullNameRequired")),
    phone: z
      .string()
      .min(1, t("orderPage.errors.phoneRequired"))
      .regex(/^(0|\+84)\d{9,10}$/, t("orderPage.errors.phoneInvalid")),
    city: z.string().min(1, t("orderPage.errors.cityRequired")),
    district: z.string().min(1, t("orderPage.errors.districtRequired")),
    ward: z.string().min(1, t("orderPage.errors.wardRequired")),
    address: z.string().min(1, t("orderPage.errors.addressRequired")),
    note: z.string().optional(),
    paymentMethod: z.enum(["visa", "qr"]),
  });

export type ShippingFormData = z.infer<ReturnType<typeof createShippingSchema>>;
