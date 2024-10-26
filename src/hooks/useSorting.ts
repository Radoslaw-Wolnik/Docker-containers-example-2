// src/hooks/useSorting.ts
import { useState, useMemo, useCallback } from 'react';
import { SortableFields } from '@/types/api';

export function useSorting<T extends Record<string, any>>(
  items: T[],
  defaultField: keyof T & SortableFields,
  defaultDirection: 'asc' | 'desc' = 'asc'
) {
  const [sortConfig, setSortConfig] = useState({
    field: defaultField,
    direction: defaultDirection
  });

  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => {
      const aValue = a[sortConfig.field];
      const bValue = b[sortConfig.field];

      if (aValue === bValue) return 0;
      
      const comparison = aValue < bValue ? -1 : 1;
      return sortConfig.direction === 'asc' ? comparison : -comparison;
    });
  }, [items, sortConfig]);

  const setSorting = useCallback((field: keyof T & SortableFields, direction: 'asc' | 'desc') => {
    setSortConfig({ field, direction });
  }, []);

  return {
    sortedItems,
    sortConfig,
    setSorting,
  };
}