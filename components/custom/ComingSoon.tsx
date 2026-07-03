"use client";

import { ArrowLeft, Croissant } from "lucide-react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/context/I18nContext";
import { Button } from "../ui/button";

export default function ComingSoon() {
  const router = useRouter();
  const { locale } = useI18n();

  const content = {
    en: {
      badge: "Coming Soon",
      title: "This Page Is Still Baking",
      description:
        "We're still preparing this page with the same care we put into our bread. Please check back soon.",
      back: "Go Back",
    },
    vi: {
      badge: "Sắp ra mắt",
      title: "Trang Này Đang Được Chuẩn Bị",
      description:
        "Chúng tôi vẫn đang hoàn thiện trang này với sự tỉ mỉ như từng ổ bánh. Vui lòng quay lại sau nhé.",
      back: "Quay lại",
    },
  }[locale];

  return (
    <section className="flex min-h-[80vh] items-center justify-center bg-sand px-6 py-24">
      <div className="flex max-w-lg flex-col items-center text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-amber/10">
          <Croissant className="h-8 w-8 text-amber" strokeWidth={1.5} />
        </span>

        <span className="mt-6 inline-flex items-center rounded-full bg-amber/10 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-amber">
          {content.badge}
        </span>

        <h1 className="mt-4 text-xl font-bold text-charcoal sm:text-4xl">
          {content.title}
        </h1>

        <p className="mt-4 text-sm leading-relaxed text-charcoal/60 sm:text-base">
          {content.description}
        </p>

        <Button
          variant="accent"
          className="mt-8 gap-2 font-semibold"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4" />
          {content.back}
        </Button>
      </div>
    </section>
  );
}
