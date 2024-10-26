export function useSorting<T>(
    items: T[],
    initialField: keyof T,
    initialDirection: 'asc' | 'desc' = 'asc'
  ) {
    const [sortField, setSortField] = useState<keyof T>(initialField);
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>(initialDirection);
  
    const sortedItems = useMemo(() => {
      return [...items].sort((a, b) => {
        if (a[sortField] < b[sortField]) return sortDirection === 'asc' ? -1 : 1;
        if (a[sortField] > b[sortField]) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }, [items, sortField, sortDirection]);
  
    const setSorting = useCallback((field: keyof T, direction: 'asc' | 'desc') => {
      setSortField(field);
      setSortDirection(direction);
    }, []);
  
    return {
      sortedItems,
      sortField,
      sortDirection,
      setSorting,
    };
  }