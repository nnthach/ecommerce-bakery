"use client";

import Link from "next/link";
import { XCircle } from "lucide-react";

import Header from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/context/I18nContext";

export default function OrderFailPage() {
  const { t } = useI18n();

  return (
    <div className="flex h-screen flex-col bg-sand">
      <Header forceScrolled />
      <main className="mx-auto flex w-full max-w-6xl flex-1 items-center justify-center px-6 pt-24 lg:pt-28">
        <div className="flex max-w-md flex-col items-center gap-3 rounded-2xl border border-charcoal/10 bg-white px-8 py-14 text-center shadow-sm">
          <XCircle className="h-12 w-12 text-destructive" />
          <h2 className="text-lg font-semibold text-charcoal">
            {t("orderPage.result.fail.title")}
          </h2>
          <p className="text-sm text-charcoal/55">
            {t("orderPage.result.fail.message")}
          </p>
          <Link href="/order" className="mt-2">
            <Button variant="accent" className="font-semibold">
              {t("orderPage.result.tryAgain")}
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
