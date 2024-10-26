// src/components/image/ImageGrid.tsx
import { useState } from 'react';
import { useRouter } from 'next/router';
import { ExtendedImage, SafeUser } from '@/types/global';
import { useInfiniteScroll } from '@/hooks/useInfinteScroll';
import { useImages } from '@/hooks/useImage';
import { ImageCard } from './ImageCard';
import { Button } from '../ui/button';
import { Loader2 } from 'lucide-react';

interface ImageGridProps {
  initialImages?: ExtendedImage[];
  userId?: number;
  tag?: string;
  showLoadMore?: boolean;
  columns?: number;
  gap?: number;
  onImageClick?: (image: ExtendedImage) => void;
}

export function ImageGrid({
  initialImages = [],
  userId,
  tag,
  showLoadMore = true,
  columns = 3,
  gap = 6,
  onImageClick
}: ImageGridProps) {
  const router = useRouter();
  const { images, loading, hasMore, loadMore } = useImages({
    initialImages,
    userId,
    tag
  });

  const infiniteScrollRef = useInfiniteScroll<HTMLDivElement>({
    onIntersect: loadMore,
    enabled: showLoadMore && hasMore && !loading
  });

  return (
    <div className="space-y-6">
      <div
        className={`grid gap-${gap}`}
        style={{
          gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`
        }}
      >
        {images.map((image) => (
          <ImageCard
            key={image.id}
            image={image}
            onClick={() => {
              if (onImageClick) {
                onImageClick(image);
              } else {
                router.push(`/images/${image.id}`);
              }
            }}
          />
        ))}
      </div>

      {loading && (
        <div className="flex justify-center py-8">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      )}

      {showLoadMore && hasMore && !loading && (
        <div ref={infiniteScrollRef} className="flex justify-center py-8">
          <Button
            variant="secondary"
            onClick={loadMore}
          >
            Load More
          </Button>
        </div>
      )}

      {!loading && images.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No images found</p>
        </div>
      )}
    </div>
  );
}