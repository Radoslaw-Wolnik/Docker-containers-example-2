'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Image as ImageType, Annotation } from '@/types/global';
import ImageAnnotator from '@/components/ImageAnnotator';
import { Loader2, Save, ArrowLeft } from 'lucide-react';
import ImageMetadataEditor from '@/components/images/ImageMetadataEditor';
import AnnotationList from '@/components/annotations/AnnotationList';
import { useToast } from '@/components/ui/toast';

export default function ImageEditorPage() {
  const { id } = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const { toast } = useToast();
  
  const [image, setImage] = useState<ImageType | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchImage();
  }, [id]);

  const fetchImage = async () => {
    try {
      const response = await fetch(`/api/images/${id}`);
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      setImage(data.data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load image',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAnnotationCreate = async (annotation: Partial<Annotation>) => {
    try {
      const response = await fetch('/api/annotations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...annotation, imageId: id }),
      });
      
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      
      setImage(prev => prev && {
        ...prev,
        annotations: [...(prev.annotations || []), data.data],
      });

      toast({
        title: 'Success',
        description: 'Annotation created successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create annotation',
        variant: 'destructive',
      });
    }
  };

  const handleAnnotationUpdate = async (annotationId: number, updates: Partial<Annotation>) => {
    try {
      const response = await fetch(`/api/annotations?id=${annotationId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      
      setImage(prev => prev && {
        ...prev,
        annotations: prev.annotations?.map(ann => 
          ann.id === annotationId ? { ...ann, ...data.data } : ann
        ),
      });

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
    }
  };

  const handleAnnotationDelete = async (annotationId: number) => {
    try {
      const response = await fetch(`/api/annotations?id=${annotationId}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      
      setImage(prev => prev && {
        ...prev,
        annotations: prev.annotations?.filter(ann => ann.id !== annotationId),
      });

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
    }
  };

  const handleMetadataUpdate = async (updates: Partial<ImageType>) => {
    try {
      setSaving(true);
      const response = await fetch(`/api/images/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      
      setImage(prev => prev && { ...prev, ...data.data });
      toast({
        title: 'Success',
        description: 'Image details updated successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update image details',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!image) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-500">Image not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </button>
          
          <div className="flex items-center gap-4">
            {saving && <Loader2 className="w-5 h-5 animate-spin" />}
            <button
              onClick={() => router.push(`/images/${id}`)}
              className="px-4 py-2 text-gray-600 hover:text-gray-900"
            >
              View
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <ImageAnnotator
                imageUrl={image.filePath}
                imageId={image.id}
                annotations={image.annotations || []}
                onAnnotationCreate={handleAnnotationCreate}
                onAnnotationUpdate={handleAnnotationUpdate}
                onAnnotationDelete={handleAnnotationDelete}
              />
            </div>
          </div>

          <div className="space-y-6">
            <ImageMetadataEditor
              image={image}
              onUpdate={handleMetadataUpdate}
              isLoading={saving}
            />

            <AnnotationList
              annotations={image.annotations || []}
              onUpdate={handleAnnotationUpdate}
              onDelete={handleAnnotationDelete}
              currentUser={session?.user}
            />
          </div>
        </div>
      </div>
    </div>
  );
}