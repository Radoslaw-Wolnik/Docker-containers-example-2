// src/hooks/useApi.ts
import { useState, useCallback } from 'react';
import { useConfig } from './useConfig';
import { ApiResponse, ApiErrorResponse } from '@/types/global';
import { AppError } from '@/lib/errors';

interface UseApiOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: AppError) => void;
}

export function useApi<T = unknown>(endpoint: string, options: UseApiOptions<T> = {}) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<AppError | null>(null);
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

        const result = await response.json() as ApiResponse<T>;

        if (!response.ok) {
          throw new AppError(result.error || 'Request failed', response.status);
        }

        if (result.data) {
          setData(result.data);
          options.onSuccess?.(result.data);
        }
        return result.data;
      } catch (err) {
        const error = err instanceof AppError ? err : new AppError('An error occurred', 500);
        setError(error);
        options.onError?.(error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [apiUrl, endpoint, options]
  );

  const get = useCallback(() => execute({ method: 'GET' }), [execute]);
  
  const post = useCallback(<TData = unknown>(data: TData) => 
    execute({ 
      method: 'POST', 
      body: JSON.stringify(data) 
    }), [execute]);
  
  const put = useCallback(<TData = unknown>(data: TData) => 
    execute({ 
      method: 'PUT', 
      body: JSON.stringify(data) 
    }), [execute]);
  
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