// src/hooks/useImageUpload.ts
import { useState, useCallback } from 'react';
import { ImageUploadResponse, UploadProgress } from '@/types/global';
import { ErrorResponse } from '@/types/api';

export function useImageUpload() {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<UploadProgress>({
    progress: 0,
    status: 'idle'
  });

  const upload = useCallback(async (file: File): Promise<ImageUploadResponse> => {
    setUploading(true);
    setProgress({ progress: 0, status: 'uploading' });

    const formData = new FormData();
    formData.append('image', file);

    try {
      return await new Promise<ImageUploadResponse>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const percentComplete = (event.loaded / event.total) * 100;
            setProgress({
              progress: Math.round(percentComplete),
              status: 'uploading'
            });
          }
        });

        xhr.onload = () => {
          try {
            const response = JSON.parse(xhr.response);
            if (xhr.status >= 200 && xhr.status < 300 && !('error' in response)) {
              resolve(response.data);
            } else {
              reject(new Error(response.error || 'Upload failed'));
            }
          } catch (e) {
            reject(new Error('Invalid response format'));
          }
        };

        xhr.onerror = () => reject(new Error('Network error'));
        
        xhr.open('POST', '/api/images/upload');
        xhr.send(formData);
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      setProgress({
        progress: 0,
        status: 'error',
        error: errorMessage
      });
      throw error;
    } finally {
      setUploading(false);
    }
  }, []);

  return { upload, uploading, progress };
}