import React, { useState, useEffect } from 'react';
import { Image } from '@/types/global';
import { Loader2, Trash2, Eye, AlertTriangle } from 'lucide-react';
import { useToast } from '@/components/ui/toast';

interface ImageManagementProps {
  onImageDelete: (imageId: number) => Promise<void>;
}

export default function ImageManagement({ onImageDelete }: ImageManagementProps) {
  const [images, setImages] = useState<Image[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<Image | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      const response = await fetch('/api/admin/images');
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      setImages(data.data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load images',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (imageId: number) => {
    if (!confirm('Are you sure you want to delete this image? This action cannot be undone.')) {
      return;
    }

    try {
      await onImageDelete(imageId);
      setImages(images.filter(img => img.id !== imageId));
      toast({
        title: 'Success',
        description: 'Image deleted successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete image',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Image Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {images.map((image) => (
          <div
            key={image.id}
            className="bg-white rounded-lg shadow-sm overflow-hidden"
          >
            <div className="aspect-video relative">
              <img
                src={image.filePath}
                alt={image.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 transition-opacity" />
            </div>

            <div className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">
                    {image.name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    by {image.uploadedBy?.username}
                  </p>
                </div>

                <div className="flex space-x-2">
                  {image.annotations && image.annotations.length > 0 && (
                    <div className="px-2 py-1 bg-blue-50 text-blue-600 rounded-md text-xs">
                      {image.annotations.length} annotations
                    </div>
                  )}
                  {!image.isPublic && (
                    <div className="px-2 py-1 bg-yellow-50 text-yellow-600 rounded-md text-xs flex items-center">
                      <AlertTriangle className="w-3 h-3 mr-1" />
                      Private
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 flex justify-end space-x-2">
                <button
                  onClick={() => window.open(`/images/${image.id}`, '_blank')}
                  className="p-2 text-gray-400 hover:text-gray-500"
                >
                  <Eye className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleDelete(image.id)}
                  className="p-2 text-red-400 hover:text-red-500"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {images.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">No images found</p>
        </div>
      )}
    </div>
  );
}