"use client";

import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import ProductCard from "@/components/custom/ProductCard";
import { Button } from "@/components/ui/button";
import { BakeryProduct, ProductItem } from "@/types";
import { ChevronLeft, Wheat } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useI18n } from "@/context/I18nContext";
import { useCart } from "@/context/CartContext";

export default function ProductDetailClient({
  params,
}: {
  params: { slug: string };
}) {
  const { t, locale } = useI18n();
  const { addItem } = useCart();
  const [product, setProduct] = useState<ProductItem | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<BakeryProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [notFoundError, setNotFoundError] = useState(false);

  const fetchProduct = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/products/${params.slug}?locale=${locale}`);
      if (res.status === 404) {
        setNotFoundError(true);
        return;
      }
      if (!res.ok) return;
      const data = await res.json();
      if (data.success && data.data) {
        setProduct(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch product:", error);
    } finally {
      setIsLoading(false);
    }
  }, [params.slug, locale]);

  const fetchRelatedProducts = useCallback(async (categoryId: string, currentId: string) => {
    try {
      const query = new URLSearchParams({
        is_active: "true",
        locale,
        category_id: categoryId,
      });
      const res = await fetch(`/api/admin/products?${query.toString()}`);
      if (!res.ok) return;
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        const related: BakeryProduct[] = data.data
          .filter((p: { id: string }) => p.id !== currentId)
          .slice(0, 3)
          .map((p: { slug: string; image_url: string[]; name: string; description: string; price: number }) => ({
            id: p.slug,
            image: p.image_url?.[0] ?? "/images/placeholder.webp",
            name: p.name,
            description: p.description,
            price: p.price.toLocaleString("vi-VN") + " đ",
          }));
        setRelatedProducts(related);
      }
    } catch (error) {
      console.error("Failed to fetch related products:", error);
    }
  }, [locale]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  useEffect(() => {
    if (product?.category?.id) {
      fetchRelatedProducts(product.category.id, product.id);
    }
  }, [product?.category?.id, product?.id, fetchRelatedProducts]);

  if (notFoundError) notFound();

  if (isLoading) {
    return (
      <div className="bg-sand">
        <Header />
        <section className="relative h-64 animate-pulse bg-charcoal/10" />
        <section className="px-6 py-14">
          <div className="mx-auto max-w-2xl space-y-4">
            <div className="mx-auto h-96 w-full max-w-md animate-pulse rounded-2xl bg-charcoal/10" />
            <div className="mx-auto h-6 w-32 animate-pulse rounded bg-charcoal/10" />
            <div className="mx-auto h-4 w-64 animate-pulse rounded bg-charcoal/10" />
          </div>
        </section>
        <Footer />
      </div>
    );
  }

  if (!product) return null;

  const image = product.image_url?.[0] ?? "/images/placeholder.webp";
  const categoryName = product.category?.name?.[locale as "en" | "vi"] ?? "";
  const formattedPrice = product.price.toLocaleString("vi-VN") + " đ";

  return (
    <div className="bg-sand">
      <Header />

      {/* Hero banner */}
      <section className="relative overflow-hidden bg-charcoal-900 px-6 pb-8 pt-28">
        <Image
          src={image}
          alt={product.name}
          fill
          priority
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-charcoal-900/75 via-charcoal-900/55 to-charcoal-900/85" />

        <div className="relative z-10 mx-auto max-w-2xl text-center">
          <Link
            href="/menu"
            className="inline-flex items-center gap-1 text-sm font-semibold text-white/70 transition hover:text-amber"
          >
            <ChevronLeft className="h-4 w-4" /> {t("button.backToMenu")}
          </Link>
          {categoryName && (
            <p className="mt-4 font-script text-3xl text-amber">
              {categoryName}
            </p>
          )}
          <h1 className="mt-1 text-3xl font-bold text-white sm:text-4xl">
            {product.name}
          </h1>
        </div>
      </section>

      {/* Product detail */}
      <section className="relative z-10 px-6 py-14">
        <div className="mx-auto max-w-2xl text-center">
          <div className="relative mx-auto h-72 w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-md sm:h-96">
            <Image
              src={image}
              alt={product.name}
              fill
              priority
              className="object-cover"
            />
          </div>

          <p className="mt-8 text-2xl font-bold text-amber">{formattedPrice}</p>
          <p className="mx-auto mt-4 max-w-md text-charcoal/60">
            {product.description}
          </p>

          {product.ingredients.length > 0 && (
            <div className="mx-auto mt-10 max-w-sm text-left">
              <h2 className="flex items-center gap-2 font-serif text-lg font-bold text-charcoal">
                <Wheat className="h-4 w-4 text-amber" />
                {t("productDetailPage.ingredients")}
              </h2>
              <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-charcoal/60">
                {product.ingredients.map((ingredient) => (
                  <li key={ingredient.id} className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-amber" />
                    {ingredient.name?.[locale as "en" | "vi"] ??
                      ingredient.name.vi}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-10">
            <Button
              variant="accent"
              size="lg"
              className="font-semibold"
              disabled={isAdding}
              onClick={async () => {
                setIsAdding(true);
                await addItem(product.id);
                setIsAdding(false);
              }}
            >
              {t("button.addToCart")}
            </Button>
          </div>
        </div>
      </section>

      {relatedProducts.length > 0 && (
        <section className="relative z-10 bg-white px-6 py-16">
          <div className="mx-auto max-w-7xl">
            <p className="text-center font-script text-2xl text-amber">
              {t("productDetailPage.youMightAlsoLike")}
            </p>
            <div className="mt-10 grid gap-8 text-left sm:grid-cols-2 lg:grid-cols-3">
              {relatedProducts.map((item) => (
                <ProductCard key={item.id} product={item} animation={false} />
              ))}
            </div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
}
