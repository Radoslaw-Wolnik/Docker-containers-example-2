// src/components/annotation/AnnotationList.tsx
import { memo } from 'react';
import { useImageContext } from '@/contexts/ImageContext';
import { SafeAnnotation } from '@/types/global';
import { Card } from '../ui/Card';
import { MapPin, ArrowRight, Eye, EyeOff, Edit2, Trash2 } from 'lucide-react';

interface AnnotationListProps {
  onSelect?: (annotation: SafeAnnotation) => void;
}

export const AnnotationList = memo(function AnnotationList({
  onSelect
}: AnnotationListProps) {
  const { state: { annotations }, dispatch } = useImageContext();

  const handleVisibilityToggle = (annotation: SafeAnnotation) => {
    const updatedAnnotation: SafeAnnotation = {
      ...annotation,
      isHidden: !annotation.isHidden
    };

    dispatch({
      type: 'UPDATE_ANNOTATION',
      payload: updatedAnnotation
    });
  };

  const handleDelete = (annotationId: number) => {
    if (confirm('Are you sure you want to delete this annotation?')) {
      dispatch({ type: 'DELETE_ANNOTATION', payload: annotationId });
    }
  };

  if (annotations.length === 0) {
    return (
      <Card className="p-4">
        <p className="text-center text-gray-500">
          No annotations yet
        </p>
      </Card>
    );
  }

  return (
    <Card className="divide-y">
      {annotations.map((annotation) => (
        <div
          key={annotation.id}
          className={`p-4 hover:bg-gray-50 transition-colors ${
            annotation.isHidden ? 'opacity-50' : ''
          }`}
        >
          <div className="flex items-start gap-3">
            {annotation.type === 'DOT' ? (
              <MapPin className="w-5 h-5 text-blue-500 flex-shrink-0" />
            ) : (
              <ArrowRight className="w-5 h-5 text-green-500 flex-shrink-0" />
            )}

            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{annotation.label}</p>
              {annotation.description && (
                <p className="text-sm text-gray-500 mt-1">
                  {annotation.description}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleVisibilityToggle(annotation)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                {annotation.isHidden ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
              
              <button
                onClick={() => onSelect?.(annotation)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              
              <button
                onClick={() => handleDelete(annotation.id)}
                className="p-1 hover:bg-gray-100 rounded text-red-500"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </Card>
  );
});