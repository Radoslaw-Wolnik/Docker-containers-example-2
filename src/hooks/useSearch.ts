export function useSearch<T>(
    items: T[],
    searchFields: (keyof T)[],
    debounceMs: number = 300
  ) {
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedTerm, setDebouncedTerm] = useState('');
    const [results, setResults] = useState<T[]>(items);
  
    useEffect(() => {
      const timer = setTimeout(() => setDebouncedTerm(searchTerm), debounceMs);
      return () => clearTimeout(timer);
    }, [searchTerm, debounceMs]);
  
    useEffect(() => {
      if (!debouncedTerm) {
        setResults(items);
        return;
      }
  
      const filteredItems = items.filter(item =>
        searchFields.some(field => {
          const value = item[field];
          return String(value)
            .toLowerCase()
            .includes(debouncedTerm.toLowerCase());
        })
      );
  
      setResults(filteredItems);
    }, [debouncedTerm, items, searchFields]);
  
    return {
      searchTerm,
      setSearchTerm,
      results,
    };
  }