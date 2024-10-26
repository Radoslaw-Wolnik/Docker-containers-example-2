'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Image as ImageIcon, Upload, Users, Activity } from 'lucide-react';
import { Loading, SearchBar } from '@/components/ui';
import ImageGrid from '@/components/images/ImageGrid';
import { useSearch } from '@/hooks';
import { Image } from '@/types/global';

export default function HomePage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [images, setImages] = useState<Image[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<{
    totalImages: number;
    totalUsers: number;
    totalAnnotations: number;
  }>({
    totalImages: 0,
    totalUsers: 0,
    totalAnnotations: 0,
  });

  const { searchTerm, setSearchTerm, results: filteredImages } = useSearch<Image>(
    images,
    ['name', 'description']
  );

  useEffect(() => {
    fetchImages();
    fetchStats();
  }, []);

  const fetchImages = async () => {
    try {
      const response = await fetch('/api/images?public=true');
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      setImages(data.data);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/statistics');
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      setStats(data.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  if (loading) {
    return <Loading fullScreen />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl md:text-6xl">
              Image Annotation Made Simple
            </h1>
            <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
              Upload, annotate, and share your images with ease. Add labels, arrows,
              and collaborate with others in real-time.
            </p>
            <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
              {session ? (
                <button
                  onClick={() => router.push('/upload')}
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                >
                  <Upload className="w-5 h-5 mr-2" />
                  Upload Image
                </button>
              ) : (
                <button
                  onClick={() => router.push('/login')}
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                >
                  Get Started
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ImageIcon className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Images
                    </dt>
                    <dd className="mt-1 text-3xl font-semibold text-gray-900">
                      {stats.totalImages}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Users className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Active Users
                    </dt>
                    <dd className="mt-1 text-3xl font-semibold text-gray-900">
                      {stats.totalUsers}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Activity className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Annotations
                    </dt>
                    <dd className="mt-1 text-3xl font-semibold text-gray-900">
                      {stats.totalAnnotations}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Image Gallery Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Recent Images</h2>
          <div className="w-64">
            <SearchBar
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Search images..."
            />
          </div>
        </div>
        
        <ImageGrid
          images={filteredImages}
          currentUser={session?.user}
        />
      </div>
    </div>
  );
}