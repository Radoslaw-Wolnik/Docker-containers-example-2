import React from 'react';
import Link from 'next/link';
import { ExtendedImage, SafeUser } from '@/types/global';
import { formatDate } from '@/utils/dateUtil';
import { Edit, Trash2, Eye, Lock, Globe } from 'lucide-react';
import { usePermissions } from '@/hooks/usePermissions';

interface ImageGridProps {
  images: ExtendedImage[];
  currentUser?: SafeUser | null;
  onDelete?: (imageId: number) => Promise<void>;
}

export default function ImageGrid({ images, currentUser, onDelete }: ImageGridProps) {
  const { can } = usePermissions();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {images.map((image) => (
        <div
          key={image.id}
          className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
        >
          <div className="relative aspect-video">
            <img
              src={image.filePath}
              alt={image.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-2 right-2">
              {image.isPublic ? (
                <Globe className="w-5 h-5 text-white drop-shadow-md" />
              ) : (
                <Lock className="w-5 h-5 text-white drop-shadow-md" />
              )}
            </div>
          </div>

          <div className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-medium text-lg">{image.name}</h3>
                <p className="text-sm text-gray-500">
                  By {image.uploadedBy?.username || 'Unknown'}
                </p>
                <p className="text-xs text-gray-400">
                  {formatDate(image.createdAt)}
                </p>
              </div>
              <div className="flex gap-2">
                <Link
                  href={`/images/${image.id}`}
                  className="p-2 text-blue-500 hover:bg-blue-50 rounded-full"
                >
                  <Eye className="w-5 h-5" />
                </Link>
                {can('update:image', image) && (
                  <Link
                    href={`/images/${image.id}/edit`}
                    className="p-2 text-green-500 hover:bg-green-50 rounded-full"
                  >
                    <Edit className="w-5 h-5" />
                  </Link>
                )}
                {can('delete:image', image) && (
                  <button
                    onClick={() => onDelete?.(image.id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-full"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>

            {image.description && (
              <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                {image.description}
              </p>
            )}

            <div className="mt-3 flex items-center justify-between text-sm text-gray-500">
              <span>{image._count?.annotations || 0} annotations</span>
              {!image.isPublic && (
                <span className="flex items-center">
                  <Lock className="w-4 h-4 mr-1" />
                  Private
                </span>
              )}
            </div>
          </div>
        </div>
      ))}

      {images.length === 0 && (
        <div className="col-span-full text-center py-12">
          <p className="text-gray-500">No images found</p>
        </div>
      )}
    </div>
  );
}