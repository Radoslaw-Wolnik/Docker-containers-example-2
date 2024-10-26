'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Image as ImageType } from '@/types/global';
import ImageAnnotator from '@/components/ImageAnnotator';
import { useImageAnnotation } from '@/hooks/useImageAnnotation';
import { Loader2, ArrowLeft, Edit, Share, Download, Lock, Globe } from 'lucide-react';
import { useToast } from '@/components/ui/toast';
import { format } from 'date-fns';

export default function ImageDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const { toast } = useToast();
  
  const [image, setImage] = useState<ImageType | null>(null);
  const [loading, setLoading] = useState(true);
  const {
    annotations,
    selectedAnnotation,
    setSelectedAnnotation,
    createAnnotation,
    updateAnnotation,
    deleteAnnotation,
    toggleAnnotationVisibility,
  } = useImageAnnotation({
    imageId: parseInt(id as string),
  });

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

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast({
        title: 'Success',
        description: 'Link copied to clipboard',
        variant: 'success',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to copy link',
        variant: 'error',
      });
    }
  };

  const handleDownload = async () => {
    try {
      const response = await fetch(image!.filePath);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = image!.name;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to download image',
        variant: 'error',
      });
    }
  };

  const toggleVisibility = async () => {
    if (!image) return;

    try {
      const response = await fetch(`/api/images/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublic: !image.isPublic }),
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error);

      setImage({ ...image, isPublic: !image.isPublic });
      toast({
        title: 'Success',
        description: `Image is now ${image.isPublic ? 'private' : 'public'}`,
        variant: 'success',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update image visibility',
        variant: 'error',
      });
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
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-xl text-gray-600">Image not found</p>
        <button
          onClick={() => router.back()}
          className="mt-4 text-blue-500 hover:text-blue-600"
        >
          Go back
        </button>
      </div>
    );
  }

  const canEdit = session?.user.id === image.userId || session?.user.role === 'ADMIN';

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.back()}
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back
            </button>
            <h1 className="text-2xl font-bold text-gray-900">{image.name}</h1>
          </div>

          <div className="flex items-center space-x-4">
            {canEdit && (
              <button
                onClick={toggleVisibility}
                className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-900"
              >
                {image.isPublic ? (
                  <>
                    <Globe className="w-5 h-5 mr-2" />
                    Public
                  </>
                ) : (
                  <>
                    <Lock className="w-5 h-5 mr-2" />
                    Private
                  </>
                )}
              </button>
            )}
            <button
              onClick={handleShare}
              className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-900"
            >
              <Share className="w-5 h-5 mr-2" />
              Share
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-900"
            >
              <Download className="w-5 h-5 mr-2" />
              Download
            </button>
            {canEdit && (
              <button
                onClick={() => router.push(`/images/${id}/edit`)}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <Edit className="w-5 h-5 mr-2" />
                Edit
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <ImageAnnotator
              imageUrl={image.filePath}
              annotations={annotations}
              onAnnotationCreate={createAnnotation}
              onAnnotationUpdate={updateAnnotation}
              onAnnotationDelete={deleteAnnotation}
              onAnnotationSelect={setSelectedAnnotation}
              selectedAnnotation={selectedAnnotation}
              readOnly={!canEdit}
            />
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-medium mb-4">Image Details</h2>
              <dl className="space-y-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Uploaded by</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {image.uploadedBy?.username}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Upload date</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {format(new Date(image.createdAt), 'PPP')}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Visibility</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {image.isPublic ? 'Public' : 'Private'}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Description</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {image.description || 'No description provided'}
                  </dd>
                </div>
              </dl>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-medium mb-4">Annotations</h2>
              <div className="space-y-4">
                {annotations.map((annotation) => (
                  <div
                    key={annotation.id}
                    className={`p-4 rounded-lg border ${
                      annotation.isHidden ? 'bg-gray-50' : 'bg-white'
                    }`}
                  >
                    <h3 className="font-medium">{annotation.label}</h3>
                    {annotation.description && (
                      <p className="mt-1 text-sm text-gray-600">
                        {annotation.description}
                      </p>
                    )}
                    <p className="mt-2 text-xs text-gray-500">
                      By {annotation.createdBy?.username} • 
                      {format(new Date(annotation.createdAt), 'PP')}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}