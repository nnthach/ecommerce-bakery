import { Package, ShoppingCart, TrendingUp, Users } from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface StatCard {
  total_orders: number;
  total_revenue: number;
  total_products_sold: number;
  total_new_users: number;
}

export default function StatCard() {
  const [statCard, setStatCard] = useState<StatCard | null>(null);

  // fetch orders from API
  const fetchStatCard = useCallback(async () => {
    try {
      // call api
      const res = await fetch(`/api/admin/dashboard/stat-card`);
      if (!res.ok) throw new Error("Failed to fetch stat card");
      const data = await res.json();

      // check
      if (data.success && data.data) {
        setStatCard(data.data);
      }
    } catch (error) {
      console.error(error);
    }
  }, []);

  useEffect(() => {
    fetchStatCard();
  }, [fetchStatCard]);

  const STATS = [
    {
      label: "Tổng đơn hàng",
      value: statCard?.total_orders.toLocaleString("vi-VN") ?? "0",
      change: "Trong tháng này",
      icon: ShoppingCart,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      label: "Doanh thu tháng",
      value: `${(statCard?.total_revenue ?? 0).toLocaleString("vi-VN")} ₫`,
      change: "Trong tháng này",
      icon: TrendingUp,
      color: "text-accent",
      bg: "bg-accent/10",
    },
    {
      label: "Sản phẩm đã bán",
      value: statCard?.total_products_sold.toLocaleString("vi-VN") ?? "0",
      change: "Trong tháng này",
      icon: Package,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      label: "Khách hàng mới",
      value: statCard?.total_new_users.toLocaleString("vi-VN") ?? "0",
      change: "Trong tháng này",
      icon: Users,
      color: "text-accent",
      bg: "bg-accent/10",
    },
  ];
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {STATS.map((stat) => (
        <Card key={stat.label} className="border-border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.label}
            </CardTitle>
            <div className={`rounded-lg p-2 ${stat.bg}`}>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-foreground">{stat.value}</p>
            <p className="mt-1 text-xs text-muted-foreground">{stat.change}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
