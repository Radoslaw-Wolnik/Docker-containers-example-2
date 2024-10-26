import React from 'react';
import { SafeAnnotation, SafeUser } from '@/types/global';
import { formatDate } from '@/utils/dateUtil';
import { Edit2, Trash2, MapPin, ArrowRight } from 'lucide-react';
import { usePermissions } from '@/hooks/usePermissions';

interface AnnotationListProps {
  annotations: SafeAnnotation[];
  onUpdate: (id: number, updates: Partial<SafeAnnotation>) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
  currentUser?: SafeUser | null;
}

export default function AnnotationList({
  annotations,
  onUpdate,
  onDelete,
  currentUser
}: AnnotationListProps) {
  const { can } = usePermissions();

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

              {can('update:annotation', annotation) && (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onUpdate(annotation.id, {
                      isHidden: !annotation.isHidden
                    })}
                    className="p-1 rounded hover:bg-gray-100"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDelete(annotation.id)}
                    className="p-1 rounded hover:bg-gray-100 text-red-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

        {annotations.length === 0 && (
          <div className="text-center text-gray-500 py-4">
            No annotations yet
          </div>
        )}
      </div>
    </div>
  );
}