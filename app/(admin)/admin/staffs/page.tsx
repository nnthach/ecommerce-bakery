"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Filter,
  Search,
  X,
  Trash2,
  LayoutGrid,
  Loader2,
  Ban,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
import CreateStaffModal from "@/components/sections/admin/staffs/CreateStaffModal";
import UpdateStaffModal from "@/components/sections/admin/staffs/UpdateStaffModal";
import { useI18n } from "@/context/I18nContext";
import { StaffItem } from "@/types";
import AdminPagination from "@/components/custom/AdminPagination";
import { usePagination } from "@/hooks/usePagination";
import { useDebounce } from "@/hooks/useDebounce";

const DEFAULT_LIMIT = 8;

const LIMIT_OPTIONS = [
  { label: `${DEFAULT_LIMIT}`, value: String(DEFAULT_LIMIT) },
  { label: "10", value: "10" },
  { label: "15", value: "15" },
  { label: "20", value: "20" },
  { label: "50", value: "50" },
];

interface FilterState {
  is_active: boolean | undefined;
  sort_by: "full_name" | "created_at";
  order: "asc" | "desc";
  limit: number;
}

const DEFAULT_FILTER: FilterState = {
  is_active: undefined,
  sort_by: "created_at",
  order: "desc",
  limit: DEFAULT_LIMIT,
};

export default function AdminStaffPage() {
  const { t } = useI18n();
  const [staffs, setStaffs] = useState<StaffItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [appliedFilter, setAppliedFilter] =
    useState<FilterState>(DEFAULT_FILTER);
  const [tempFilter, setTempFilter] = useState<FilterState>(DEFAULT_FILTER);
  const { page, setPage, pagination, setPagination, resetPage } =
    usePagination();
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
  const isFirstSearch = useRef(true);

  const STATUS_OPTIONS = [
    { label: t("admin.staffsPage.filter.statusOptions.all"), value: "" },
    { label: t("admin.staffsPage.filter.statusOptions.active"), value: "true" },
    {
      label: t("admin.staffsPage.filter.statusOptions.inactive"),
      value: "false",
    },
  ];

  const SORT_BY_OPTIONS = [
    {
      label: t("admin.staffsPage.filter.sortByOptions.createdAt"),
      value: "created_at",
    },
    {
      label: t("admin.staffsPage.filter.sortByOptions.fullname"),
      value: "full_name",
    },
  ];

  const ORDER_OPTIONS = [
    { label: t("admin.staffsPage.filter.orderOptions.desc"), value: "desc" },
    { label: t("admin.staffsPage.filter.orderOptions.asc"), value: "asc" },
  ];

  // fetch staffs from API
  const fetchStaffs = useCallback(
    async (filter: FilterState = appliedFilter, pageNum: number = page) => {
      try {
        setIsLoading(true);

        // get param
        const params = new URLSearchParams();
        if (filter.is_active !== undefined) {
          params.set("is_active", String(filter.is_active));
        }
        params.set("sort_by", filter.sort_by);
        params.set("order", filter.order);
        params.set("page", String(pageNum));
        params.set("limit", String(filter.limit));
        if (debouncedSearch) {
          params.set("search", debouncedSearch);
        }

        // call api
        const res = await fetch(`/api/admin/staffs?${params.toString()}`);
        if (!res.ok) throw new Error("Failed to fetch staffs");
        const data = await res.json();

        // check
        if (data.success && data.data) {
          setStaffs(data.data);
          setPagination(data.pagination ?? null);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    },
    [appliedFilter, page, debouncedSearch],
  );

  useEffect(() => {
    fetchStaffs();
  }, [fetchStaffs]);

  // reset to page 1 whenever the (debounced) search term changes
  useEffect(() => {
    if (isFirstSearch.current) {
      isFirstSearch.current = false;
      return;
    }
    resetPage();
    fetchStaffs(appliedFilter, 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  // disable (soft delete)
  const disableStaff = async (id: string) => {
    try {
      await fetch(`/api/admin/staffs/${id}/disable`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
      });
      fetchStaffs(appliedFilter, page);
    } catch (error) {
      console.error(error);
      alert("Failed to disable");
    }
  };

  // restore
  const restoreStaff = async (id: string) => {
    try {
      await fetch(`/api/admin/staffs/${id}/restore`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
      });
      fetchStaffs(appliedFilter, page);
    } catch (error) {
      console.error(error);
      alert("Failed to restore");
    }
  };

  // delete (only allowed once already disabled)
  const deleteStaff = async (id: string) => {
    if (!window.confirm(t("admin.staffsPage.deleteConfirm"))) return;

    try {
      await fetch(`/api/admin/staffs/${id}`, { method: "DELETE" });
      fetchStaffs(appliedFilter, page);
    } catch (error) {
      console.error(error);
      alert("Failed to delete");
    }
  };

  const handleApply = () => {
    setAppliedFilter(tempFilter);
    resetPage();
    fetchStaffs(tempFilter, 1);
  };

  const handleClearFilter = () => {
    setAppliedFilter(DEFAULT_FILTER);
    setTempFilter(DEFAULT_FILTER);
    resetPage();
    fetchStaffs(DEFAULT_FILTER, 1);
  };

  const isFilterActive =
    appliedFilter.is_active !== undefined ||
    appliedFilter.sort_by !== DEFAULT_FILTER.sort_by ||
    appliedFilter.order !== DEFAULT_FILTER.order ||
    appliedFilter.limit !== DEFAULT_FILTER.limit;

  const activeFilterCount =
    (appliedFilter.is_active !== undefined ? 1 : 0) +
    (appliedFilter.sort_by !== DEFAULT_FILTER.sort_by ||
    appliedFilter.order !== DEFAULT_FILTER.order
      ? 1
      : 0) +
    (appliedFilter.limit !== DEFAULT_FILTER.limit ? 1 : 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          {t("admin.staffsPage.headerTitle.title")}
        </h1>
        <p className="text-sm text-muted-foreground">
          {t("admin.staffsPage.headerTitle.subtitle")}
        </p>
      </div>

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
                  <div className="grid gap-2">
                    <p className="text-sm font-medium leading-none">
                      {t("admin.staffsPage.filter.statusLabel")}
                    </p>
                    <select
                      className="border rounded-md h-9 px-2 w-full text-sm"
                      value={
                        tempFilter.is_active === undefined
                          ? ""
                          : String(tempFilter.is_active)
                      }
                      onChange={(e) => {
                        const v = e.target.value;
                        setTempFilter((prev) => ({
                          ...prev,
                          is_active: v === "" ? undefined : v === "true",
                        }));
                      }}
                    >
                      {STATUS_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid gap-2">
                    <p className="text-sm font-medium leading-none">
                      {t("admin.staffsPage.filter.sortByLabel")}
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

                  <div className="grid gap-2">
                    <p className="text-sm font-medium leading-none">
                      {t("admin.staffsPage.filter.orderLabel")}
                    </p>
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
                    <Button variant="accent" size="sm" onClick={handleApply}>
                      {t("button.apply")}
                    </Button>
                  </PopoverClose>
                </div>
              </PopoverContent>
            </Popover>

            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t("admin.staffsPage.searchPlaceholder")}
                className="h-9 w-56 border-border bg-white pl-8 pr-8 text-sm focus-visible:ring-1 focus-visible:ring-border focus-visible:ring-offset-0"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  aria-label={t("admin.staffsPage.clearSearch")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {isFilterActive && (
              <button
                onClick={handleClearFilter}
                className="text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground"
              >
                {t("button.clearFilter")}
              </button>
            )}
          </div>

          <CreateStaffModal
            onCreated={() => fetchStaffs(appliedFilter, page)}
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
                {t("admin.staffsPage.table.columns.fullname")}
              </TableHead>
              <TableHead>{t("admin.staffsPage.table.columns.email")}</TableHead>
              <TableHead>{t("admin.staffsPage.table.columns.store")}</TableHead>
              <TableHead>{t("admin.table.columns.status")}</TableHead>
              <TableHead className="text-right">
                {t("admin.table.columns.actions")}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="py-20 text-center text-muted-foreground"
                >
                  <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                </TableCell>
              </TableRow>
            ) : staffs.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="py-20 text-center text-muted-foreground"
                >
                  <div className="flex flex-col items-center gap-3">
                    <LayoutGrid className="h-10 w-10 opacity-30" />
                    <p className="text-sm">{t("admin.staffsPage.empty")}</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              staffs.map((staff, index) => (
                <TableRow key={staff.id}>
                  <TableCell className="text-center text-muted-foreground text-xs">
                    {index + 1}
                  </TableCell>
                  <TableCell className="font-medium">
                    {staff.users.full_name}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {staff.email}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {staff.stores?.name ?? "-"}
                  </TableCell>
                  <TableCell>
                    {staff.deleted_at ? (
                      <Badge variant="destructive">
                        {t("admin.staffsPage.status.disabled")}
                      </Badge>
                    ) : (
                      <Badge variant={staff.is_active ? "success" : "warning"}>
                        {staff.is_active
                          ? t("admin.staffsPage.status.active")
                          : t("admin.staffsPage.status.inactive")}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-2">
                      {staff.deleted_at ? (
                        <>
                          <Button
                            onClick={() => restoreStaff(staff.id)}
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-emerald-600 hover:text-emerald-600 hover:bg-emerald-500/10"
                          >
                            <RotateCcw className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            onClick={() => deleteStaff(staff.id)}
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <UpdateStaffModal
                            staffId={staff.id}
                            defaultValues={{
                              fullname: staff.users.full_name ?? "",
                              email: staff.email ?? "",
                              dob: staff.dob ?? "",
                              gender: staff.gender ?? "other",
                              store_id: staff.store_id ?? "",
                            }}
                            onUpdated={() => {
                              fetchStaffs(appliedFilter, page);
                            }}
                          />
                          <Button
                            onClick={() => disableStaff(staff.id)}
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <Ban className="h-3.5 w-3.5" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        <div className="flex items-center justify-between border-t px-6 py-3">
          <p className="text-xs text-muted-foreground">
            {t("admin.staffsPage.showing")}{" "}
            <span className="font-medium text-foreground">
              {staffs.length}
            </span>{" "}
            {t("admin.table.pagination.of")}{" "}
            <span className="font-medium text-foreground">
              {pagination?.total_items ?? staffs.length}
            </span>{" "}
            {t("admin.staffsPage.staff")}
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
