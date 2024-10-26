// src/contexts/UIContext.tsx
import { createContext, useContext, useReducer, ReactNode } from 'react';

interface UIState {
  isSidebarOpen: boolean;
  isSettingsOpen: boolean;
  theme: 'light' | 'dark' | 'system';
  imageViewMode: 'grid' | 'list';
  gridColumns: number;
}

type UIAction =
  | { type: 'TOGGLE_SIDEBAR' }
  | { type: 'SET_SIDEBAR'; payload: boolean }
  | { type: 'TOGGLE_SETTINGS' }
  | { type: 'SET_THEME'; payload: 'light' | 'dark' | 'system' }
  | { type: 'SET_IMAGE_VIEW_MODE'; payload: 'grid' | 'list' }
  | { type: 'SET_GRID_COLUMNS'; payload: number };

const UIContext = createContext<{
  state: UIState;
  dispatch: React.Dispatch<UIAction>;
} | null>(null);

const initialState: UIState = {
  isSidebarOpen: true,
  isSettingsOpen: false,
  theme: 'system',
  imageViewMode: 'grid',
  gridColumns: 3,
};

function uiReducer(state: UIState, action: UIAction): UIState {
  switch (action.type) {
    case 'TOGGLE_SIDEBAR':
      return { ...state, isSidebarOpen: !state.isSidebarOpen };
    case 'SET_SIDEBAR':
      return { ...state, isSidebarOpen: action.payload };
    case 'TOGGLE_SETTINGS':
      return { ...state, isSettingsOpen: !state.isSettingsOpen };
    case 'SET_THEME':
      return { ...state, theme: action.payload };
    case 'SET_IMAGE_VIEW_MODE':
      return { ...state, imageViewMode: action.payload };
    case 'SET_GRID_COLUMNS':
      return { ...state, gridColumns: action.payload };
    default:
      return state;
  }
}

export function UIProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(uiReducer, initialState);

  return (
    <UIContext.Provider value={{ state, dispatch }}>
      {children}
    </UIContext.Provider>
  );
}

export function useUIContext() {
  const context = useContext(UIContext);
  if (!context) {
    throw new Error('useUIContext must be used within a UIProvider');
  }
  return context;
}