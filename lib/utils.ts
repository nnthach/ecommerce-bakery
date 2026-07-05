import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { NextRequest } from "next/server";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatToSlug(text: string): string {
  return text
    .normalize("NFD") // Tách ký tự và dấu
    .replace(/[\u0300-\u036f]/g, "") // xóa dấu
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-") // Khoảng trắng -> -
    .replace(/[^\w-]+/g, "") // Xóa ký tự đặc biệt
    .replace(/--+/g, "-"); // Gộp nhiều dấu - thành 1
}

export function getSearchParams(req: NextRequest) {
  const params = req.nextUrl.searchParams;

  return {
    is_active: params.get("is_active"),
    category_id: params.get("category_id"),
    store_id: params.get("store_id"),
    city: params.get("city"),
    district: params.get("district"),
    sort_by: params.get("sort_by") ?? "created_at",
    order: params.get("order") ?? "desc",
    locale: params.get("locale") ?? "vi",
    page: params.get("page") ?? "1",
    limit: params.get("limit") ?? "10",
    search: params.get("search")?.trim() ?? "",
  };
}
