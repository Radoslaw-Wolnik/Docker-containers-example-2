// src/hooks/useApi.ts
import { useState, useCallback } from 'react';
import { useConfig } from './useConfig';
import { handleError } from '../utils/error';

interface UseApiOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
}

export function useApi<T = unknown>(endpoint: string, options: UseApiOptions<T> = {}) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { apiUrl } = useConfig();

  const execute = useCallback(
    async (config: RequestInit = {}) => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(`${apiUrl}${endpoint}`, {
          ...config,
          headers: {
            'Content-Type': 'application/json',
            ...config.headers,
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        setData(result);
        options.onSuccess?.(result);
        return result;
      } catch (err) {
        const error = handleError(err);
        setError(new Error(error.message));
        options.onError?.(new Error(error.message));
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [apiUrl, endpoint, options]
  );

  const get = useCallback(() => execute({ method: 'GET' }), [execute]);
  
  const post = useCallback((data: unknown) => 
    execute({ method: 'POST', body: JSON.stringify(data) }), [execute]);
  
  const put = useCallback((data: unknown) => 
    execute({ method: 'PUT', body: JSON.stringify(data) }), [execute]);
  
  const del = useCallback(() => 
    execute({ method: 'DELETE' }), [execute]);

  return {
    data,
    error,
    isLoading,
    get,
    post,
    put,
    delete: del,
  };
}