// src/hooks/useAnnotations.ts
import { useState, useCallback } from 'react';
import { SafeAnnotation, Annotation, AnnotationType } from '@/types/global';
import { useToast } from './useToast';

interface UseAnnotationsOptions {
  onAnnotationChange?: (annotations: SafeAnnotation[]) => void;
}

export function useAnnotations(
  imageId: number,
  initialAnnotations: SafeAnnotation[] = [],
  options: UseAnnotationsOptions = {}
) {
  const [annotations, setAnnotations] = useState<SafeAnnotation[]>(initialAnnotations);
  const [loading, setLoading] = useState(false);
  const { error: toastError } = useToast();

  const createAnnotation = useCallback(async (data: Partial<Annotation>) => {
    try {
      setLoading(true);
      const response = await fetch('/api/annotations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, imageId })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create annotation');
      }

      const newAnnotation = await response.json();
      const updatedAnnotations = [...annotations, newAnnotation];
      setAnnotations(updatedAnnotations);
      options.onAnnotationChange?.(updatedAnnotations);
      
      return newAnnotation;
    } catch (error) {
      const err = error as Error;
      toastError({
        title: 'Error',
        message: err.message
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }, [imageId, annotations, toastError]);

  const updateAnnotation = useCallback(async (
    id: number,
    updates: Partial<Annotation>
  ) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/annotations/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update annotation');
      }

      const updatedAnnotation = await response.json();
      const updatedAnnotations = annotations.map(ann => 
        ann.id === id ? updatedAnnotation : ann
      );
      setAnnotations(updatedAnnotations);
      options.onAnnotationChange?.(updatedAnnotations);

      return updatedAnnotation;
    } catch (error) {
      const err = error as Error;
      toastError({
        title: 'Error',
        message: err.message
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }, [annotations, toastError]);

  const deleteAnnotation = useCallback(async (id: number) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/annotations/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete annotation');
      }

      const updatedAnnotations = annotations.filter(ann => ann.id !== id);
      setAnnotations(updatedAnnotations);
      options.onAnnotationChange?.(updatedAnnotations);
    } catch (error) {
      const err = error as Error;
      toastError({
        title: 'Error',
        message: err.message
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }, [annotations, toastError]);

  return {
    annotations,
    loading,
    createAnnotation,
    updateAnnotation,
    deleteAnnotation,
  };
}