// src/hooks/useImageDimensions.ts
import { useState, useEffect } from 'react';

interface ImageDimensions {
  width: number;
  height: number;
  aspectRatio: number;
}

export function useImageDimensions(src: string): {
  dimensions: ImageDimensions | null;
  loading: boolean;
  error: Error | null;
} {
  const [dimensions, setDimensions] = useState<ImageDimensions | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const img = new Image();

    const calculateDimensions = () => {
      setDimensions({
        width: img.naturalWidth,
        height: img.naturalHeight,
        aspectRatio: img.naturalWidth / img.naturalHeight
      });
      setLoading(false);
    };

    img.onload = calculateDimensions;
    img.onerror = (e) => {
      setError(new Error('Failed to load image'));
      setLoading(false);
    };

    img.src = src;

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src]);

  return { dimensions, loading, error };
}
