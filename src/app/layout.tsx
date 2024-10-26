import React from 'react';
import { useSession } from 'next-auth/react';
import Navbar from './Navbar';
import Footer from './Footer';
import { Toaster } from '@/components/ui/toast';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { data: session, status } = useSession();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">{children}</main>
      <Footer />
      <Toaster />
    </div>
  );
}
