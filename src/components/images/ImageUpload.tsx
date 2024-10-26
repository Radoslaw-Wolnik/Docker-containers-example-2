// src/components/images/ImageUpload.tsx
import React, { useState, useCallback, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/useToast';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';

interface ImageUploadResponse {
  url: string;
  id: number;
}

interface ImageUploadProps {
  onUploadComplete: (response: ImageUploadResponse) => void;
  maxSize?: number; // in MB
  allowedTypes?: string[];
  maxWidth?: number;
  maxHeight?: number;
  generateThumbnail?: boolean;
  children?: React.ReactNode;
  className?: string;
}

export function ImageUpload({
  onUploadComplete,
  maxSize = 5,
  allowedTypes = ['image/jpeg', 'image/png', 'image/webp'],
  maxWidth = 1920,
  maxHeight = 1080,
  generateThumbnail = true,
  children,
  className = ''
}: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const { success: toastSuccess, error: toastError, warning : toastWarning } = useToast();
  const abortControllerRef = useRef<AbortController | null>(null);

  const uploadFile = useCallback(async (file: File): Promise<ImageUploadResponse> => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      const formData = new FormData();
      formData.append('file', file);
      formData.append('options', JSON.stringify({
        maxWidth,
        maxHeight,
        generateThumbnail
      }));

      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const progress = (event.loaded / event.total) * 100;
          setUploadProgress(Math.round(progress));
        }
      });

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText);
            resolve(response);
          } catch {
            reject(new Error('Invalid response format'));
          }
        } else {
          reject(new Error(`Upload failed: ${xhr.status}`));
        }
      };

      xhr.onerror = () => reject(new Error('Network error'));
      xhr.onabort = () => reject(new Error('Upload cancelled'));

      xhr.open('POST', '/api/images/upload');
      xhr.send(formData);

      // Store abort controller reference
      abortControllerRef.current = {
        abort: () => xhr.abort()
      } as AbortController;
    });
  }, [maxWidth, maxHeight, generateThumbnail]);

  const handleUpload = async (file: File) => {
    try {
      setIsUploading(true);
      setUploadProgress(0);

      // Create preview
      const previewUrl = URL.createObjectURL(file);
      setPreview(previewUrl);

      const response = await uploadFile(file);
      onUploadComplete(response);

      toastSuccess({
        title: 'Success',
        message: 'Image uploaded successfully'
      });
    } catch (error) {
      if (error instanceof Error && error.message === 'Upload cancelled') {
        toastWarning({
          title: 'Upload Cancelled',
          message: 'Image upload was cancelled'
        });
      } else {
        toastError({
          title: 'Error',
          message: 'Failed to upload image'
        });
      }
      throw error;
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      await handleUpload(file);
    }
  }, [handleUpload]);

  const { getRootProps, getInputProps, isDragActive, isDragAccept, isDragReject } = useDropzone({
    onDrop,
    accept: allowedTypes.reduce((acc, type) => ({ ...acc, [type]: [] }), {}),
    maxSize: maxSize * 1024 * 1024,
    multiple: false,
    disabled: isUploading
  });

  const cancelUpload = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  };

  if (children) {
    return (
      <div onClick={() => !isUploading && document.getElementById('file-upload')?.click()}>
        <input
          id="file-upload"
          type="file"
          className="hidden"
          accept={allowedTypes.join(',')}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleUpload(file);
          }}
          disabled={isUploading}
        />
        {children}
      </div>
    );
  }

  return (
    <div className={`w-full max-w-xl mx-auto ${className}`}>
      <div
        {...getRootProps()}
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center transition-colors
          ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}
          ${isDragAccept ? 'border-green-500 bg-green-50' : ''}
          ${isDragReject ? 'border-red-500 bg-red-50' : ''}
          ${isUploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-gray-400'}
        `}
      >
        <input {...getInputProps()} />

        {isUploading ? (
          <div className="space-y-4">
            <Loader2 className="w-10 h-10 text-blue-500 animate-spin mx-auto" />
            <div className="w-full max-w-xs mx-auto">
              <Progress value={uploadProgress} />
              <p className="mt-2 text-sm text-gray-500">
                Uploading... {uploadProgress}%
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  cancelUpload();
                }}
                className="mt-2"
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : preview ? (
          <div className="relative">
            <img
              src={preview}
              alt="Preview"
              className="max-h-64 mx-auto rounded"
            />
            <button
              onClick={(e) => {
                e.stopPropagation();
                setPreview(null);
              }}
              className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <Upload className="w-10 h-10 text-gray-400 mx-auto" />
            <div>
              <p className="text-base text-gray-700">
                Drag and drop an image, or click to select
              </p>
              <p className="mt-2 text-sm text-gray-500">
                Supported formats: {allowedTypes.map(t => t.split('/')[1]).join(', ')}
              </p>
              <p className="text-sm text-gray-500">
                Maximum size: {maxSize}MB
              </p>
              {(maxWidth || maxHeight) && (
                <p className="text-sm text-gray-500">
                  Maximum dimensions: {maxWidth}×{maxHeight}px
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}