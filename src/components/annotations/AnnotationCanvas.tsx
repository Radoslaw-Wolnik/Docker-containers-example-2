// src/components/annotation/AnnotationCanvas.tsx
import React, { useState, useRef, useEffect } from 'react';
import { useImageContext } from '@/contexts/ImageContext';
import { AnnotationType, Point, SafeAnnotation } from '@/types/global';
import { getRelativeCoordinates } from '@/utils/annotation.util';
import { AnnotationToolbar } from './AnnotationToolbar';
import { AnnotationLayer } from './AnnotationLayer';

interface AnnotationCanvasProps {
  imageUrl: string;
  className?: string;
}

export function AnnotationCanvas({ imageUrl, className = '' }: AnnotationCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [drawingPoints, setDrawingPoints] = useState<Point[]>([]);
  const [selectedAnnotation, setSelectedAnnotation] = useState<SafeAnnotation | null>(null);
 
  const {
    state: { annotationMode, annotations, showAnnotations },
    dispatch
  } = useImageContext();

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const createNewAnnotation = (type: AnnotationType, data: Partial<SafeAnnotation>): SafeAnnotation => {
    return {
      id: Date.now(), // Temporary ID, should be replaced by server
      type,
      x: 0,
      y: 0,
      label: 'New annotation',
      description: null,
      imageId: 0, // Should be provided by parent
      userId: 0, // Should be provided by auth context
      endX: null,
      endY: null,
      isHidden: false,
      ...data
    };
  };

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (!annotationMode || !canvasRef.current) return;
    
    const coords = getRelativeCoordinates(e, canvasRef.current);

    if (annotationMode === 'dot') {
      const newAnnotation = createNewAnnotation('dot', {
        x: coords.x,
        y: coords.y,
        label: 'New annotation'
      });

      dispatch({
        type: 'ADD_ANNOTATION',
        payload: newAnnotation
      });
    } else if (annotationMode === 'arrow') {
      if (drawingPoints.length === 0) {
        setDrawingPoints([coords]);
      } else {
        const newAnnotation = createNewAnnotation('arrow', {
          x: drawingPoints[0].x,
          y: drawingPoints[0].y,
          endX: coords.x,
          endY: coords.y,
          label: 'New arrow'
        });

        dispatch({
          type: 'ADD_ANNOTATION',
          payload: newAnnotation
        });
        setDrawingPoints([]);
      }
    }
  };

  return (
    <div className="space-y-4">
      <AnnotationToolbar />
     
      <div
        ref={canvasRef}
        className={`relative overflow-hidden ${className}`}
        onClick={handleCanvasClick}
      >
        <img
          src={imageUrl}
          alt="Annotatable image"
          className="w-full h-auto"
          onLoad={handleImageLoad}
          draggable={false}
        />
        {imageLoaded && (
          <AnnotationLayer
            annotations={annotations}
            drawingPoints={drawingPoints}
            showAnnotations={showAnnotations}
            selectedAnnotation={selectedAnnotation}
            onSelect={setSelectedAnnotation}
          />
        )}
      </div>
    </div>
  );
}