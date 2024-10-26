// src/hooks/useImages.ts
import { useState, useCallback } from 'react';
import { ExtendedImage } from '@/types/global';
import { useToast } from './useToast';

interface UseImagesOptions {
  initialImages?: ExtendedImage[];
  userId?: number;
  tag?: string;
  pageSize?: number;
}

export function useImages({
  initialImages = [],
  userId,
  tag,
  pageSize = 12
}: UseImagesOptions) {
  const [images, setImages] = useState<ExtendedImage[]>(initialImages);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const { error: toastError } = useToast();

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;

    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: String(page + 1),
        limit: String(pageSize),
        ...(userId && { userId: String(userId) }),
        ...(tag && { tag })
      });

      const response = await fetch(`/api/images?${params}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      setImages(prev => [...prev, ...data.data]);
      setHasMore(data.meta.hasNextPage);
      setPage(prev => prev + 1);
    } catch (error) {
      toastError({
        title: 'Error',
        message: 'Failed to load images'
      });
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, userId, tag, loading, hasMore]);

  return {
    images,
    loading,
    hasMore,
    loadMore,
    setImages
  };
}
