"use client";

import LanguageToggle from "@/components/custom/LanguageToggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { useI18n } from "@/context/I18nContext";
import { Croissant, Eye, EyeOff, Loader2, Lock, Mail } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

interface FormState {
  email: string;
  password: string;
}

const INITIAL_FORM: FormState = { email: "", password: "" };

export default function SignInPage() {
  const { t } = useI18n();
  const { setUser } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [errors, setErrors] = useState<Partial<FormState>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = (): boolean => {
    const next: Partial<FormState> = {};
    if (!form.email.trim())
      next.email = t("authPage.signinPage.errors.emailRequired");
    if (!form.password)
      next.password = t("authPage.signinPage.errors.passwordRequired");
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

      const res = await fetch("/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const result = await res.json();

      console.log("Sign in result:", result);

      setUser(result.data.user);

      if (result.data.user.role === "admin") {
        router.replace("/admin/dashboard");
      } else if (result.data.user.role === "staff") {
        router.replace("/staff/dashboard");
      } else {
        router.replace("/");
      }
    } catch (error) {
      console.error("Sign in error:", error);
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
        <Link href="/" className="mb-6 flex items-center justify-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-amber">
            <Croissant className="h-5 w-5 text-white" />
          </span>
          <span className="font-serif text-xl font-bold text-white">
            Petit Bakery
          </span>
        </Link>

        <div className="mb-6 text-center">
          <p className="font-script text-3xl text-amber">
            {t("authPage.signinPage.badge")}
          </p>
          <h1 className="mt-1 text-2xl font-bold text-white">
            {t("authPage.signinPage.title")}
          </h1>
          <p className="mt-2 text-sm text-white/60">
            {t("authPage.signinPage.subtitle")}
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          <div>
            <label
              htmlFor="email"
              className="mb-1.5 block text-sm font-medium text-white/80"
            >
              {t("authPage.signinPage.emailLabel")}
            </label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder={t("authPage.signinPage.emailPlaceholder")}
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
              {t("authPage.signinPage.passwordLabel")}
            </label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder={t("authPage.signinPage.passwordPlaceholder")}
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
              t("authPage.signinPage.submit")
            )}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-white/60">
          {t("authPage.signinPage.noAccount")}{" "}
          <Link
            href="/signup"
            className="font-semibold text-amber hover:underline"
          >
            {t("authPage.signinPage.signUpLink")}
          </Link>
        </p>
      </div>
    </main>
  );
}
