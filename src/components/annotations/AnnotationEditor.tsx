import React, { useState, useEffect, useRef } from 'react';
import { X, Move, Eye, EyeOff, Save, Trash2 } from 'lucide-react';
import { Annotation, AnnotationType } from '@/types/global';
import { usePermissions } from '@/hooks';
import { svgUtils } from '@/utils/svgUtils';

interface AnnotationEditorProps {
  annotation: Annotation;
  imageWidth: number;
  imageHeight: number;
  onUpdate: (id: number, updates: Partial<Annotation>) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
  onCancel: () => void;
}

export default function AnnotationEditor({
  annotation,
  imageWidth,
  imageHeight,
  onUpdate,
  onDelete,
  onCancel,
}: AnnotationEditorProps) {
  const { can } = usePermissions();
  const [isEditing, setIsEditing] = useState(false);
  const [position, setPosition] = useState({
    x: annotation.x,
    y: annotation.y,
    endX: annotation.endX,
    endY: annotation.endY,
  });
  const [label, setLabel] = useState(annotation.label);
  const [description, setDescription] = useState(annotation.description || '');
  const [isDragging, setIsDragging] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isEditing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isEditing, isDragging]);

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || !editorRef.current) return;

    const rect = editorRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    if (annotation.type === AnnotationType.DOT) {
      setPosition(prev => ({
        ...prev,
        x: Math.max(0, Math.min(100, x)),
        y: Math.max(0, Math.min(100, y)),
      }));
    } else {
      // For arrows, only move the end point while dragging
      setPosition(prev => ({
        ...prev,
        endX: Math.max(0, Math.min(100, x)),
        endY: Math.max(0, Math.min(100, y)),
      }));
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    if (isEditing) {
      handleSave();
    }
  };

  const handleSave = async () => {
    try {
      await onUpdate(annotation.id, {
        ...position,
        label,
        description: description || null,
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update annotation:', error);
    }
  };

  const renderAnnotation = () => {
    if (annotation.type === AnnotationType.DOT) {
      return (
        <div
          className={`absolute w-4 h-4 bg-blue-500 rounded-full cursor-move transform -translate-x-1/2 -translate-y-1/2 ${
            isDragging ? 'scale-110' : ''
          }`}
          style={{
            left: `${position.x}%`,
            top: `${position.y}%`,
          }}
          onMouseDown={() => {
            if (isEditing) {
              setIsDragging(true);
            }
          }}
        />
      );
    } else {
      const path = svgUtils.calculateArrowPath(
        { x: position.x, y: position.y },
        { x: position.endX!, y: position.endY! },
        { headSize: 10, strokeWidth: 2 }
      );

      return (
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{ zIndex: 1 }}
        >
          <path
            d={path}
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
            className="text-blue-500"
          />
        </svg>
      );
    }
  };

  return (
    <div
      ref={editorRef}
      className="absolute inset-0"
      style={{ zIndex: isEditing ? 20 : 10 }}
    >
      {renderAnnotation()}

      <div
        className={`absolute bg-white rounded-lg shadow-lg p-4 ${
          annotation.type === AnnotationType.DOT
            ? 'transform -translate-x-1/2 -translate-y-full'
            : ''
        }`}
        style={{
          left: `${annotation.type === AnnotationType.DOT ? position.x : position.endX}%`,
          top: `${annotation.type === AnnotationType.DOT ? position.y : position.endY}%`,
          marginTop: '-8px',
        }}
      >
        {isEditing ? (
          <div className="space-y-4">
            <div>
              <input
                type="text"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                className="w-full px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Label"
              />
            </div>
            <div>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Description (optional)"
                rows={3}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <button
                onClick={handleSave}
                className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                <Save className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  setIsEditing(false);
                  onCancel();
                }}
                className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
              >
                <X className="w-4 h-4" />
              </button>
              {can('delete:annotation', annotation) && (
                <button
                  onClick={() => onDelete(annotation.id)}
                  className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ) : (
          <div>
            <h3 className="font-medium">{label}</h3>
            {description && (
              <p className="mt-1 text-sm text-gray-600">{description}</p>
            )}
            {can('edit:annotation', annotation) && (
              <div className="mt-2 flex justify-end space-x-2">
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-1 text-gray-400 hover:text-gray-600"
                >
                  <Move className="w-4 h-4" />
                </button>
                <button
                  onClick={() =>
                    onUpdate(annotation.id, { isHidden: !annotation.isHidden })
                  }
                  className="p-1 text-gray-400 hover:text-gray-600"
                >
                  {annotation.isHidden ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}