'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Upload, Filter, Grid, List, ChevronDown } from 'lucide-react';
import { Loading, SearchBar, SortingControls, Pagination } from '@/components/ui';
import ImageGrid from '@/components/images/ImageGrid';
import { useModal } from '@/contexts/ModalContext';
import { useImageUpload, usePagination, useSearch } from '@/hooks';
import { Image as ImageType } from '@/types/global';

const ITEMS_PER_PAGE = 12;

export default function DashboardPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { openModal } = useModal();
  const {
    upload,
    uploading,
    progress,
  } = useImageUpload();

  const [images, setImages] = useState<ImageType[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortConfig, setSortConfig] = useState({
    field: 'createdAt' as keyof ImageType,
    direction: 'desc' as 'asc' | 'desc'
  });
  const [filterConfig, setFilterConfig] = useState({
    visibility: 'all',
    hasAnnotations: 'all',
    dateRange: 'all'
  });

  const { searchTerm, setSearchTerm, results: filteredImages } = useSearch<ImageType>(
    images,
    ['name', 'description']
  );

  const {
    currentItems: paginatedImages,
    currentPage,
    totalPages,
    goToPage
  } = usePagination(filteredImages, ITEMS_PER_PAGE);

  useEffect(() => {
    if (!session) {
      router.push('/login');
      return;
    }
    fetchImages();
  }, [session]);

  const fetchImages = async () => {
    try {
      const response = await fetch(`/api/images?userId=${session?.user.id}`);
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      setImages(data.data);
    } catch (error) {
      console.error('Failed to fetch images:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (file: File) => {
    try {
      const newImage = await upload(file);
      setImages(prev => [newImage, ...prev]);
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };

  const handleDelete = async (imageId: number) => {
    openModal(
      <div className="p-6">
        <h3 className="text-lg font-medium mb-4">Confirm Deletion</h3>
        <p className="text-gray-600 mb-6">
          Are you sure you want to delete this image? This action cannot be undone.
        </p>
        <div className="flex justify-end space-x-4">
          <button
            onClick={() => openModal(null)}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
          <button
            onClick={async () => {
              try {
                const response = await fetch(`/api/images/${imageId}`, {
                  method: 'DELETE',
                });
                if (!response.ok) throw new Error('Failed to delete image');
                setImages(prev => prev.filter(img => img.id !== imageId));
                openModal(null);
              } catch (error) {
                console.error('Delete failed:', error);
              }
            }}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>
    );
  };

  const handleSort = (field: keyof ImageType, direction: 'asc' | 'desc') => {
    setSortConfig({ field, direction });
    const sorted = [...images].sort((a, b) => {
      if (direction === 'asc') {
        return a[field] < b[field] ? -1 : 1;
      }
      return a[field] > b[field] ? -1 : 1;
    });
    setImages(sorted);
  };

  if (loading) {
    return <Loading fullScreen />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Your Images</h1>
          <button
            onClick={() => document.getElementById('file-upload')?.click()}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
          >
            <Upload className="w-5 h-5 mr-2" />
            Upload Image
          </button>
          <input
            id="file-upload"
            type="file"
            className="hidden"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleUpload(file);
            }}
          />
        </div>

        {/* Toolbar */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-4">
              <SearchBar
                value={searchTerm}
                onChange={setSearchTerm}
                placeholder="Search images..."
              />
              <div className="relative">
                <button
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  onClick={() => openModal(
                    <div className="p-6">
                      <h3 className="text-lg font-medium mb-4">Filter Images</h3>
                      {/* Filter options */}
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Visibility
                          </label>
                          <select
                            value={filterConfig.visibility}
                            onChange={(e) => setFilterConfig(prev => ({
                              ...prev,
                              visibility: e.target.value
                            }))}
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                          >
                            <option value="all">All</option>
                            <option value="public">Public</option>
                            <option value="private">Private</option>
                          </select>
                        </div>
                        {/* Add more filter options */}
                      </div>
                    </div>
                  )}
                >
                  <Filter className="w-5 h-5 mr-2" />
                  Filters
                  <ChevronDown className="w-4 h-4 ml-2" />
                </button>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex border rounded-md">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${
                    viewMode === 'grid'
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <Grid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 ${
                    viewMode === 'list'
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>

              <SortingControls
                options={[
                  { label: 'Date', value: 'createdAt' },
                  { label: 'Name', value: 'name' },
                  { label: 'Annotations', value: 'annotations' }
                ]}
                value={sortConfig.field}
                direction={sortConfig.direction}
                onChange={handleSort}
              />
            </div>
          </div>
        </div>

        {/* Content */}
        {paginatedImages.length > 0 ? (
          <>
            {viewMode === 'grid' ? (
              <ImageGrid
                images={paginatedImages}
                currentUser={session?.user}
                onDelete={handleDelete}
              />
            ) : (
              <div className="bg-white rounded-lg shadow-sm">
                <ul className="divide-y divide-gray-200">
                  {paginatedImages.map((image) => (
                    <li
                      key={image.id}
                      className="flex items-center justify-between p-4 hover:bg-gray-50"
                    >
                      <div className="flex items-center">
                        <img
                          src={image.filePath}
                          alt={image.name}
                          className="w-16 h-16 object-cover rounded"
                        />
                        <div className="ml-4">
                          <h3 className="text-sm font-medium text-gray-900">
                            {image.name}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {image.annotations?.length || 0} annotations
                          </p>
                        </div>
                      </div>
                      {/* Actions */}
                      <div className="flex items-center space-x-2">
                        {/* Add action buttons */}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-6">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={goToPage}
              />
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No images</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by uploading your first image.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}