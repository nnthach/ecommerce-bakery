import { z } from "zod";

export const createShippingSchema = (t: (path: string) => string) =>
  z
    .object({
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
      cardNumber: z.string().optional(),
      cardExpiry: z.string().optional(),
      cardCvc: z.string().optional(),
    })
    .superRefine((data, ctx) => {
      if (data.paymentMethod !== "visa") return;

      const cardDigits = data.cardNumber?.replace(/\s+/g, "") ?? "";
      if (!cardDigits) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["cardNumber"],
          message: t("orderPage.errors.cardNumberRequired"),
        });
      } else if (!/^\d{13,16}$/.test(cardDigits)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["cardNumber"],
          message: t("orderPage.errors.cardNumberInvalid"),
        });
      }

      if (!data.cardExpiry) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["cardExpiry"],
          message: t("orderPage.errors.cardExpiryRequired"),
        });
      } else if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(data.cardExpiry)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["cardExpiry"],
          message: t("orderPage.errors.cardExpiryInvalid"),
        });
      }

      if (!data.cardCvc) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["cardCvc"],
          message: t("orderPage.errors.cardCvcRequired"),
        });
      } else if (!/^\d{3,4}$/.test(data.cardCvc)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["cardCvc"],
          message: t("orderPage.errors.cardCvcInvalid"),
        });
      }
    });

export type ShippingFormData = z.infer<ReturnType<typeof createShippingSchema>>;
