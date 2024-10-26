// src/hooks/useImageUpload.ts
import { useState, useCallback } from 'react';
import { useToast } from './useToast';
import { FileProcessingOptions,  } from '@/types/file';
import { ImageUploadResponse } from '@/types/global';

interface UseImageUploadOptions {
  onSuccess?: (response: ImageUploadResponse) => void;
  onError?: (error: Error) => void;
  onProgress?: (progress: number) => void;
}

export function useImageUpload(options: UseImageUploadOptions = {}) {
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const { error: toastError, success: toastSuccess} = useToast();

  const upload = useCallback(async (
    file: File,
    processingOptions?: FileProcessingOptions
  ) => {
    try {
      setLoading(true);
      setProgress(0);

      const formData = new FormData();
      formData.append('file', file);
      if (processingOptions) {
        formData.append('options', JSON.stringify(processingOptions));
      }

      const xhr = new XMLHttpRequest();
      
      const uploadPromise = new Promise<ImageUploadResponse>((resolve, reject) => {
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const progressValue = (event.loaded / event.total) * 100;
            setProgress(progressValue);
            options.onProgress?.(progressValue);
          }
        });

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            const response = JSON.parse(xhr.responseText);
            resolve(response);
          } else {
            reject(new Error('Upload failed'));
          }
        };

        xhr.onerror = () => reject(new Error('Network error'));
      });

      xhr.open('POST', '/api/images/upload');
      xhr.send(formData);

      const response = await uploadPromise;
      options.onSuccess?.(response);
      
      toastSuccess({
        title: 'Success',
        message: 'Image uploaded successfully'
      });

      return response;
    } catch (error) {
      const err = error as Error;
      options.onError?.(err);
      toastError({
        title: 'Error',
        message: err.message || "error during upload"
      });
      throw error;
    } finally {
      setLoading(false);
      setProgress(0);
    }
  }, [options, toastError, toastSuccess]);

  return {
    upload,
    progress,
    loading
  };
}