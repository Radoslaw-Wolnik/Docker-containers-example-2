// src/contexts/ConfigContext.tsx
import { createContext, useContext } from 'react';

interface ConfigContextType {
  apiUrl: string;
  imageDomain: string;
  environment: 'development' | 'production' | 'test';
  features: {
    enableTrading: boolean;
    enableModeration: boolean;
  };
}

export const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

export function ConfigProvider({ children }: { children: React.ReactNode }) {
  const value: ConfigContextType = {
    apiUrl: process.env.NEXT_PUBLIC_API_URL || '',
    imageDomain: process.env.NEXT_PUBLIC_IMAGE_DOMAIN || 'localhost',
    environment: (process.env.NODE_ENV || 'development') as 'development' | 'production' | 'test',
    features: {
      enableTrading: process.env.NEXT_PUBLIC_ENABLE_TRADING === 'true',
      enableModeration: process.env.NEXT_PUBLIC_ENABLE_MODERATION === 'true',
    },
  };

  return <ConfigContext.Provider value={value}>{children}</ConfigContext.Provider>;
}

