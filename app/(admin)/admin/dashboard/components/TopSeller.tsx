import React, { useCallback, useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Star } from "lucide-react";
import { useI18n } from "@/context/I18nContext";

interface TopProduct {
  product_id: string;
  product_name: string;
  quantity_sold: number;
}

export default function TopSeller() {
  const { locale } = useI18n();

  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);

  const fetchTopProducts = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/admin/dashboard/top-seller?locale=${locale}`,
      );

      if (!res.ok) {
        throw new Error("Failed to fetch top products");
      }

      const data = await res.json();

      if (data.success && data.data) {
        setTopProducts(data.data);
      }
    } catch (error) {
      console.error("Fetch top products error:", error);
    }
  }, [locale]);

  useEffect(() => {
    fetchTopProducts();
  }, [fetchTopProducts]);

  // Lấy số lượng bán cao nhất để tính percentage
  const maxSold = topProducts.length
    ? Math.max(...topProducts.map((product) => product.quantity_sold))
    : 0;

  return (
    <Card className="border-border shadow-sm">
      <CardHeader>
        <CardTitle className="text-base font-semibold">
          {locale === "vi" ? "Sản phẩm bán chạy" : "Top Seller"}
        </CardTitle>

        <CardDescription>
          {locale === "vi"
            ? "Top 4 sản phẩm tháng này"
            : "Top 4 products this month"}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {topProducts.slice(0, 4).map((product) => {
          const pct = maxSold
            ? Math.round((product.quantity_sold / maxSold) * 100)
            : 0;

          return (
            <div key={product.product_id} className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Star className="h-3.5 w-3.5 text-accent" />

                  <span className="font-medium">{product.product_name}</span>
                </div>

                <span className="text-xs text-muted-foreground">
                  {locale === "vi"
                    ? `${product.quantity_sold} bán`
                    : `${product.quantity_sold} sold`}
                </span>
              </div>

              <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
