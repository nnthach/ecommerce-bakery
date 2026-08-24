"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Filter, LayoutGrid, Loader2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StoreInventoryRaw } from "@/types";
import { useI18n } from "@/context/I18nContext";
import Image from "next/image";
import CreateStoreInventoryModal from "@/components/sections/staff/store-inventory/CreateStoreInventoryModal";
import { getToday } from "@/lib/utils";
import { usePagination } from "@/hooks/usePagination";
import AdminPagination from "@/components/custom/AdminPagination";

const STATUS_OPTIONS = [
  { label: "Tất cả", value: "" },
  { label: "Còn hàng", value: "available" },
  { label: "Không còn hàng", value: "out_of_stock" },
  { label: "Ít hàng", value: "low_stock" },
  { label: "Chờ bắt đầu", value: "draft" },
  { label: "Đã đóng", value: "closed" },
];

const SORT_BY_OPTIONS = [
  { label: "Ngày tạo", value: "created_at" },
  { label: "Tên", value: "name" },
];

const DEFAULT_LIMIT = 8;

const LIMIT_OPTIONS = [
  { label: `${DEFAULT_LIMIT}`, value: String(DEFAULT_LIMIT) },
  { label: "10", value: "10" },
  { label: "15", value: "15" },
  { label: "20", value: "20" },
  { label: "50", value: "50" },
];

const ORDER_OPTIONS = [
  { label: "Giảm dần", value: "desc" },
  { label: "Tăng dần", value: "asc" },
];

interface FilterState {
  status: string;
  sort_by: "name" | "created_at";
  order: "asc" | "desc";
  limit: number;
}

const DEFAULT_FILTER: FilterState = {
  status: "",
  sort_by: "created_at",
  order: "desc",
  limit: DEFAULT_LIMIT,
};

export default function StaffStoreInventoryPage() {
  const [stores, setStoreInventories] = useState<StoreInventoryRaw[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(getToday());

  const [appliedFilter, setAppliedFilter] =
    useState<FilterState>(DEFAULT_FILTER);
  const [tempFilter, setTempFilter] = useState<FilterState>(DEFAULT_FILTER);
  const { page, setPage, pagination, setPagination, resetPage } =
    usePagination();

  const { t, locale } = useI18n();

  const fetchStoreInventory = useCallback(
    async (
      date: string,
      filter: FilterState = appliedFilter,
      pageNum: number = page,
    ) => {
      try {
        setIsLoading(true);

        const params = new URLSearchParams();

        params.set("date", date);
        if (filter.status) {
          params.set("status", filter.status);
        }

        params.set("page", String(pageNum));
        params.set("limit", String(filter.limit));

        // call api - server tự xác định store_id từ session
        const res = await fetch(
          `/api/staff/store-inventories?${params.toString()}`,
        );
        if (!res.ok) throw new Error("Failed to fetch store inventories");
        const data = await res.json();

        // check
        if (data.success && data.data) {
          setStoreInventories(data.data);
          setPagination(data.pagination ?? null);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    },
    [appliedFilter, page, setPagination],
  );

  // only fetch inventory once a store_id is available
  useEffect(() => {
    fetchStoreInventory(selectedDate);
  }, [selectedDate, fetchStoreInventory]);

  // reset to page 1 whenever the selected store changes
  useEffect(() => {
    resetPage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate]);

  // apply filter
  const handleApply = () => {
    setAppliedFilter(tempFilter);
    resetPage();
    fetchStoreInventory(selectedDate, tempFilter, 1);
  };

  // clear filter
  const handleClearFilter = () => {
    setAppliedFilter(DEFAULT_FILTER);
    setTempFilter(DEFAULT_FILTER);
    resetPage();
    fetchStoreInventory(selectedDate, tempFilter, 1);
  };

  //check filter
  const isFilterActive =
    appliedFilter.status !== "" ||
    appliedFilter.sort_by !== DEFAULT_FILTER.sort_by ||
    appliedFilter.order !== DEFAULT_FILTER.order ||
    appliedFilter.limit !== DEFAULT_FILTER.limit;

  const activeFilterCount =
    (appliedFilter.status !== "" ? 1 : 0) +
    (appliedFilter.sort_by !== DEFAULT_FILTER.sort_by ||
    appliedFilter.order !== DEFAULT_FILTER.order
      ? 1
      : 0) +
    (appliedFilter.limit !== DEFAULT_FILTER.limit ? 1 : 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          {t("admin.storeInventoriesPage.headerTitle.title")}
        </h1>
        <p className="text-sm text-muted-foreground">
          {t("admin.storeInventoriesPage.headerTitle.subtitle")}
        </p>
      </div>

      {/* Main card */}
      <div className="rounded-xl border bg-card shadow-sm">
        {/* Card header */}
        <div className="flex items-center justify-between border-b px-4 py-4">
          <div className="flex items-center gap-3">
            <Popover
              onOpenChange={(open) => open && setTempFilter(appliedFilter)}
            >
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 bg-card hover:bg-sand-100"
                >
                  <Filter className="h-4 w-4" />
                  {t("button.filter")}
                  {activeFilterCount > 0 && (
                    <span className="ml-1 rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-semibold text-primary-foreground leading-none">
                      {activeFilterCount}
                    </span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent align="start" className="w-64">
                <div className="grid gap-4">
                  {/* Status filter */}
                  <div className="grid gap-2">
                    <p className="text-sm font-medium leading-none">
                      Trạng thái
                    </p>

                    <select
                      className="border rounded-md h-9 px-2 w-full text-sm"
                      value={tempFilter.status}
                      onChange={(e) =>
                        setTempFilter((prev) => ({
                          ...prev,
                          status: e.target.value,
                        }))
                      }
                    >
                      {STATUS_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Sort by */}
                  <div className="grid gap-2">
                    <p className="text-sm font-medium leading-none">
                      Sắp xếp theo
                    </p>
                    <select
                      className="border rounded-md h-9 px-2 w-full text-sm"
                      value={tempFilter.sort_by}
                      onChange={(e) =>
                        setTempFilter((prev) => ({
                          ...prev,
                          sort_by: e.target.value as FilterState["sort_by"],
                        }))
                      }
                    >
                      {SORT_BY_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Order */}
                  <div className="grid gap-2">
                    <p className="text-sm font-medium leading-none">Thứ tự</p>
                    <select
                      className="border rounded-md h-9 px-2 w-full text-sm"
                      value={tempFilter.order}
                      onChange={(e) =>
                        setTempFilter((prev) => ({
                          ...prev,
                          order: e.target.value as FilterState["order"],
                        }))
                      }
                    >
                      {ORDER_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Limit per page */}
                  <div className="grid gap-2">
                    <p className="text-sm font-medium leading-none">
                      Số dòng mỗi trang
                    </p>
                    <select
                      className="border rounded-md h-9 px-2 w-full text-sm"
                      value={String(tempFilter.limit)}
                      onChange={(e) =>
                        setTempFilter((prev) => ({
                          ...prev,
                          limit: parseInt(e.target.value, 10),
                        }))
                      }
                    >
                      {LIMIT_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <PopoverClose asChild>
                    <Button variant={"accent"} size="sm" onClick={handleApply}>
                      {t("button.apply")}
                    </Button>
                  </PopoverClose>
                </div>
              </PopoverContent>
            </Popover>

            {/* Date filter */}
            <input
              type="date"
              className="border rounded-md h-9 px-2 w-40 text-sm bg-card"
              value={selectedDate}
              onChange={(e) => {
                setSelectedDate(e.target.value);
                resetPage();
              }}
            />

            {isFilterActive && (
              <button
                onClick={handleClearFilter}
                className="text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground"
              >
                {t("button.clearFilter")}
              </button>
            )}
          </div>

          <CreateStoreInventoryModal
            onCreated={() => fetchStoreInventory(selectedDate, tempFilter, 1)}
          />
        </div>

        {/* Table */}
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-12 text-center">
                {t("admin.table.columns.no")}
              </TableHead>
              <TableHead>
                {t("admin.storeInventoriesPage.table.columns.image")}
              </TableHead>
              <TableHead>
                {t("admin.storeInventoriesPage.table.columns.name")}
              </TableHead>
              <TableHead>
                {t("admin.storeInventoriesPage.table.columns.plannedQuantity")}
              </TableHead>
              <TableHead>
                {t("admin.storeInventoriesPage.table.columns.remainQuantity")}
              </TableHead>
              <TableHead>
                {t("admin.storeInventoriesPage.table.columns.updatedBy")}
              </TableHead>
              <TableHead>
                {t("admin.storeInventoriesPage.table.columns.status")}
              </TableHead>
              <TableHead>
                {t("admin.storeInventoriesPage.table.columns.businessDate")}
              </TableHead>
              <TableHead className="text-right">
                {t("admin.table.columns.actions")}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={9}
                  className="py-20 text-center text-muted-foreground"
                >
                  <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                </TableCell>
              </TableRow>
            ) : stores.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={9}
                  className="py-20 text-center text-muted-foreground"
                >
                  <div className="flex flex-col items-center gap-3">
                    <LayoutGrid className="h-10 w-10 opacity-30" />
                    <p className="text-sm">
                      {t("admin.storeInventoriesPage.empty")}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              stores.map((storeInventory, index) => {
                const statusVariant: Record<
                  string,
                  "success" | "warning" | "destructive" | "secondary"
                > = {
                  available: "success",
                  low_stock: "warning",
                  out_of_stock: "destructive",
                };
                const statusKey = storeInventory.status ?? "unknown";

                const translation =
                  storeInventory.products.product_translations.find(
                    (tr) => tr.locale === locale,
                  ) ?? storeInventory.products.product_translations[0];

                return (
                  <TableRow key={storeInventory.id}>
                    <TableCell className="text-center text-muted-foreground text-xs">
                      {index + 1}
                    </TableCell>
                    <TableCell>
                      <div className="relative w-12 h-12 overflow-hidden rounded-md">
                        <Image
                          src={storeInventory.products.image_url[0]}
                          alt={translation?.name ?? ""}
                          fill
                          className="object-cover"
                        />
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      {translation?.name}
                    </TableCell>
                    <TableCell className="font-medium">
                      {storeInventory.planned_quantity}
                    </TableCell>
                    <TableCell className="font-medium">
                      {storeInventory.remaining_quantity}
                    </TableCell>
                    <TableCell className="font-medium">
                      {storeInventory.staffs?.users?.full_name ?? "-"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusVariant[statusKey] ?? "secondary"}>
                        {t(`admin.storeInventoriesPage.status.${statusKey}`)}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">
                      {storeInventory.business_date ?? "-"}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>

        {/* Footer count */}
        <div className="flex items-center justify-between border-t px-6 py-3">
          <p className="text-xs text-muted-foreground">
            {t("admin.storeInventoriesPage.showing")}{" "}
            <span className="font-medium text-foreground">{stores.length}</span>{" "}
            {t("admin.table.pagination.of")}{" "}
            <span className="font-medium text-foreground">
              {pagination?.total_items ?? stores.length}
            </span>
          </p>

          <AdminPagination
            page={page}
            totalPages={pagination?.total_pages ?? 0}
            onPageChange={setPage}
          />
        </div>
      </div>
    </div>
  );
}
