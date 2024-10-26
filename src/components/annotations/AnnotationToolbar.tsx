// src/components/annotations/AnnotationToolbar.tsx
import { MousePointer, MapPin, ArrowRight, Eye, EyeOff, Settings } from 'lucide-react';
import { useImageContext } from '@/contexts/ImageContext';
import { Button } from '../ui/button';
import { AnnotationType } from '@/types/global';

export function AnnotationToolbar() {
  const { state, dispatch } = useImageContext();

  const handleToolSelect = (mode: AnnotationType | null) => {
    dispatch({ type: 'SET_ANNOTATION_MODE', payload: mode });
    dispatch({ type: 'SET_IS_ANNOTATING', payload: mode !== null });
  };

  return (
    <div className="flex items-center gap-2 p-2 bg-white rounded-lg shadow-sm">
      <Button
        variant={state.annotationMode === null ? 'default' : 'ghost'}
        size="sm"
        onClick={() => handleToolSelect(null)}
      >
        <MousePointer className="w-4 h-4 mr-2" />
        Select
      </Button>

      <Button
        variant={state.annotationMode === 'dot' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => handleToolSelect('dot')}
      >
        <MapPin className="w-4 h-4 mr-2" />
        Add Dot
      </Button>

      <Button
        variant={state.annotationMode === 'arrow' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => handleToolSelect('arrow')}
      >
        <ArrowRight className="w-4 h-4 mr-2" />
        Add Arrow
      </Button>

      <div className="ml-auto">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => dispatch({ type: 'TOGGLE_ANNOTATIONS_VISIBILITY' })}
        >
          {state.showAnnotations ? (
            <EyeOff className="w-4 h-4" />
          ) : (
            <Eye className="w-4 h-4" />
          )}
        </Button>
      </div>
    </div>
  );
}