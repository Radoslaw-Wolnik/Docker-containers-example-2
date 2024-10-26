import React, { useState, useCallback } from 'react';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { ApiResponse, ImageUploadResponse } from '@/types/global';

interface ImageUploadProps {
  onUploadComplete: (response: ImageUploadResponse) => void;
  maxSize?: number; // in MB
  allowedTypes?: string[];
}

export default function ImageUpload({
  onUploadComplete,
  maxSize = 5, // 5MB default
  allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
}: ImageUploadProps) {
  const { data: session } = useSession();
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFile = async (file: File) => {
    setError(null);

    // Validation
    if (!allowedTypes.includes(file.type)) {
      setError('Invalid file type. Please upload an image file.');
      return;
    }

    if (file.size > maxSize * 1024 * 1024) {
      setError(`File size must be less than ${maxSize}MB`);
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);

    // Upload file
    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('image', file);
      formData.append('name', file.name);

      const response = await fetch('/api/images/upload', {
        method: 'POST',
        body: formData,
      });

      const data: ApiResponse<ImageUploadResponse> = await response.json();

      if (!response.ok || data.error) {
        throw new Error(data.error || 'Upload failed');
      }

      if (data.data) {
        onUploadComplete(data.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const onDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFile(file);
    }
  }, []);

  const onDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  return (
    <div className="w-full max-w-xl mx-auto">
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragging
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
      >
        <input
          type="file"
          id="file-upload"
          className="hidden"
          accept={allowedTypes.join(',')}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
        />

        {isUploading ? (
          <div className="flex flex-col items-center">
            <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
            <p className="mt-2 text-sm text-gray-500">Uploading image...</p>
          </div>
        ) : preview ? (
          <div className="relative">
            <img
              src={preview}
              alt="Preview"
              className="max-h-64 mx-auto rounded"
            />
            <button
              onClick={() => setPreview(null)}
              className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <label htmlFor="file-upload" className="cursor-pointer">
            <div className="flex flex-col items-center">
              <Upload className="w-10 h-10 text-gray-400" />
              <p className="mt-2 text-sm text-gray-500">
                Drag and drop an image, or click to select
              </p>
              <p className="mt-1 text-xs text-gray-400">
                Supported formats: {allowedTypes.map(t => t.split('/')[1]).join(', ')}
              </p>
              <p className="text-xs text-gray-400">
                Max size: {maxSize}MB
              </p>
            </div>
          </label>
        )}

        {error && (
          <div className="mt-4 text-sm text-red-500">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}