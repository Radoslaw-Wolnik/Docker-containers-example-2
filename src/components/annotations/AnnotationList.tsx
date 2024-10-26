import React from 'react';
import { Annotation, SafeUser } from '@/types/global';
import { formatDate } from '@/utils/dateUtil';
import { Edit2, Trash2, MapPin, ArrowRight } from 'lucide-react';

interface AnnotationListProps {
  annotations: Annotation[];
  onUpdate: (id: number, updates: Partial<Annotation>) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
  currentUser?: SafeUser | null;
}

export default function AnnotationList({
  annotations,
  onUpdate,
  onDelete,
  currentUser
}: AnnotationListProps) {
  const canModify = (annotation: Annotation) => {
    if (!currentUser) return false;
    return currentUser.id === annotation.userId || currentUser.role === 'ADMIN';
  };

  const toggleVisibility = async (annotation: Annotation) => {
    await onUpdate(annotation.id, { isHidden: !annotation.isHidden });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-medium mb-4">
        Annotations ({annotations.length})
      </h3>

      <div className="space-y-4">
        {annotations.map((annotation) => (
          <div
            key={annotation.id}
            className={`p-4 rounded-lg border ${
              annotation.isHidden ? 'bg-gray-50 border-gray-200' : 'bg-white border-gray-200'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                {annotation.type === 'DOT' ? (
                  <MapPin className="w-5 h-5 text-blue-500 flex-shrink-0" />
                ) : (
                  <ArrowRight className="w-5 h-5 text-green-500 flex-shrink-0" />
                )}
                <div>
                  <p className="font-medium">{annotation.label}</p>
                  {annotation.description && (
                    <p className="text-sm text-gray-600 mt-1">
                      {annotation.description}
                    </p>
                  )}
                  <div className="flex items-center text-xs text-gray-500 mt-2">
                    <span>By {annotation.createdBy?.username}</span>
                    <span className="mx-2">•</span>
                    <span>{formatDate(annotation.createdAt)}</span>
                  </div>
                </div>
              </div>

              {canModify(annotation) && (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => toggleVisibility(annotation)}
                    className={`p-1 rounded-full ${
                      annotation.isHidden
                        ? 'text-gray-400 hover:text-gray-600'
                        : 'text-blue-500 hover:text-blue-600'
                    }`}
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDelete(annotation.id)}
                    className="p-1 rounded-full text-red-500 hover:text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            <div className="mt-2 text-xs text-gray-500">
              Position: {Math.round(annotation.x)}%, {Math.round(annotation.y)}%
              {annotation.type === 'ARROW' && annotation.endX && annotation.endY && (
                <> → {Math.round(annotation.endX)}%, {Math.round(annotation.endY)}%</>
              )}
            </div>
          </div>
        ))}

        {annotations.length === 0 && (
          <p className="text-center text-gray-500 py-4">
            No annotations yet. Click on the image to add annotations.
          </p>
        )}
      </div>

      <div className="mt-4 border-t pt-4">
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <div className="flex items-center">
            <MapPin className="w-4 h-4 text-blue-500 mr-1" />
            <span>Dot Annotation</span>
          </div>
          <div className="flex items-center">
            <ArrowRight className="w-4 h-4 text-green-500 mr-1" />
            <span>Arrow Annotation</span>
          </div>
        </div>
      </div>
    </div>
  );
}