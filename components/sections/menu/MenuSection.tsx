"use client";

import ProductCard from "@/components/custom/ProductCard";
import { cn } from "@/lib/utils";
import { CategoryItem, StoreInventoryItemStatusEnum } from "@/types";
import { useCallback, useEffect, useState } from "react";
import { useI18n } from "@/context/I18nContext";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { usePagination } from "@/hooks/usePagination";

interface FetchedProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  slug: string;
  image_url: string[];
  is_active: boolean;
  category: { id: string; name: { en: string; vi: string } } | null;
  status: StoreInventoryItemStatusEnum;
}

const PRODUCTS_PER_PAGE = 12;

export default function MenuSection() {
  const { t, locale } = useI18n();
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const { page, setPage, pagination, setPagination, resetPage } =
    usePagination();
  const [products, setProducts] = useState<FetchedProduct[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch("/api/categories?is_active=true");
      if (!res.ok) return;
      const data = await res.json();
      if (data.success && data.data) {
        setCategories(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  }, []);

  const fetchProducts = useCallback(
    async (categoryId: string, pageNum: number) => {
      try {
        setIsLoading(true);
        const params = new URLSearchParams({
          is_active: "true",
          sort_by: "created_at",
          order: "asc",
          limit: String(PRODUCTS_PER_PAGE),
          page: String(pageNum),
          locale,
          city: "Hồ Chí Minh",
        });
        if (categoryId !== "all") {
          params.set("category_id", categoryId);
        }
        const res = await fetch(`/api/products/menu?${params.toString()}`);
        if (!res.ok) return;
        const data = await res.json();
        if (data.success && data.data) {
          setProducts(data.data);
          setPagination(data.pagination ?? null);
        }
      } catch (error) {
        console.error("Failed to fetch products:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [locale, setPagination],
  );

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    fetchProducts(activeCategory, page);
  }, [fetchProducts, activeCategory, page]);

  const handleSelectCategory = (id: string) => {
    setActiveCategory(id);
    resetPage();
  };

  // pagination
  const handlePageChange = (nextPage: number) => {
    if (
      nextPage < 1 ||
      nextPage === page ||
      (pagination && nextPage > pagination.total_pages)
    ) {
      return;
    }
    setPage(nextPage);
  };

  const getPageNumbers = (current: number, total: number) => {
    const pages: (number | "ellipsis")[] = [];
    const neighbors = 1;

    for (let i = 1; i <= total; i++) {
      if (
        i === 1 ||
        i === total ||
        (i >= current - neighbors && i <= current + neighbors)
      ) {
        pages.push(i);
      } else if (pages[pages.length - 1] !== "ellipsis") {
        pages.push("ellipsis");
      }
    }

    return pages;
  };
  // end pagination

  const formatPrice = (price: number) => price.toLocaleString("vi-VN") + " đ";

  return (
    <section className="relative z-10 bg-sand px-6 py-16">
      <div className="mx-auto max-w-7xl">
        {/* Category filter buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => handleSelectCategory("all")}
            className={cn(
              "rounded-full border px-5 py-2 text-sm font-semibold transition",
              activeCategory === "all"
                ? "border-amber bg-amber text-white shadow-sm"
                : "border-charcoal/15 bg-white text-charcoal/60 hover:border-amber/50 hover:text-charcoal",
            )}
          >
            {t("menuPage.menuFilter.all")}
          </button>

          {categories.map((category) => (
            <button
              key={category.id}
              type="button"
              onClick={() => handleSelectCategory(category.id)}
              className={cn(
                "rounded-full border px-5 py-2 text-sm font-semibold transition",
                activeCategory === category.id
                  ? "border-amber bg-amber text-white shadow-sm"
                  : "border-charcoal/15 bg-white text-charcoal/60 hover:border-amber/50 hover:text-charcoal",
              )}
            >
              {category.name[locale as "en" | "vi"] ?? category.name.vi}
            </button>
          ))}
        </div>

        {/* Product grid */}
        {isLoading ? (
          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-80 animate-pulse rounded-2xl bg-white/60"
              />
            ))}
          </div>
        ) : (
          <>
            <div className="mt-16 grid gap-8 text-left sm:grid-cols-2 lg:grid-cols-3">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={{
                    id: product.slug,
                    image: product.image_url?.[0] ?? "/images/placeholder.webp",
                    name: product.name,
                    description: product.description,
                    price: formatPrice(product.price),
                    status: product.status,
                  }}
                  animation={false}
                />
              ))}
            </div>

            {products.length === 0 && (
              <p className="mt-12 text-center text-charcoal/50">
                {t("menuPage.menuFilter.empty")}
              </p>
            )}

            {/*pagination */}
            {pagination && pagination.total_pages > 1 && (
              <nav
                aria-label="pagination"
                className="mt-14 flex items-center justify-center gap-2"
              >
                <button
                  type="button"
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                  aria-label={t("menuPage.pagination.previous")}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-charcoal/15 bg-white text-charcoal/60 transition hover:border-amber/50 hover:text-charcoal disabled:pointer-events-none disabled:opacity-40"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>

                {getPageNumbers(page, pagination.total_pages).map((item, i) =>
                  item === "ellipsis" ? (
                    <span
                      key={`ellipsis-${i}`}
                      className="px-1 text-sm text-charcoal/40"
                    >
                      …
                    </span>
                  ) : (
                    <button
                      key={item}
                      type="button"
                      onClick={() => handlePageChange(item)}
                      aria-current={item === page ? "page" : undefined}
                      className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-full border text-sm font-semibold transition",
                        item === page
                          ? "border-amber bg-amber text-white shadow-sm"
                          : "border-charcoal/15 bg-white text-charcoal/60 hover:border-amber/50 hover:text-charcoal",
                      )}
                    >
                      {item}
                    </button>
                  ),
                )}

                <button
                  type="button"
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page === pagination.total_pages}
                  aria-label={t("menuPage.pagination.next")}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-charcoal/15 bg-white text-charcoal/60 transition hover:border-amber/50 hover:text-charcoal disabled:pointer-events-none disabled:opacity-40"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </nav>
            )}
          </>
        )}
      </div>
    </section>
  );
}
