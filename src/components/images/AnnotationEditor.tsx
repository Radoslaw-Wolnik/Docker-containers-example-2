// src/components/image/AnnotationEditor.tsx
import { SafeAnnotation } from "@/types/global";
import { Annotation } from "@/types/global";
import { useState } from "react";
import { useToast } from "@/hooks/useToast";
import { Button } from "../ui/button";

interface AnnotationEditorProps {
    annotation: SafeAnnotation;
    onUpdate: (id: number, updates: Partial<Annotation>) => Promise<void>;
    onDelete?: (id: number) => Promise<void>;
    onClose: () => void;
  }
  
  export function AnnotationEditor({
    annotation,
    onUpdate,
    onDelete,
    onClose
  }: AnnotationEditorProps) {
    const [label, setLabel] = useState(annotation.label);
    const [description, setDescription] = useState(annotation.description || '');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { error: toastError, success: toastSucces } = useToast();
  
    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsSubmitting(true);
  
      try {
        await onUpdate(annotation.id, {
          label,
          description: description || null
        });
        toastSucces({
          title: 'Success',
          message: 'Annotation updated successfully'
        });
        onClose();
      } catch (error) {
        toastError({
          title: 'Error',
          message: 'Failed to update annotation',
        });
      } finally {
        setIsSubmitting(false);
      }
    };
  
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full">
          <h3 className="text-lg font-semibold mb-4">
            Edit Annotation
          </h3>
  
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="label" className="block text-sm font-medium text-gray-700">
                Label
              </label>
              <input
                type="text"
                id="label"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
  
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
  
            <div className="flex justify-end gap-2">
              <Button
                variant="ghost"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              {onDelete && (
                <Button
                  variant="ghost"
                  onClick={() => onDelete(annotation.id)}
                  disabled={isSubmitting}
                >
                  Delete
                </Button>
              )}
              <Button
                type="submit"
                disabled={isSubmitting}
                loading={isSubmitting}
              >
                Save Changes
              </Button>
            </div>
          </form>
        </div>
      </div>
    );
  }