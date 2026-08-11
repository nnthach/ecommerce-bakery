import React, { useCallback, useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { OrderItem } from "@/types";
import { formatOrderStatus } from "@/utils/format-status";
import { useI18n } from "@/context/I18nContext";

export default function RecentOrder() {
  const { t, locale } = useI18n();
  const [orders, setOrders] = useState<OrderItem[]>([]);

  // fetch orders from API
  const fetchOrders = useCallback(async () => {
    try {
      // get param
      const params = new URLSearchParams();
      params.set("sort_by", "created_at");
      params.set("order", "desc");
      params.set("page", String(1));
      params.set("limit", String(5));

      // call api
      const res = await fetch(`/api/admin/orders?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch orders");
      const data = await res.json();

      // check
      if (data.success && data.data) {
        setOrders(data.data);
      }
    } catch (error) {
      console.error(error);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  return (
    <Card className="lg:col-span-2 border-border shadow-sm">
      <CardHeader>
        <CardTitle className="text-base font-semibold">
          {locale === "vi" ? "Đơn hàng gần đây" : "Recent Orders"}
        </CardTitle>
        <CardDescription>
          {locale === "vi"
            ? "5 đơn hàng mới nhất hôm nay"
            : "5 most recent orders today"}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground">
                  {locale === "vi" ? "Mã đơn hàng" : "Order code"}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground">
                  {locale === "vi" ? "Tên khách hàng" : "Customer name"}
                </th>
                <th className="hidden px-6 py-3 text-left text-xs font-medium text-muted-foreground md:table-cell">
                  {locale === "vi" ? "Tổng sản phẩm" : "Product quantity"}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground">
                  {locale === "vi" ? "Trạng thái" : "Order status"}
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground">
                  {locale === "vi" ? "Tổng tiền" : "Total"}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {orders.map((order) => (
                <tr
                  key={order.id}
                  className="hover:bg-muted/40 transition-colors"
                >
                  <td className="px-6 py-3 font-mono text-xs text-muted-foreground">
                    {order.order_code}
                  </td>
                  <td className="px-6 py-3 font-medium">{order?.name}</td>
                  <td className="hidden px-6 py-3 text-muted-foreground md:table-cell">
                    10
                  </td>
                  <td className="px-6 py-3">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium`}
                    >
                      {t(
                        `admin.orderPage.status.order.${formatOrderStatus(order?.status)}`,
                      )}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-right font-medium">
                    {order.total}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
