// src/contexts/ImageContext.tsx
import { createContext, useContext, useReducer, ReactNode } from 'react';
import { ExtendedImage, SafeAnnotation } from '@/types/global';

interface ImageState {
  selectedImage: ExtendedImage | null;
  annotations: SafeAnnotation[];
  isAnnotating: boolean;
  annotationMode: 'dot' | 'arrow' | null;
  showAnnotations: boolean; // Added this
}

type ImageAction =
  | { type: 'SET_SELECTED_IMAGE'; payload: ExtendedImage | null }
  | { type: 'SET_ANNOTATIONS'; payload: SafeAnnotation[] }
  | { type: 'ADD_ANNOTATION'; payload: SafeAnnotation }
  | { type: 'UPDATE_ANNOTATION'; payload: SafeAnnotation }
  | { type: 'DELETE_ANNOTATION'; payload: number }
  | { type: 'SET_ANNOTATION_MODE'; payload: 'dot' | 'arrow' | null }
  | { type: 'SET_IS_ANNOTATING'; payload: boolean }
  | { type: 'TOGGLE_ANNOTATIONS_VISIBILITY' }
  | { type: 'TOGGLE_SETTINGS' };

const initialState: ImageState = {
  selectedImage: null,
  annotations: [],
  isAnnotating: false,
  annotationMode: null,
  showAnnotations: true, // Added this
};

function imageReducer(state: ImageState, action: ImageAction): ImageState {
  switch (action.type) {
    case 'SET_SELECTED_IMAGE':
      return { ...state, selectedImage: action.payload };
    case 'SET_ANNOTATIONS':
      return { ...state, annotations: action.payload };
    case 'ADD_ANNOTATION':
      return { ...state, annotations: [...state.annotations, action.payload] };
    case 'UPDATE_ANNOTATION':
      return {
        ...state,
        annotations: state.annotations.map(ann =>
          ann.id === action.payload.id ? action.payload : ann
        ),
      };
    case 'DELETE_ANNOTATION':
      return {
        ...state,
        annotations: state.annotations.filter(ann => ann.id !== action.payload),
      };
    case 'SET_ANNOTATION_MODE':
      return { ...state, annotationMode: action.payload };
    case 'SET_IS_ANNOTATING':
      return { ...state, isAnnotating: action.payload };
    case 'TOGGLE_ANNOTATIONS_VISIBILITY':
      return { ...state, showAnnotations: !state.showAnnotations };
    case 'TOGGLE_SETTINGS':
      return { ...state }; // Add your settings toggle logic here
    default:
      return state;
  }
}

const ImageContext = createContext<{
  state: ImageState;
  dispatch: React.Dispatch<ImageAction>;
} | null>(null);

export function ImageProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(imageReducer, initialState);

  return (
    <ImageContext.Provider value={{ state, dispatch }}>
      {children}
    </ImageContext.Provider>
  );
}

export function useImageContext() {
  const context = useContext(ImageContext);
  if (!context) {
    throw new Error('useImageContext must be used within an ImageProvider');
  }
  return context;
}