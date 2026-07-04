import { z } from "zod";

export const createStaffSchema = (
  t: (path: string) => string,
  namespace: "createModal" | "updateModal" = "createModal",
) =>
  z.object({
    fullname: z
      .string()
      .min(1, t(`admin.staffsPage.${namespace}.errors.fullnameRequired`)),
    email: z
      .string()
      .min(1, t(`admin.staffsPage.${namespace}.errors.emailRequired`))
      .email(t(`admin.staffsPage.${namespace}.errors.emailInvalid`)),
    dob: z
      .string()
      .min(1, t(`admin.staffsPage.${namespace}.errors.dobRequired`)),
    gender: z.enum(["male", "female", "other"]),
    store_id: z
      .string()
      .min(1, t(`admin.staffsPage.${namespace}.errors.storeRequired`)),
  });

export type StaffFormData = z.infer<ReturnType<typeof createStaffSchema>>;
