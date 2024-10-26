import React from 'react';
import { User, Camera, Upload } from 'lucide-react';
import { useToast } from '@/components/ui/toast';

interface AvatarProps {
  src?: string | null;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  editable?: boolean;
  onUpload?: (file: File) => Promise<void>;
}

export default function Avatar({ src, size = 'md', editable = false, onUpload }: AvatarProps) {
  const { toast } = useToast();
  const inputRef = React.useRef<HTMLInputElement>(null);

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24'
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onUpload) return;

    // Validate file
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Error',
        description: 'Please upload an image file',
        variant: 'error'
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast({
        title: 'Error',
        description: 'Image must be less than 5MB',
        variant: 'error'
      });
      return;
    }

    try {
      await onUpload(file);
      toast({
        title: 'Success',
        description: 'Profile picture updated successfully',
        variant: 'success'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update profile picture',
        variant: 'error'
      });
    }
  };

  return (
    <div className={`relative ${sizeClasses[size]}`}>
      {src ? (
        <img
          src={src}
          alt="Avatar"
          className={`${sizeClasses[size]} rounded-full object-cover`}
        />
      ) : (
        <div className={`${sizeClasses[size]} rounded-full bg-gray-200 flex items-center justify-center`}>
          <User className={`${size === 'sm' ? 'w-4 h-4' : 'w-6 h-6'} text-gray-400`} />
        </div>
      )}

      {editable && (
        <>
          <button
            onClick={() => inputRef.current?.click()}
            className="absolute bottom-0 right-0 rounded-full bg-blue-500 p-1.5 text-white hover:bg-blue-600 transition-colors"
          >
            <Camera className="w-4 h-4" />
          </button>
          <input
            ref={inputRef}
            type="file"
            className="hidden"
            accept="image/*"
            onChange={handleFileChange}
          />
        </>
      )}
    </div>
  );
}