"use client";

import LanguageToggle from "@/components/custom/LanguageToggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useI18n } from "@/context/I18nContext";
import { Croissant, Eye, EyeOff, Loader2, Lock } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export default function RegisterPassword() {
  const { t } = useI18n();
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | undefined>(undefined);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = (): boolean => {
    if (!password) {
      setError(t("authPage.registerPasswordPage.errors.passwordRequired"));
      return false;
    }
    if (password.length < 6) {
      setError(t("authPage.registerPasswordPage.errors.passwordTooShort"));
      return false;
    }
    setError(undefined);
    return true;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (error) setError(undefined);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setIsSubmitting(true);

      const res = await fetch("/api/auth/register-password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const result = await res.json();

      if (!result.success) {
        setError(
          result.error ?? t("authPage.registerPasswordPage.errors.generic"),
        );
        return;
      }

      router.replace("/");
    } catch (error) {
      console.error("Register password error:", error);
      setError(t("authPage.registerPasswordPage.errors.generic"));
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
            {t("authPage.registerPasswordPage.badge")}
          </p>
          <h1 className="mt-1 text-2xl font-bold text-white">
            {t("authPage.registerPasswordPage.title")}
          </h1>
          <p className="mt-2 text-sm text-white/60">
            {t("authPage.registerPasswordPage.subtitle")}
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          <div>
            <label
              htmlFor="password"
              className="mb-1.5 block text-sm font-medium text-white/80"
            >
              {t("authPage.registerPasswordPage.passwordLabel")}
            </label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder={t(
                  "authPage.registerPasswordPage.passwordPlaceholder",
                )}
                value={password}
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
            {error && <p className="mt-1.5 text-xs text-coral-600">{error}</p>}
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
              t("authPage.registerPasswordPage.submit")
            )}
          </Button>
        </form>
      </div>
    </main>
  );
}
