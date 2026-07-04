"use client";

import LanguageToggle from "@/components/custom/LanguageToggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { useI18n } from "@/context/I18nContext";
import { handleLoginGoogle } from "@/lib/login-google";
import { createSignInSchema, SignInFormData } from "@/lib/validations/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { Croissant, Eye, EyeOff, Loader2, Lock, Mail } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

export default function SignInPage() {
  const { t, locale } = useI18n();
  const { setUser } = useAuth();
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);

  const signInSchema = useMemo(() => createSignInSchema(t), [t]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
  });

  const onSubmit = async (data: SignInFormData) => {
    try {
      const res = await fetch("/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();

      setUser(result.data.user);

      toast.success(
        locale == "vi" ? "Đăng nhập thành công!" : "Sign in successful!",
      );

      if (result.data.user.role === "admin") {
        router.replace("/admin/dashboard");
      } else if (result.data.user.role === "staff") {
        router.replace("/staff/dashboard");
      } else {
        router.replace("/");
      }
    } catch (error) {
      console.error("Sign in error:", error);
      toast.error(
        locale == "vi" ? "Đăng nhập thất bại!" : "Sign in failed!",
      );
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

        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="space-y-5"
        >
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
                type="email"
                autoComplete="email"
                placeholder={t("authPage.signinPage.emailPlaceholder")}
                disabled={isSubmitting}
                className="border-white/15 bg-white/5 pl-10 text-white placeholder:text-white/35 hover:border-amber/40 focus-visible:border-amber focus-visible:ring-0 focus-visible:ring-offset-0"
                {...register("email")}
              />
            </div>
            {errors.email && (
              <p className="mt-1.5 text-xs text-coral-600">
                {errors.email.message}
              </p>
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
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder={t("authPage.signinPage.passwordPlaceholder")}
                disabled={isSubmitting}
                className="border-white/15 bg-white/5 pl-10 pr-10 text-white placeholder:text-white/35 hover:border-amber/40 focus-visible:border-amber focus-visible:ring-0 focus-visible:ring-offset-0"
                {...register("password")}
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
              <p className="mt-1.5 text-xs text-coral-600">
                {errors.password.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button
              type="button"
              onClick={handleLoginGoogle}
              variant="outline"
              className="w-full border-white/15 bg-white/5 text-white hover:border-white/30 hover:bg-white/10 hover:text-white"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4">
                <path
                  fill="#4285F4"
                  d="M23.52 12.27c0-.82-.07-1.6-.2-2.36H12v4.47h6.47c-.28 1.5-1.13 2.77-2.4 3.62v3h3.88c2.27-2.09 3.57-5.17 3.57-8.73Z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.96-1.07 7.95-2.9l-3.88-3c-1.08.72-2.45 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.95H1.27v3.11C3.25 21.3 7.31 24 12 24Z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.27 14.3a7.2 7.2 0 0 1 0-4.6V6.59H1.27a12 12 0 0 0 0 10.82l4-3.11Z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.76 0 3.34.6 4.58 1.79l3.44-3.44C17.95 1.19 15.24 0 12 0 7.31 0 3.25 2.7 1.27 6.59l4 3.11C6.22 6.86 8.87 4.75 12 4.75Z"
                />
              </svg>
              Google
            </Button>

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
          </div>
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
