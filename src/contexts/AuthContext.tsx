// src/contexts/AuthContext.tsx
import { createContext, useContext, useCallback, ReactNode } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { SafeUser } from '@/types/global';

interface AuthContextType {
  user: SafeUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (credentials: { email: string; password: string }) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  const handleSignIn = useCallback(async (credentials: { email: string; password: string }) => {
    try {
      const result = await signIn('credentials', {
        ...credentials,
        redirect: false,
      });

      if (result?.error) {
        throw new Error(result.error);
      }

      router.push('/dashboard');
    } catch (error) {
      throw new Error('Authentication failed');
    }
  }, [router]);

  const handleSignOut = useCallback(async () => {
    await signOut({ redirect: false });
    router.push('/');
  }, [router]);

  const value = {
    user: session?.user as SafeUser | null,
    isLoading: status === 'loading',
    isAuthenticated: !!session,
    signIn: handleSignIn,
    signOut: handleSignOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// src/hooks/useAuth.ts
export function useAuth() {
  const session = useSession();
  return {
    user: session.data?.user as SafeUser | null,
    isLoading: session.status === 'loading',
    isAuthenticated: !!session.data
  };
}