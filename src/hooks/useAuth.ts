// src/contexts/AuthContext.tsx
import { createContext, useContext } from 'react';
import { SafeUser } from '@/types/global';

import { AuthContext, AuthContextType } from '../contexts/AuthContext';

// Custom hook for using auth context
export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
      throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
  }