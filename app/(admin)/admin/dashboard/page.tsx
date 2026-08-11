"use client";

import { useI18n } from "@/context/I18nContext";
import StatCard from "./components/StatCard";
import RecentOrder from "./components/RecentOrder";
import TopSeller from "./components/TopSeller";

export default function AdminDashboardPage() {
  const { t } = useI18n();

  return (
    <div className="space-y-6">
      {/* Page title */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          {t("admin.dashboardPage.headerTitle.title")}
        </h1>
        <p className="text-sm text-muted-foreground">
          {t("admin.dashboardPage.headerTitle.subtitle")}
        </p>
      </div>

      <StatCard />

      {/* Recent orders + top products */}
      <div className="grid gap-4 lg:grid-cols-3">
        <RecentOrder />

        <TopSeller />
      </div>
    </div>
  );
}
