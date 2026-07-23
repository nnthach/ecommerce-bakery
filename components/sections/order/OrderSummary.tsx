"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { useI18n } from "@/context/I18nContext";

interface OrderSummaryProps {
  shippingFee: number;
  grandTotal: number;
}

export default function OrderSummary({
  shippingFee,
  grandTotal,
}: OrderSummaryProps) {
  const { t } = useI18n();
  const { items, isLoading, totalPrice, updateQuantity, removeItem } =
    useCart();

  const formatPrice = (price: number) => price.toLocaleString("vi-VN") + " đ";

  return (
    <div className="lg:col-span-2 lg:h-full">
      <div className="flex h-full flex-col rounded-2xl border border-charcoal/10 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-charcoal">
            {t("orderPage.summary.title")}
          </h2>
          {items.length > 0 && (
            <span className="rounded-full bg-charcoal/5 px-2.5 py-1 text-xs font-semibold text-charcoal/60">
              {t("orderPage.summary.itemCount").replace(
                "{count}",
                String(items.length),
              )}
            </span>
          )}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16 text-sm text-charcoal/50">
            {t("cart.loading")}
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-12 text-center">
            <ShoppingBag className="h-9 w-9 text-charcoal/20" />
            <p className="text-sm text-charcoal/55">
              {t("orderPage.summary.empty")}
            </p>
            <Link href="/menu">
              <Button type="button" variant="outline" size="sm">
                {t("orderPage.summary.browseMenu")}
              </Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="custom-scrollbar mt-4 min-h-0 flex-1 space-y-4 overflow-y-auto pr-1">
              {items.map((item) => (
                <div key={item.id} className="flex gap-3">
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-charcoal/5">
                    {item.product.image_url?.[0] && (
                      <Image
                        src={item.product.image_url[0]}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                      />
                    )}
                  </div>
                  <div className="flex flex-1 flex-col gap-1">
                    <p className="text-sm font-medium leading-tight text-charcoal">
                      {item.product.name}
                    </p>
                    <p className="text-sm text-charcoal/55">
                      {formatPrice(item.product.price)}
                    </p>
                    <div className="mt-1 flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() =>
                          updateQuantity(
                            item.id,
                            Math.max(1, item.quantity - 1),
                          )
                        }
                        disabled={item.quantity <= 1}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-6 text-center text-sm">
                        {item.quantity}
                      </span>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() =>
                          updateQuantity(item.id, item.quantity + 1)
                        }
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 shrink-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => removeItem(item.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </div>

            <div className="mt-4 shrink-0 space-y-2 border-t border-charcoal/10 pt-4 text-sm">
              <div className="flex items-center justify-between text-charcoal/70">
                <span>{t("orderPage.summary.subtotal")}</span>
                <span>{formatPrice(totalPrice)}</span>
              </div>
              <div className="flex items-center justify-between text-charcoal/70">
                <span>{t("orderPage.summary.shippingFee")}</span>
                <span>
                  {shippingFee === 0
                    ? t("orderPage.summary.free")
                    : formatPrice(shippingFee)}
                </span>
              </div>
              <div className="flex items-center justify-between border-t border-dashed border-charcoal/15 pt-3 text-base font-bold text-charcoal">
                <span>{t("orderPage.summary.total")}</span>
                <span className="text-amber-600">
                  {formatPrice(grandTotal)}
                </span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
