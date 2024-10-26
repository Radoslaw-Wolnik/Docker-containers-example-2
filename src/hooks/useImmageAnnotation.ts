//src/hooks/useImageAnnotation.ts
import { useState, useCallback } from 'react';
import { Annotation, AnnotationCreateInput, AnnotationUpdateInput, AppError } from '@/types/global';
import { useToast } from '@/hooks/useToast';
import { ErrorResponse, AnnotationResponse, AnnotationsResponse, ApiResponse } from '@/types/api';


interface UseImageAnnotationProps {
  imageId: number;
  initialAnnotations?: Annotation[];
}

export function useImageAnnotation({
  imageId,
  initialAnnotations = []
}: UseImageAnnotationProps) {
  const [annotations, setAnnotations] = useState<Annotation[]>(initialAnnotations);
  const [loading, setLoading] = useState(false);
  const [selectedAnnotation, setSelectedAnnotation] = useState<Annotation | null>(null);
  const { success: toastSuccess, error: toastError } = useToast();

  const handleError = (error: unknown) => {
    const errorMessage = error instanceof Error ? error.message : 
      typeof error === 'string' ? error : 'An unexpected error occurred';
    
    toastError({
      title: 'Error',
      message: errorMessage
    });
  };

  const fetchAnnotations = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/annotations?imageId=${imageId}`);
      const data = await response.json() as AnnotationsResponse | ErrorResponse;
      
      if (!response.ok || 'error' in data) {
        throw new Error('error' in data ? data.error : 'Failed to fetch annotations');
      }

      setAnnotations(data.data);
    } catch (error) {
      throw handleError(error);
    } finally {
      setLoading(false);
    }
  }, [imageId, toastError]);

  const createAnnotation = useCallback(async (input: AnnotationCreateInput) => {
    try {
      const response = await fetch('/api/annotations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...input, imageId }),
      });
      
      const data = await response.json() as AnnotationResponse | ErrorResponse;
      
      if (!response.ok || 'error' in data) {
        throw new Error('error' in data ? data.error : 'Failed to create annotation');
      }
      
      const newAnnotation = data.data;
      setAnnotations(prev => [...prev, newAnnotation]);
      
      toastSuccess({
        title: 'Success',
        message: 'Annotation created successfully'
      });
      
      return newAnnotation;
    } catch (error) {
      throw handleError(error);
    }
  }, [imageId, toastSuccess]);

  const updateAnnotation = useCallback(async (annotationId: number, updates: AnnotationUpdateInput) => {
    try {
      const response = await fetch(`/api/annotations/${annotationId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      
      const data = await response.json() as AnnotationResponse | ErrorResponse;
      
      if (!response.ok || 'error' in data) {
        throw new Error('error' in data ? data.error : 'Failed to update annotation');
      }
      
      const updatedAnnotation = data.data;
      setAnnotations(prev => 
        prev.map(ann => ann.id === annotationId ? updatedAnnotation : ann)
      );
      
      if (selectedAnnotation?.id === annotationId) {
        setSelectedAnnotation(updatedAnnotation);
      }
      
      toastSuccess({
        title: 'Success',
        message: 'Annotation updated successfully'
      });

      return updatedAnnotation;
    } catch (error) {
      throw handleError(error);
    }
  }, [selectedAnnotation, toastSuccess]);

  const deleteAnnotation = useCallback(async (annotationId: number) => {
    try {
      const response = await fetch(`/api/annotations/${annotationId}`, {
        method: 'DELETE',
      });
      
      const data = await response.json() as ApiResponse<void> | ErrorResponse;
      
      if (!response.ok || 'error' in data) {
        throw new Error('error' in data ? data.error : 'Failed to delete annotation');
      }
      
      setAnnotations(prev => prev.filter(ann => ann.id !== annotationId));
      
      if (selectedAnnotation?.id === annotationId) {
        setSelectedAnnotation(null);
      }
      
      toastSuccess({
        title: 'Success',
        message: 'Annotation deleted successfully'
      });
    } catch (error) {
      throw handleError(error);
    }
  }, [selectedAnnotation, toastSuccess]);
  
  const toggleAnnotationVisibility = useCallback(async (annotationId: number) => {
    const annotation = annotations.find(ann => ann.id === annotationId);
    if (!annotation) return;

    try {
      await updateAnnotation(annotationId, { 
        isHidden: !annotation.isHidden 
      });
    } catch (error) {
      handleError(error);
    }
  }, [annotations, updateAnnotation]);

  return {
    annotations,
    loading,
    selectedAnnotation,
    setSelectedAnnotation,
    fetchAnnotations,
    createAnnotation,
    updateAnnotation,
    deleteAnnotation,
    toggleAnnotationVisibility,
  };
}