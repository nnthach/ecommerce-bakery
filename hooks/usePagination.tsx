"use client";

import { useState } from "react";

interface Pagination {
  page: number;
  limit: number;
  total_items: number;
  total_pages: number;
}

export function usePagination(initialPage = 1) {
  const [page, setPage] = useState(initialPage);
  const [pagination, setPagination] = useState<Pagination | null>(null);

  const resetPage = () => setPage(1);

  return { page, setPage, pagination, setPagination, resetPage };
}
