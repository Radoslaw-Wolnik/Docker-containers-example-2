// src/contexts/AuthContext.tsx
import { createContext, useContext, useCallback, useEffect } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { SafeUser } from '@/types/global';

export interface AuthContextType {
  user: SafeUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (credentials: { username: string; password: string }) => Promise<void>;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  const handleSignIn = useCallback(async (credentials: { username: string; password: string }) => {
    try {
      const result = await signIn('credentials', {
        redirect: false,
        ...credentials,
      });

      if (result?.error) {
        throw new Error(result.error);
      }

      router.push('/');
    } catch (error) {
      throw new Error('Authentication failed');
    }
  }, [router]);

  const handleSignOut = useCallback(async () => {
    await signOut({ redirect: false });
    router.push('/auth/signin');
  }, [router]);

  const value = {
    user: session?.user as SafeUser | null,
    isLoading: status === 'loading',
    isAuthenticated: !!session,
    signIn: handleSignIn,
    signOut: handleSignOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}