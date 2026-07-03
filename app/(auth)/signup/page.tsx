"use client";

import LanguageToggle from "@/components/custom/LanguageToggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useI18n } from "@/context/I18nContext";
import {
  Croissant,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  User,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

interface FormState {
  full_name: string;
  email: string;
  password: string;
}

const INITIAL_FORM: FormState = { full_name: "", email: "", password: "" };

export default function SignUpPage() {
  const { t } = useI18n();
  const router = useRouter();

  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [errors, setErrors] = useState<Partial<FormState>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = (): boolean => {
    const next: Partial<FormState> = {};
    if (!form.full_name.trim())
      next.full_name = t("authPage.signupPage.errors.fullNameRequired");
    if (!form.email.trim())
      next.email = t("authPage.signupPage.errors.emailRequired");
    if (!form.password)
      next.password = t("authPage.signupPage.errors.passwordRequired");
    else if (form.password.length < 6)
      next.password = t("authPage.signupPage.errors.passwordTooShort");
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormState]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setIsSubmitting(true);

      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const result = await res.json();
      if (result.success) {
        router.push("/signin");
      }
    } catch (error) {
      console.error("Sign up error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-10">
      <Image
        src="/images/banner3.webp"
        alt="Freshly baked pastries"
        fill
        priority
        className="object-cover object-center"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-charcoal-900/80 via-charcoal-900/60 to-charcoal-900/85" />

      <div className="absolute right-6 top-6 z-20">
        <LanguageToggle />
      </div>

      <div className="relative z-10 w-full max-w-md rounded-2xl border border-white/10 bg-charcoal-900/40 p-6 shadow-2xl backdrop-blur-xl sm:p-8">
        <Link href="/" className="mb-5 flex items-center justify-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-amber">
            <Croissant className="h-5 w-5 text-white" />
          </span>
          <span className="font-serif text-xl font-bold text-white">
            Petit Bakery
          </span>
        </Link>

        <div className="mb-5 text-center">
          <p className="font-script text-3xl text-amber">
            {t("authPage.signupPage.badge")}
          </p>
          <h1 className="mt-1 text-2xl font-bold text-white">
            {t("authPage.signupPage.title")}
          </h1>
          <p className="mt-2 text-sm text-white/60">
            {t("authPage.signupPage.subtitle")}
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <div>
            <label
              htmlFor="full_name"
              className="mb-1.5 block text-sm font-medium text-white/80"
            >
              {t("authPage.signupPage.fullNameLabel")}
            </label>
            <div className="relative">
              <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
              <Input
                id="full_name"
                name="full_name"
                type="text"
                autoComplete="name"
                placeholder={t("authPage.signupPage.fullNamePlaceholder")}
                value={form.full_name}
                onChange={handleChange}
                disabled={isSubmitting}
                className="border-white/15 bg-white/5 pl-10 text-white placeholder:text-white/35 hover:border-amber/40 focus-visible:border-amber focus-visible:ring-0 focus-visible:ring-offset-0"
              />
            </div>
            {errors.full_name && (
              <p className="mt-1.5 text-xs text-coral-600">
                {errors.full_name}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="email"
              className="mb-1.5 block text-sm font-medium text-white/80"
            >
              {t("authPage.signupPage.emailLabel")}
            </label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder={t("authPage.signupPage.emailPlaceholder")}
                value={form.email}
                onChange={handleChange}
                disabled={isSubmitting}
                className="border-white/15 bg-white/5 pl-10 text-white placeholder:text-white/35 hover:border-amber/40 focus-visible:border-amber focus-visible:ring-0 focus-visible:ring-offset-0"
              />
            </div>
            {errors.email && (
              <p className="mt-1.5 text-xs text-coral-600">{errors.email}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-1.5 block text-sm font-medium text-white/80"
            >
              {t("authPage.signupPage.passwordLabel")}
            </label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder={t("authPage.signupPage.passwordPlaceholder")}
                value={form.password}
                onChange={handleChange}
                disabled={isSubmitting}
                className="border-white/15 bg-white/5 pl-10 pr-10 text-white placeholder:text-white/35 hover:border-amber/40 focus-visible:border-amber focus-visible:ring-0 focus-visible:ring-offset-0"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 transition hover:text-white/70"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1.5 text-xs text-coral-600">{errors.password}</p>
            )}
          </div>

          <Button
            type="submit"
            variant="accent"
            disabled={isSubmitting}
            className="w-full font-semibold"
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              t("authPage.signupPage.submit")
            )}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-white/60">
          {t("authPage.signupPage.haveAccount")}{" "}
          <Link
            href="/signin"
            className="font-semibold text-amber hover:underline"
          >
            {t("authPage.signupPage.signInLink")}
          </Link>
        </p>
      </div>
    </main>
  );
}
