// src/components/user/UserProfile.tsx
import { useState } from 'react';
import { useRouter } from 'next/router';
import { SafeUser } from '@/types/global';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/useToast';
import { ImageUpload } from '../images/ImageUpload';
import { Button } from '../ui/button';
import { Card } from '../ui/Card';
import {
  User,
  Mail,
  Calendar,
  Image as ImageIcon,
  Settings,
} from 'lucide-react';
import { UserProfileEdit } from './UserProfileEdit';
import { ImageUploadResponse } from '@/types/global';

interface UserProfileProps {
  user: SafeUser;
  isOwnProfile?: boolean;
}

export function UserProfile({ user, isOwnProfile = false }: UserProfileProps) {
  const router = useRouter();
  const { error: toastError, success: toastSuccess } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  const handleAvatarUpload = async (response: File | ImageUploadResponse) => {
    try {
      setIsUploadingAvatar(true);
      if (response instanceof File) {
        const formData = new FormData();
        formData.append('file', response);
        
        const uploadResponse = await fetch('/api/users/avatar', {
          method: 'POST',
          body: formData,
        });

        if (!uploadResponse.ok) {
          throw new Error('Failed to upload avatar');
        }
        router.reload();

        toastSuccess({
          title: 'Success',
          message: 'Profile picture updated successfully',
        });

      } else {
      // Handle direct ImageUploadResponse
      const { url } = response;
      // Update avatar URL
      }
    } catch (error) {
      const err = error as Error;
      toastError({
        title: 'Error',
        message: err.message
      });
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <div className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-6">
              <div className="relative">
                <img
                  src={user.profilePicture || '/default-avatar.png'}
                  alt={user.username}
                  className="w-24 h-24 rounded-full object-cover"
                />
                {isOwnProfile && (
                  <div className="absolute -bottom-2 -right-2">
                    <ImageUpload
                      onUploadComplete={handleAvatarUpload}
                      maxSize={2}
                      allowedTypes={['image/jpeg', 'image/png']}
                    >
                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-full"
                        disabled={isUploadingAvatar}
                      >
                        <ImageIcon className="w-4 h-4" />
                      </Button>
                    </ImageUpload>
                  </div>
                )}
              </div>
              <div>
                <h1 className="text-2xl font-bold">{user.username}</h1>
                <div className="mt-2 space-y-1 text-gray-600">
                  <p className="flex items-center">
                    <Mail className="w-4 h-4 mr-2" />
                    {user.email}
                  </p>
                  <p className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    Joined {new Date(user.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
            {isOwnProfile && (
              <Button
                variant="outline"
                onClick={() => setIsEditing(true)}
              >
                <Settings className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
            )}
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-4">Recent Images</h2>
            {/* Add ImageGrid component here with user's recent images */}
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-4">Recent Annotations</h2>
            {/* Add AnnotationList component here with user's recent annotations */}
          </div>
        </Card>
      </div>

      {isEditing && (
        <UserProfileEdit
          user={user}
          onClose={() => setIsEditing(false)}
        />
      )}
    </div>
  );
}