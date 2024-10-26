// src/components/image/ImageCard.tsx
import { memo } from 'react';
import { ExtendedImage } from '@/types/global';
import { formatDate } from '@/utils/general.util';
import { 
  Eye, 
  MessageCircle, 
  Lock,
  Globe
} from 'lucide-react';


interface ImageCardProps {
  image: ExtendedImage;
  onClick?: () => void;
}

export const ImageCard = memo(function ImageCard({
  image,
  onClick
}: ImageCardProps) {
  return (
    <div
      onClick={onClick}
      className="group relative bg-white rounded-lg shadow-sm overflow-hidden cursor-pointer transition-transform hover:scale-[1.02]"
    >
      <div className="aspect-[4/3] relative">
        <img
          src={image.filePath}
          alt={image.name}
          className="absolute inset-0 w-full h-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-medium text-gray-900 line-clamp-1">
              {image.name}
            </h3>
            <p className="text-sm text-gray-500">
              by {image.uploadedBy?.username}
            </p>
          </div>
          <div className="flex items-center space-x-2 text-gray-500">
            {image.isPublic ? (
              <Globe className="w-4 h-4" />
            ) : (
              <Lock className="w-4 h-4" />
            )}
          </div>
        </div>

        {image.description && (
          <p className="mt-2 text-sm text-gray-600 line-clamp-2">
            {image.description}
          </p>
        )}

        <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center space-x-4">
            <span className="flex items-center">
              <Eye className="w-4 h-4 mr-1" />
              {image._count?.views || 0}
            </span>
            <span className="flex items-center">
              <MessageCircle className="w-4 h-4 mr-1" />
              {image._count?.annotations || 0}
            </span>
          </div>
          <time dateTime={image.createdAt} className="text-xs">
            {formatDate(image.createdAt)}
          </time>
        </div>
      </div>
    </div>
  );
});