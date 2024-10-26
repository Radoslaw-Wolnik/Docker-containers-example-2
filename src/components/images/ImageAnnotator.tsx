// src/components/image/ImageAnnotator.tsx
import React, { useState, useRef, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { 
  Annotation, 
  AnnotationType, 
  SafeAnnotation, 
  ImageAnnotatorMode 
} from '@/types/global';

import { Point } from '@/types/svg';
import { useAnnotations } from '@/hooks/useAnnotations';
import { useToast } from '@/hooks/useToast';
import { usePermissions } from '@/hooks/usePermission';
import { 
  calculateArrowPoints, 
  getRelativeCoordinates 
} from '@/utils/annotation.util';
import { AnnotationTool } from './AnnotationTool';
import { AnnotationLayer } from '../annotations/AnnotationLayer';
import { AnnotationEditor } from './AnnotationEditor';
import { Button } from '../ui/button';
import { MapPin, ArrowRight, Eye, EyeOff } from 'lucide-react';

interface ImageAnnotatorProps {
  imageUrl: string;
  imageId: number;
  initialAnnotations?: SafeAnnotation[];
  readOnly?: boolean;
}

export default function ImageAnnotator({
  imageUrl,
  imageId,
  initialAnnotations = [],
  readOnly = false
}: ImageAnnotatorProps) {
  // Hooks
  const { data: session } = useSession();
  const { can } = usePermissions();
  const { error: toastError, success: toastSuccess } = useToast();
  const {
    annotations,
    createAnnotation,
    updateAnnotation,
    deleteAnnotation
  } = useAnnotations(imageId, initialAnnotations);

  // State
  const [mode, setMode] = useState<ImageAnnotatorMode>('view');
  const [selectedTool, setSelectedTool] = useState<AnnotationType | null>(null);
  const [showAnnotations, setShowAnnotations] = useState(true);
  const [selectedAnnotation, setSelectedAnnotation] = useState<SafeAnnotation | null>(null);
  const [drawingPoints, setDrawingPoints] = useState<Point[]>([]);

  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // Handlers
  const handleCanvasClick = async (e: React.MouseEvent) => {
    if (!session || mode !== 'edit' || !selectedTool) return;

    const coords = getRelativeCoordinates(e, containerRef.current);

    if (selectedTool === AnnotationType.DOT) {
      try {
        await createAnnotation({
          type: AnnotationType.DOT,
          x: coords.x,
          y: coords.y,
          label: 'New annotation',
          imageId
        });
        toastSuccess({
          title: 'Success',
          message: 'Annotation created successfully'
        });
      } catch (error) {
        toastError({
          title: 'Error',
          message: 'Failed to create annotation'
        });
      }
    } else if (selectedTool === AnnotationType.ARROW) {
      setDrawingPoints(prev => [...prev, coords]);
    }
  };

  useEffect(() => {
    if (drawingPoints.length === 2) {
      const createArrowAnnotation = async () => {
        try {
          await createAnnotation({
            type: AnnotationType.ARROW,
            x: drawingPoints[0].x,
            y: drawingPoints[0].y,
            endX: drawingPoints[1].x,
            endY: drawingPoints[1].y,
            label: 'New arrow',
            imageId
          });
          toastSuccess({
            title: 'Success',
            message: 'Arrow annotation created successfully'
          });
        } catch (error) {
          toastError({
            title: 'Error',
            message: 'Failed to create arrow annotation'
          });
        }
        setDrawingPoints([]);
      };

      createArrowAnnotation();
    }
  }, [drawingPoints]);

  if (!session && !readOnly) {
    return (
      <div className="text-center py-8">
        Please sign in to annotate images
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {!readOnly && (
        <div className="flex items-center gap-4 p-4 bg-white rounded-lg shadow-sm">
          <AnnotationTool
            type={AnnotationType.DOT}
            isSelected={selectedTool === AnnotationType.DOT}
            onClick={() => setSelectedTool(AnnotationType.DOT)}
            icon={MapPin}
            label="Add Dot"
          />
          <AnnotationTool
            type={AnnotationType.ARROW}
            isSelected={selectedTool === AnnotationType.ARROW}
            onClick={() => setSelectedTool(AnnotationType.ARROW)}
            icon={ArrowRight}
            label="Add Arrow"
          />
          <div className="ml-auto">
          <Button
            variant="ghost"
            onClick={() => setShowAnnotations(!showAnnotations)}
            iconLeft={showAnnotations ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          > {showAnnotations ? 'Hide' : 'Show'} Annotations
          </Button>
          </div>
        </div>
      )}

      <div 
        ref={containerRef}
        className="relative bg-gray-100 rounded-lg overflow-hidden"
        onClick={handleCanvasClick}
      >
        <img
          ref={imageRef}
          src={imageUrl}
          alt="Annotatable image"
          className="w-full h-auto"
          draggable={false}
        />

        <AnnotationLayer
          annotations={annotations}
          showAnnotations={showAnnotations}
          selectedAnnotation={selectedAnnotation}
          onSelect={setSelectedAnnotation}
          drawingPoints={drawingPoints}
        />
      </div>

      {selectedAnnotation && (
        <AnnotationEditor
          annotation={selectedAnnotation}
          onUpdate={updateAnnotation}
          onDelete={can('delete:annotation', selectedAnnotation) ? deleteAnnotation : undefined}
          onClose={() => setSelectedAnnotation(null)}
        />
      )}
    </div>
  );
}