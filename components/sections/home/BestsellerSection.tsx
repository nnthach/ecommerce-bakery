"use client";

import ProductCard from "@/components/custom/ProductCard";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/context/I18nContext";
import { useInView } from "@/hooks/useInView";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

interface FetchedProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  slug: string;
  image_url: string[];
  is_active: boolean;
}

export default function BestsellerSection() {
  const { ref, inView } = useInView<HTMLDivElement>();
  const { t, locale } = useI18n();
  const [products, setProducts] = useState<FetchedProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const fetchProducts = useCallback(async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        is_active: "true",
        locale,
      });
      const res = await fetch(`/api/products?${params.toString()}`);
      if (!res.ok) return;
      const data = await res.json();
      if (data.success && data.data) {
        setProducts(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      setIsLoading(false);
    }
  }, [locale]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const formatPrice = (price: number) => price.toLocaleString("vi-VN") + " đ";

  return (
    <section id="bestsellers" className="relative z-10 bg-sand px-6 py-24">
      <div className="mx-auto max-w-7xl text-center">
        <p className="font-script text-3xl text-amber sm:text-4xl">
          {t("homePage.bestSellerSection.badge")}
        </p>
        <h2 className="mt-2 text-3xl font-bold text-charcoal sm:text-4xl whitespace-pre-line">
          {t("homePage.bestSellerSection.title")}
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-charcoal/60">
          {t("homePage.bestSellerSection.description")}
        </p>

        <div
          ref={ref}
          className="mt-14 grid gap-8 text-left sm:grid-cols-2 lg:grid-cols-3"
        >
          {isLoading
            ? Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="h-80 animate-pulse rounded-2xl bg-white/60"
                />
              ))
            : products.slice(0, 6).map((product, index) => (
                <ProductCard
                  key={product.id}
                  product={{
                    id: product.slug,
                    image: product.image_url?.[0] ?? "/images/placeholder.webp",
                    name: product.name,
                    description: product.description,
                    price: formatPrice(product.price),
                  }}
                  index={index}
                  inView={inView}
                  animation
                />
              ))}
        </div>

        <div className="mt-14">
          <Link href={"/menu"}>
            <Button variant="accent" size="lg" className="font-semibold">
              {t("button.exploreMenu")} <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
