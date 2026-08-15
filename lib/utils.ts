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
    status: params.get("status"),
    is_daily_bake: params.get("is_daily_bake"),
    category_id: params.get("category_id"),
    store_id: params.get("store_id"),
    city: params.get("city"),
    district: params.get("district"),
    type: params.get("type"),
    sort_by: params.get("sort_by") ?? "created_at",
    order: params.get("order") ?? "desc",
    locale: params.get("locale") ?? "vi",
    page: params.get("page") ?? "1",
    limit: params.get("limit") ?? "10",
    search: params.get("search")?.trim() ?? "",
    date: params.get("date") ?? "",
  };
}
export function generateOrderCode() {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);

  return Number(`${timestamp}${random.toString().padStart(3, "0")}`);
}

export function formatDateTime(date: Date | string) {
  const d = new Date(date);

  const datePart = new Intl.DateTimeFormat("vi-VN", {
    timeZone: "Asia/Ho_Chi_Minh",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(d);

  const timePart = new Intl.DateTimeFormat("vi-VN", {
    timeZone: "Asia/Ho_Chi_Minh",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(d);

  return {
    full: `${datePart} ${timePart}`,
    date: datePart,
    time: timePart,
  };
}

export const getToday = () => {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Ho_Chi_Minh",
  }).format(new Date());
};
