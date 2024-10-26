// src/hooks/usePagination.ts
import { useState, useCallback, useMemo } from 'react';
import { PaginationParams } from '@/types/global';

interface UsePaginationProps<T> {
  items: T[];
  initialPage?: number;
  initialLimit?: number;
}

export function usePagination<T>({
  items,
  initialPage = 1,
  initialLimit = 10
}: UsePaginationProps<T>) {
  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);

  const totalPages = Math.ceil(items.length / limit);
  
  const currentItems = useMemo(() => {
    const start = (page - 1) * limit;
    return items.slice(start, start + limit);
  }, [items, page, limit]);

  const goToPage = useCallback((newPage: number) => {
    setPage(Math.min(Math.max(1, newPage), totalPages));
  }, [totalPages]);

  const setItemsPerPage = useCallback((newLimit: number) => {
    setLimit(newLimit);
    setPage(1); // Reset to first page when changing items per page
  }, []);

  return {
    currentItems,
    page,
    limit,
    totalPages,
    goToPage,
    setItemsPerPage,
  };
}