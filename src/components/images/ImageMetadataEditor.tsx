import React, { useState } from 'react';
import { ExtendedImage } from '@/types/global';
import { Loader2, Save } from 'lucide-react';

interface ImageMetadataEditorProps {
  image: ExtendedImage;
  onUpdate: (updates: Partial<ExtendedImage>) => Promise<void>;
  isLoading?: boolean;
}

export default function ImageMetadataEditor({
  image,
  onUpdate,
  isLoading
}: ImageMetadataEditorProps) {
  const [name, setName] = useState(image.name);
  const [description, setDescription] = useState(image.description || '');
  const [isPublic, setIsPublic] = useState(image.isPublic);
  const [editing, setEditing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditing(true);
    try {
      await onUpdate({
        name,
        description: description || null,
        isPublic
      });
    } finally {
      setEditing(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-medium mb-4">Image Details</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Name
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            required
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="isPublic"
            checked={isPublic}
            onChange={(e) => setIsPublic(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          // Continuing from where we left off...
          <label htmlFor="isPublic" className="ml-2 block text-sm text-gray-900">
            Make this image public
          </label>
        </div>

        <button
          type="submit"
          disabled={isLoading || editing}
          className="flex items-center justify-center w-full px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {(isLoading || editing) && (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          )}
          Save Changes
        </button>
      </form>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <h4 className="text-sm font-medium text-gray-700">Image Stats</h4>
        <div className="mt-2 grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Annotations</p>
            <p className="mt-1 text-lg font-medium text-gray-900">
              {image._count?.annotations || 0}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Uploaded by</p>
            <p className="mt-1 text-lg font-medium text-gray-900">
              {image.uploadedBy?.username}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}