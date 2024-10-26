// src/pages/images/[id].tsx
import { useState } from 'react';
import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import { ImageProvider } from '@/contexts/ImageContext';
import { useAuth } from '@/contexts/AuthContext';
import { ExtendedImage, SafeAnnotation } from '@/types/global';
import { AnnotationCanvas } from '@/components/annotation/AnnotationCanvas';
import { AnnotationList } from '@/components/annotation/AnnotationList';
import { Button } from '@/components/ui/button';
import { prisma } from '@/lib/prisma';
import { Share2, Download, Flag } from 'lucide-react';

interface ImagePageProps {
  image: ExtendedImage;
  initialAnnotations: SafeAnnotation[];
}

export default function ImagePage({ image, initialAnnotations }: ImagePageProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [showAnnotations, setShowAnnotations] = useState(true);

  const handleShare = async () => {
    try {
      await navigator.share({
        title: image.name,
        text: image.description,
        url: window.location.href,
      });
    } catch (error) {
      // Handle sharing error
    }
  };

  const handleDownload = async () => {
    const response = await fetch(image.filePath);
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = image.name;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  return (
    <ImageProvider>
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">{image.name}</h1>
            {image.description && (
              <p className="mt-2 text-gray-600">{image.description}</p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={handleShare}
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>

            <Button
              variant="outline"
              onClick={handleDownload}
            >
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>

            {user && user.id !== image.userId && (
              <Button
                variant="ghost"
                onClick={() => {/* Handle report */}}
              >
                <Flag className="w-4 h-4 mr-2" />
                Report
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <AnnotationCanvas
              imageUrl={image.filePath}
              className="rounded-lg shadow-lg"
            />
          </div>

          <div>
            <AnnotationList />
          </div>
        </div>
      </div>
    </ImageProvider>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const imageId = Number(params?.id);

  if (isNaN(imageId)) {
    return { notFound: true };
  }

  const image = await prisma.image.findUnique({
    where: { id: imageId },
    include: {
      uploadedBy: {
        select: {
          id: true,
          username: true,
          profilePicture: true,
        },
      },
      annotations: {
        include: {
          createdBy: {
            select: {
              id: true,
              username: true,
            },
          },
        },
      },
    },
  });

  if (!image) {
    return { notFound: true };
  }

  return {
    props: {
      image: JSON.parse(JSON.stringify(image)),
      initialAnnotations: image.annotations,
    },
  };
};