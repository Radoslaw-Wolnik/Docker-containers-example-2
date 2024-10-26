// src/components/layout/AppLayout.tsx
import { ReactNode } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import { useUIContext } from '@/contexts/UIContext';
import { Sidebar } from './sidebar';
import { Navbar } from './Navbar';
import { LoadingScreen } from '../ui/LoadingScreen';

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { isLoading, isAuthenticated } = useAuth();
  const { state: { isSidebarOpen } } = useUIContext();
  const router = useRouter();

  // Public routes that don't require authentication
  const publicRoutes = ['/login', '/register', '/forgot-password'];
  const isPublicRoute = publicRoutes.includes(router.pathname);

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated && !isPublicRoute) {
    router.push('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex">
        {isAuthenticated && isSidebarOpen && <Sidebar />}
        <main
          className={`flex-1 transition-all ${
            isAuthenticated && isSidebarOpen ? 'ml-64' : ''
          }`}
        >
          <div className="container mx-auto px-4 py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
