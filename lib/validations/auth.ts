import { z } from "zod";

export const createSignInSchema = (t: (path: string) => string) =>
  z.object({
    email: z
      .string()
      .min(1, t("authPage.signinPage.errors.emailRequired"))
      .email(t("authPage.signinPage.errors.emailInvalid")),
    password: z
      .string()
      .min(6, t("authPage.signinPage.errors.passwordRequired")),
  });

export type SignInFormData = z.infer<ReturnType<typeof createSignInSchema>>;

export const createSignUpSchema = (t: (path: string) => string) =>
  z.object({
    full_name: z
      .string()
      .min(1, t("authPage.signupPage.errors.fullNameRequired")),
    email: z
      .string()
      .min(1, t("authPage.signupPage.errors.emailRequired"))
      .email(t("authPage.signupPage.errors.emailInvalid")),
    password: z
      .string()
      .min(1, t("authPage.signupPage.errors.passwordRequired"))
      .min(6, t("authPage.signupPage.errors.passwordTooShort")),
  });

export type SignUpFormData = z.infer<ReturnType<typeof createSignUpSchema>>;

export const createRegisterPasswordSchema = (t: (path: string) => string) =>
  z.object({
    password: z
      .string()
      .min(1, t("authPage.registerPasswordPage.errors.passwordRequired"))
      .min(6, t("authPage.registerPasswordPage.errors.passwordTooShort")),
  });

export type RegisterPasswordFormData = z.infer<
  ReturnType<typeof createRegisterPasswordSchema>
>;
