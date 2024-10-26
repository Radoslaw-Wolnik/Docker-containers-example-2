import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { SafeUser } from "@/types/global";
// src/utils/authUtils.ts
import { signIn } from 'next-auth/react';

interface SignInCredentials {
  email: string;
  password: string;
}

export async function signInWithCredentials(credentials: SignInCredentials) {
  try {
    const result = await signIn('credentials', {
      ...credentials,
      redirect: false,
    });

    return result || { error: 'Unknown error occurred' };
  } catch (error) {
    return { error: 'Failed to sign in' };
  }
}

// src/hooks/useAuth.ts
export function useAuth() {
  const session = useSession();
  const router = useRouter();

  const signIn = async (credentials: { email: string; password: string }) => {
    const result = await signInWithCredentials(credentials);
    if (result.error) throw new Error(result.error);
    router.push('/dashboard');
  };

  return {
    user: session.data?.user as SafeUser | null,
    isLoading: session.status === 'loading',
    isAuthenticated: !!session.data,
    signIn
  };
}