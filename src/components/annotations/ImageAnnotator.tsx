import React, { useState, useRef, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Annotation, AnnotationType, SafeAnnotation } from '@/types/global';
import { usePermissions } from '@/hooks/usePermissions';
import { svgUtils } from '@/utils/svgUtils';
import { Pencil, Eye, EyeOff, Trash2 } from 'lucide-react';

interface ImageAnnotatorProps {
  imageUrl: string;
  imageId: number;
  annotations: SafeAnnotation[];
  onAnnotationCreate: (annotation: Partial<Annotation>) => Promise<void>;
  onAnnotationUpdate: (id: number, data: Partial<Annotation>) => Promise<void>;
  onAnnotationDelete: (id: number) => Promise<void>;
}

export default function ImageAnnotator({
  imageUrl,
  imageId,
  annotations,
  onAnnotationCreate,
  onAnnotationUpdate,
  onAnnotationDelete
}: ImageAnnotatorProps) {
  const { data: session } = useSession();
  const [selectedTool, setSelectedTool] = useState<AnnotationType | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(null);
  const [showAnnotations, setShowAnnotations] = useState(true);
  const [selectedAnnotation, setSelectedAnnotation] = useState<SafeAnnotation | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const { can } = usePermissions();

  const getRelativeCoordinates = (e: React.MouseEvent): { x: number; y: number } => {
    if (!containerRef.current) return { x: 0, y: 0 };
    const rect = containerRef.current.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100
    };
  };

  const handleClick = async (e: React.MouseEvent) => {
    if (!selectedTool || !session) return;

    const coords = getRelativeCoordinates(e);
    
    if (selectedTool === 'DOT') {
      await onAnnotationCreate({
        type: 'DOT',
        x: coords.x,
        y: coords.y,
        label: 'New annotation',
        imageId
      });
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (selectedTool !== 'ARROW' || !session) return;
    setIsDrawing(true);
    setStartPoint(getRelativeCoordinates(e));
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDrawing || !startPoint) return;
    // Create preview arrow here if needed
  };

  const handleMouseUp = async (e: React.MouseEvent) => {
    if (!isDrawing || !startPoint || !session) return;
    const endPoint = getRelativeCoordinates(e);
    
    await onAnnotationCreate({
      type: 'ARROW',
      x: startPoint.x,
      y: startPoint.y,
      endX: endPoint.x,
      endY: endPoint.y,
      label: 'New arrow',
      imageId
    });

    setIsDrawing(false);
    setStartPoint(null);
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto">
      <div className="mb-4 flex gap-2">
        <button
          onClick={() => setSelectedTool('DOT')}
          className={`px-4 py-2 rounded ${
            selectedTool === 'DOT' ? 'bg-blue-500 text-white' : 'bg-gray-200'
          }`}
        >
          Add Dot
        </button>
        <button
          onClick={() => setSelectedTool('ARROW')}
          className={`px-4 py-2 rounded ${
            selectedTool === 'ARROW' ? 'bg-blue-500 text-white' : 'bg-gray-200'
          }`}
        >
          Add Arrow
        </button>
        <button
          onClick={() => setShowAnnotations(!showAnnotations)}
          className="px-4 py-2 rounded bg-gray-200"
        >
          {showAnnotations ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
        </button>
      </div>

      <div
        ref={containerRef}
        className="relative"
        onClick={handleClick}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        <img
          ref={imageRef}
          src={imageUrl}
          alt="Annotated image"
          className="w-full h-auto"
        />

        {showAnnotations && annotations.map(annotation => (
          <div
            key={annotation.id}
            className={`absolute transition-opacity ${
              annotation.isHidden ? 'opacity-30' : 'opacity-100'
            }`}
            style={{
              left: `${annotation.x}%`,
              top: `${annotation.y}%`,
            }}
          >
            {annotation.type === 'DOT' ? (
              <div
                className="w-4 h-4 bg-blue-500 rounded-full -translate-x-1/2 -translate-y-1/2 cursor-pointer"
                onClick={() => setSelectedAnnotation(annotation)}
              >
                <div className="absolute left-full ml-2 bg-white p-2 rounded shadow-lg whitespace-nowrap">
                  {annotation.label}
                </div>
              </div>
            ) : (
              <svg
                className="absolute"
                style={{
                  width: `${Math.abs(annotation.endX! - annotation.x)}%`,
                  height: `${Math.abs(annotation.endY! - annotation.y)}%`,
                }}
              >
                <line
                  x1="0"
                  y1="0"
                  x2="100%"
                  y2="100%"
                  stroke="blue"
                  strokeWidth="2"
                  markerEnd="url(#arrowhead)"
                />
                <text x="50%" y="50%" className="fill-current text-sm">
                  {annotation.label}
                </text>
              </svg>
            )}
          </div>
        ))}
      </div>

      {selectedAnnotation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">Edit Annotation</h3>
            <input
              type="text"
              value={selectedAnnotation.label}
              onChange={(e) => setSelectedAnnotation({
                ...selectedAnnotation,
                label: e.target.value
              })}
              className="w-full p-2 border rounded mb-4"
            />
            <textarea
              value={selectedAnnotation.description || ''}
              onChange={(e) => setSelectedAnnotation({
                ...selectedAnnotation,
                description: e.target.value
              })}
              className="w-full p-2 border rounded mb-4"
              placeholder="Description (optional)"
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setSelectedAnnotation(null)}
                className="px-4 py-2 bg-gray-100 rounded hover:bg-gray-200"
              >
                Cancel
              </button>
              {can('update:annotation', selectedAnnotation) && (
                <button
                  onClick={() => {
                    onAnnotationUpdate(selectedAnnotation.id, {
                      label: selectedAnnotation.label,
                      description: selectedAnnotation.description,
                    });
                    setSelectedAnnotation(null);
                  }}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Save
                </button>
              )}
              {can('delete:annotation', selectedAnnotation) && (
                <button
                  onClick={() => {
                    onAnnotationDelete(selectedAnnotation.id);
                    setSelectedAnnotation(null);
                  }}
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Delete
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}