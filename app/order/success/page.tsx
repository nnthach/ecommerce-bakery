"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2 } from "lucide-react";

import Header from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/context/I18nContext";

interface OrderItemDetail {
  id: string;
  product_id: string;
  product_name: string;
  unit_price: number;
  quantity: number;
  subtotal: number;
}

interface OrderStoreDetail {
  id: string;
  name: string;
  address: { en: string; vi: string } | null;
  city: string;
  district: string;
  phone: string;
}

interface OrderDetail {
  id: string;
  name: string;
  phone: string;
  address: string;
  note: string | null;
  city: string;
  district: string;
  ward: string;
  subtotal: number;
  shipping_fee: number;
  total: number;
  order_items: OrderItemDetail[];
  stores: OrderStoreDetail | null;
}

const formatPrice = (price: number) => price.toLocaleString("vi-VN") + " đ";

function OrderSuccessContent() {
  const { t, locale } = useI18n();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!orderId) return;

    const fetchOrder = async () => {
      try {
        setIsLoading(true);
        const res = await fetch(`/api/order/${orderId}`);
        const data = await res.json();
        if (data.success && data.data) {
          setOrder(data.data);
        }
      } catch (error) {
        console.error("Fetch order detail error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  return (
    <div className="flex h-screen flex-col bg-sand">
      <Header forceScrolled />
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col overflow-y-auto px-6 pb-4 pt-24 lg:overflow-hidden lg:pt-28">
        <div className="flex shrink-0 flex-col items-center gap-2 rounded-t-2xl border border-charcoal/10 bg-white px-6 py-6 text-center shadow-sm">
          <CheckCircle2 className="h-12 w-12 text-green-600" />
          <h2 className="text-lg font-semibold text-charcoal">
            {t("orderPage.result.success.title")}
          </h2>
          <p className="text-sm text-charcoal/55">
            {t("orderPage.result.success.message")}
          </p>
          {orderId && (
            <p className="text-xs text-charcoal/40">
              {t("orderPage.result.orderNumber").replace("{id}", orderId)}
            </p>
          )}
        </div>

        {isLoading ? (
          <div className="flex flex-1 items-center justify-center rounded-b-2xl border border-charcoal/10 bg-white p-10 text-sm text-charcoal/50">
            {t("orderPage.result.loading")}
          </div>
        ) : (
          order && (
            <div className="grid min-h-0 flex-1 grid-cols-1 overflow-hidden rounded-b-2xl border border-charcoal/10 bg-white shadow-sm lg:grid-cols-2 lg:divide-x lg:divide-charcoal/10">
              {/* LEFT: delivery + store info */}
              <div className="custom-scrollbar space-y-6 overflow-y-auto p-6">
                <section>
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-charcoal/50">
                    {t("orderPage.result.deliveryInfo")}
                  </h3>
                  <div className="mt-3 space-y-1 text-sm">
                    <p className="font-medium text-charcoal">{order.name}</p>
                    <p className="text-charcoal/70">{order.phone}</p>
                    <p className="text-charcoal/70">
                      {[order.address, order.ward, order.district, order.city]
                        .filter(Boolean)
                        .join(", ")}
                    </p>
                    {order.note && (
                      <p className="text-charcoal/50">{order.note}</p>
                    )}
                  </div>
                </section>

                {order.stores && (
                  <section>
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-charcoal/50">
                      {t("orderPage.result.store")}
                    </h3>
                    <div className="mt-3 space-y-1 text-sm">
                      <p className="font-medium text-charcoal">
                        {order.stores.name}
                      </p>
                      <p className="text-charcoal/70">{order.stores.phone}</p>
                      <p className="text-charcoal/70">
                        {order.stores.address?.[locale]}
                      </p>
                    </div>
                  </section>
                )}
              </div>

              {/* RIGHT: items + totals */}
              <div className="custom-scrollbar flex flex-col overflow-y-auto p-6">
                <h3 className="shrink-0 text-sm font-semibold uppercase tracking-wide text-charcoal/50">
                  {t("orderPage.result.items")}
                </h3>
                <div className="mt-3 min-h-0 flex-1 space-y-3">
                  {order.order_items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between text-sm"
                    >
                      <div>
                        <p className="font-medium text-charcoal">
                          {item.product_name}
                        </p>
                        <p className="text-charcoal/50">
                          {formatPrice(item.unit_price)} × {item.quantity}
                        </p>
                      </div>
                      <span className="font-medium text-charcoal">
                        {formatPrice(item.subtotal)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-4 shrink-0 space-y-2 border-t border-charcoal/10 pt-4 text-sm">
                  <div className="flex items-center justify-between text-charcoal/70">
                    <span>{t("orderPage.summary.subtotal")}</span>
                    <span>{formatPrice(order.subtotal)}</span>
                  </div>
                  <div className="flex items-center justify-between text-charcoal/70">
                    <span>{t("orderPage.summary.shippingFee")}</span>
                    <span>
                      {order.shipping_fee === 0
                        ? t("orderPage.summary.free")
                        : formatPrice(order.shipping_fee)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-t border-dashed border-charcoal/15 pt-3 text-base font-bold text-charcoal">
                    <span>{t("orderPage.summary.total")}</span>
                    <span className="text-amber-600">
                      {formatPrice(order.total)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )
        )}

        <div className="mt-4 flex shrink-0 justify-center">
          <Link href="/menu">
            <Button variant="accent" className="font-semibold">
              {t("orderPage.result.backToMenu")}
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={null}>
      <OrderSuccessContent />
    </Suspense>
  );
}
