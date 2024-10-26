// src/hooks/useSearch.ts
import { useState, useEffect, useMemo } from 'react';
import { useDebounce } from './useDebounce';

interface UseSearchOptions {
  debounceMs?: number;
  minSearchLength?: number;
}

export function useSearch<T>(
  items: T[],
  searchFields: (keyof T)[],
  options: UseSearchOptions = {}
) {
  const {
    debounceMs = 300,
    minSearchLength = 2
  } = options;

  const [searchTerm, setSearchTerm] = useState('');
  const debouncedTerm = useDebounce(searchTerm, debounceMs);

  const results = useMemo(() => {
    if (!debouncedTerm || debouncedTerm.length < minSearchLength) {
      return items;
    }

    return items.filter(item =>
      searchFields.some(field => {
        const value = item[field];
        return String(value)
          .toLowerCase()
          .includes(debouncedTerm.toLowerCase());
      })
    );
  }, [debouncedTerm, items, searchFields, minSearchLength]);

  return {
    searchTerm,
    setSearchTerm,
    results,
    isSearching: debouncedTerm !== searchTerm,
  };
}
