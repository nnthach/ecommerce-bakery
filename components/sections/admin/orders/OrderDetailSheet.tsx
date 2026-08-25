"use client";

import { Calendar, CreditCard, Eye, Package, User } from "lucide-react";
import { useEffect, useState } from "react";
import Image from "next/image";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  formatOrderPaymentStatus,
  formatOrderPaymentStatusColor,
  formatOrderStatus,
  formatOrderStatusColor,
} from "@/utils/format-status";
import { useI18n } from "@/context/I18nContext";
import { formatDateTime } from "@/lib/utils";

interface OrderItemDetail {
  id: string;
  product_id: string;
  product_name: string;
  unit_price: number;
  quantity: number;
  subtotal: number;
  products?: {
    id: string;
    image_url: string[] | null;
    product_translations: ProductTranslation[];
  } | null;
}

interface ProductTranslation {
  locale: string;
  name: string;
}

interface OrderStoreDetail {
  id: string;
  name: string;
  address: { en: string; vi: string } | null;
  city: string;
  district: string;
  phone: string;
}

interface Payment {
  id: string;
  transaction_id: string | null;
}

interface OrderDetail {
  id: string;
  order_code: string;
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
  status: string;
  payment_status: string;
  payment_method: string;
  created_at: string;
  order_items: OrderItemDetail[];
  stores: OrderStoreDetail | null;
  payments: Payment | null;
}

const formatPrice = (price: number) =>
  `${(price ?? 0).toLocaleString("vi-VN")} đ`;

const formatPaymentMethod = (method: string) => {
  const normalizedMethod = method.trim().toLowerCase();
  return normalizedMethod
    ? normalizedMethod.charAt(0).toUpperCase() + normalizedMethod.slice(1)
    : "-";
};

const getProductName = (item: OrderItemDetail, locale: string) =>
  item.products?.product_translations.find(
    (translation) => translation.locale === locale,
  )?.name ??
  item.products?.product_translations[0]?.name ??
  item.product_name;

const getProductImage = (item: OrderItemDetail) =>
  item.products?.image_url?.[0] ?? null;

interface OrderDetailSheetProps {
  orderId: string;
}

export default function OrderDetailSheet({ orderId }: OrderDetailSheetProps) {
  const { t, locale } = useI18n();
  const [open, setOpen] = useState(false);
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;

    const fetchOrder = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await fetch(
          `/api/admin/orders/${orderId}?locale=${locale}`,
        );
        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.error || "Failed to fetch order detail");
        }

        setOrder(data.data);
      } catch (fetchError) {
        console.error("Fetch admin order detail error:", fetchError);
        setError(t("admin.orderDetailSheet.state.error"));
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrder();
  }, [open, orderId, locale, t]);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          title="Xem chi tiết"
          className="h-8 w-8 text-blue-600 hover:bg-blue-500/10 hover:text-blue-600"
        >
          <Eye className="h-3.5 w-3.5" />
        </Button>
      </SheetTrigger>

      <SheetContent className="flex h-full w-full flex-col p-0 sm:max-w-[550px] bg-white">
        <SheetHeader className="border-b bg-slate-50/50 p-6">
          <div className="flex items-start justify-between gap-4 pr-8">
            <SheetTitle className="flex items-center gap-2 text-xl">
              <Package className="text-blue-600" size={24} />
              {t("admin.orderDetailSheet.header.title").replace(
                "{orderCode}",
                order?.order_code || "-",
              )}
            </SheetTitle>
            {order && (
              <span
                className={`shrink-0 rounded-full px-3 py-1 text-sm font-bold shadow-sm ${formatOrderStatusColor(order.status)}`}
              >
                {t(
                  `admin.orderPage.status.order.${formatOrderStatus(order.status)}`,
                )}
              </span>
            )}
          </div>
        </SheetHeader>

        {isLoading ? (
          <div className="flex flex-1 items-center justify-center p-6 text-sm text-muted-foreground">
            {t("admin.orderDetailSheet.state.loading")}
          </div>
        ) : error ? (
          <div className="flex flex-1 items-center justify-center p-6 text-sm text-red-600">
            {error}
          </div>
        ) : order ? (
          <>
            <div className="flex-1 space-y-8 overflow-y-auto p-6">
              <section className="space-y-4">
                <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-600">
                  <User size={14} />{" "}
                  {t("admin.orderDetailSheet.customer.title")}
                </h3>
                <div className="grid grid-cols-2 gap-4 rounded-xl border border-slate-100 bg-slate-50 p-4">
                  <div className="space-y-1">
                    <p className="text-sm text-slate-500">
                      {t("admin.orderDetailSheet.customer.name")}
                    </p>
                    <p className="font-semibold">{order.name}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-slate-500">
                      {t("admin.orderDetailSheet.customer.phone")}
                    </p>
                    <p className="font-semibold">{order.phone}</p>
                  </div>
                  {order.stores && (
                    <div className="col-span-2 space-y-1 border-t border-slate-200 pt-3">
                      <p className="text-sm text-slate-500">
                        {t("admin.orderDetailSheet.customer.store")}
                      </p>
                      <p className="font-semibold">{order.stores.name}</p>
                      <p className="text-sm text-slate-600">
                        {order.stores.phone}
                      </p>
                    </div>
                  )}
                  <div className="col-span-2 space-y-1">
                    <p className="text-sm text-slate-500">
                      {t("admin.orderDetailSheet.customer.deliveryAddress")}
                    </p>
                    <p className="font-semibold">
                      {[order.address, order.ward, order.district, order.city]
                        .filter(Boolean)
                        .join(", ")}
                    </p>
                  </div>
                  {order.note && (
                    <div className="col-span-2 space-y-1">
                      <p className="text-sm text-slate-500">
                        {t("admin.orderDetailSheet.customer.note")}
                      </p>
                      <p className="font-semibold">{order.note}</p>
                    </div>
                  )}
                </div>
              </section>

              <section className="space-y-4">
                <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-600">
                  <Package size={14} />{" "}
                  {t("admin.orderDetailSheet.items.title").replace(
                    "{count}",
                    String(order.order_items?.length || 0),
                  )}
                </h3>
                <div className="space-y-3">
                  {order.order_items?.map((item) =>
                    (() => {
                      const productName = getProductName(item, locale);
                      const productImage = getProductImage(item);

                      return (
                        <div
                          key={item.id}
                          className="flex gap-4 rounded-xl border p-3 transition-colors hover:bg-slate-50"
                        >
                          <div className="relative flex aspect-[4/3] w-20 shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-gray-50">
                            {productImage ? (
                              <Image
                                src={productImage}
                                alt={productName}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <Package size={24} className="text-slate-300" />
                            )}
                          </div>
                          <div className="flex min-w-0 flex-1 flex-col justify-between">
                            <h4 className="truncate font-bold text-slate-800">
                              {productName}
                            </h4>
                            <div className="flex items-end justify-between gap-3">
                              <p className="text-sm text-slate-600">
                                {formatPrice(item.unit_price)} × {item.quantity}
                              </p>
                              <p className="text-sm font-bold text-slate-900">
                                {formatPrice(item.subtotal)}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })(),
                  )}
                </div>
              </section>

              <section className="grid grid-cols-2 gap-4 border-t pt-6">
                <div className="flex items-start gap-3">
                  <div className="shrink-0 rounded-lg bg-orange-50 p-2 text-orange-600">
                    <CreditCard size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase text-slate-500">
                      {t("admin.orderDetailSheet.payment.title")}
                    </p>
                    <p className="text-sm font-semibold text-slate-900">
                      {formatPaymentMethod(order.payment_method)}
                    </p>
                    {order.payments?.transaction_id && (
                      <p className="break-all text-sm font-semibold text-slate-900">
                        {t("admin.orderDetailSheet.payment.transactionId")}:{" "}
                        {order.payments.transaction_id}
                      </p>
                    )}
                    <span
                      className={`mt-1 inline-flex rounded-full border px-2 py-0.5 text-xs font-semibold ${formatOrderPaymentStatusColor(order.payment_status)}`}
                    >
                      {t(
                        `admin.orderPage.status.payment.${formatOrderPaymentStatus(order.payment_status)}`,
                      )}
                    </span>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="shrink-0 rounded-lg bg-blue-50 p-2 text-blue-600">
                    <Calendar size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase text-slate-500">
                      {t("admin.orderDetailSheet.date")}
                    </p>
                    <p className="text-sm font-semibold text-slate-900">
                      {formatDateTime(order.created_at).full}
                    </p>
                  </div>
                </div>
              </section>
            </div>

            <div className="space-y-4 border-t bg-slate-50 p-6">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-600">
                  {t("admin.orderDetailSheet.summary.subtotal")}
                </span>
                <span className="font-semibold text-slate-900">
                  {formatPrice(order.subtotal)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-600">
                  {t("admin.orderDetailSheet.summary.shippingFee")}
                </span>
                <span className="font-semibold text-slate-900">
                  {formatPrice(order.shipping_fee)}
                </span>
              </div>
              <div className="flex items-center justify-between border-t border-dashed border-slate-300 pt-3">
                <span className="text-sm font-bold text-slate-600">
                  {t("admin.orderDetailSheet.summary.total")}
                </span>
                <span className="text-xl font-bold text-slate-900">
                  {formatPrice(order.total)}
                </span>
              </div>
            </div>
          </>
        ) : (
          <div className="p-6 text-sm text-muted-foreground">
            {t("admin.orderDetailSheet.state.empty")}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
