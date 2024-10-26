import { useState, useEffect, useCallback } from 'react';
import { Annotation, AnnotationCreateInput } from '@/types/global';
import { useToast } from '@/components/ui/toast';

interface UseImageAnnotationProps {
  imageId: number;
  initialAnnotations?: Annotation[];
}

export function useImageAnnotation({ imageId, initialAnnotations = [] }: UseImageAnnotationProps) {
  const [annotations, setAnnotations] = useState<Annotation[]>(initialAnnotations);
  const [loading, setLoading] = useState(false);
  const [selectedAnnotation, setSelectedAnnotation] = useState<Annotation | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (initialAnnotations.length === 0) {
      fetchAnnotations();
    }
  }, [imageId]);

  const fetchAnnotations = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/annotations?imageId=${imageId}`);
      const data = await response.json();
      
      if (data.error) throw new Error(data.error);
      setAnnotations(data.data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load annotations',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const createAnnotation = async (input: AnnotationCreateInput) => {
    try {
      const response = await fetch('/api/annotations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      
      setAnnotations([...annotations, data.data]);
      toast({
        title: 'Success',
        description: 'Annotation created successfully',
      });
      
      return data.data;
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create annotation',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const updateAnnotation = async (id: number, updates: Partial<Annotation>) => {
    try {
      const response = await fetch(`/api/annotations/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      
      setAnnotations(annotations.map(ann => 
        ann.id === id ? { ...ann, ...data.data } : ann
      ));
      
      if (selectedAnnotation?.id === id) {
        setSelectedAnnotation({ ...selectedAnnotation, ...data.data });
      }
      
      toast({
        title: 'Success',
        description: 'Annotation updated successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update annotation',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const deleteAnnotation = async (id: number) => {
    try {
      const response = await fetch(`/api/annotations/${id}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      
      setAnnotations(annotations.filter(ann => ann.id !== id));
      if (selectedAnnotation?.id === id) {
        setSelectedAnnotation(null);
      }
      
      toast({
        title: 'Success',
        description: 'Annotation deleted successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete annotation',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const toggleAnnotationVisibility = useCallback(async (id: number) => {
    const annotation = annotations.find(ann => ann.id === id);
    if (!annotation) return;

    await updateAnnotation(id, { isHidden: !annotation.isHidden });
  }, [annotations]);

  return {
    annotations,
    loading,
    selectedAnnotation,
    setSelectedAnnotation,
    createAnnotation,
    updateAnnotation,
    deleteAnnotation,
    toggleAnnotationVisibility,
  };
}