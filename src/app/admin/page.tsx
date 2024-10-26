'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { User } from '@prisma/client';
import { Loader2, Shield, Users, Image as ImageIcon, Ban, CheckCircle } from 'lucide-react';
import { useToast } from '@/components/ui/toast';

interface AdminStats {
  totalUsers: number;
  totalImages: number;
  totalAnnotations: number;
  bannedUsers: number;
}

export default function AdminPanel() {
  const { data: session } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<'users' | 'images'>('users');

  useEffect(() => {
    if (session?.user.role !== 'ADMIN') {
      router.push('/');
      return;
    }

    fetchData();
  }, [session, router]);

  const fetchData = async () => {
    try {
      const [statsResponse, usersResponse] = await Promise.all([
        fetch('/api/admin/stats'),
        fetch('/api/admin/users')
      ]);

      const [statsData, usersData] = await Promise.all([
        statsResponse.json(),
        usersResponse.json()
      ]);

      if (statsData.error) throw new Error(statsData.error);
      if (usersData.error) throw new Error(usersData.error);

      setStats(statsData.data);
      setUsers(usersData.data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load admin data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBanUser = async (userId: number, isBanned: boolean) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/ban`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isBanned })
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error);

      setUsers(users.map(user => 
        user.id === userId ? { ...user, isBanned } : user
      ));

      toast({
        title: 'Success',
        description: `User ${isBanned ? 'banned' : 'unbanned'} successfully`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to ${isBanned ? 'ban' : 'unban'} user`,
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
          <Shield className="w-8 h-8 text-blue-600" />
        </div>

        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Users</p>
                  <p className="text-2xl font-bold">{stats.totalUsers}</p>
                </div>
                <Users className="w-8 h-8 text-blue-500" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Images</p>
                  <p className="text-2xl font-bold">{stats.totalImages}</p>
                </div>
                <ImageIcon className="w-8 h-8 text-green-500" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Annotations</p>
                  <p className="text-2xl font-bold">{stats.totalAnnotations}</p>
                </div>
                <ImageIcon className="w-8 h-8 text-purple-500" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Banned Users</p>
                  <p className="text-2xl font-bold">{stats.bannedUsers}</p>
                </div>
                <Ban className="w-8 h-8 text-red-500" />
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm">
          <div className="border-b px-6 py-4">
            <div className="flex gap-4">
              <button
                onClick={()
                    <div className="bg-white rounded-lg shadow-sm">
                      <div className="border-b px-6 py-4">
                        <div className="flex gap-4">
                          <button
                            onClick={() => setSelectedTab('users')}
                            className={`px-4 py-2 rounded-md ${
                              selectedTab === 'users'
                                ? 'bg-blue-50 text-blue-600'
                                : 'text-gray-600 hover:bg-gray-50'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <Users className="w-5 h-5" />
                              <span>Users</span>
                            </div>
                          </button>
                          <button
                            onClick={() => setSelectedTab('images')}
                            className={`px-4 py-2 rounded-md ${
                              selectedTab === 'images'
                                ? 'bg-blue-50 text-blue-600'
                                : 'text-gray-600 hover:bg-gray-50'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <ImageIcon className="w-5 h-5" />
                              <span>Images</span>
                            </div>
                          </button>
                        </div>
                      </div>
            
                      <div className="p-6">
                        {selectedTab === 'users' && (
                          <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                              <thead>
                                <tr>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    User
                                  </th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Role
                                  </th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                  </th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Joined
                                  </th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="bg-white divide-y divide-gray-200">
                                {users.map((user) => (
                                  <tr key={user.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <div className="flex items-center">
                                        <div className="h-10 w-10 flex-shrink-0">
                                          <img
                                            className="h-10 w-10 rounded-full"
                                            src={user.profilePicture || '/default-avatar.png'}
                                            alt={user.username}
                                          />
                                        </div>
                                        <div className="ml-4">
                                          <div className="text-sm font-medium text-gray-900">
                                            {user.username}
                                          </div>
                                          <div className="text-sm text-gray-500">
                                            {user.email}
                                          </div>
                                        </div>
                                      </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                        user.role === 'ADMIN'
                                          ? 'bg-purple-100 text-purple-800'
                                          : 'bg-green-100 text-green-800'
                                      }`}>
                                        {user.role}
                                      </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                        user.isBanned
                                          ? 'bg-red-100 text-red-800'
                                          : 'bg-green-100 text-green-800'
                                      }`}>
                                        {user.isBanned ? 'Banned' : 'Active'}
                                      </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                      {new Date(user.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                      <button
                                        onClick={() => handleBanUser(user.id, !user.isBanned)}
                                        className={`inline-flex items-center px-3 py-1 rounded-md ${
                                          user.isBanned
                                            ? 'bg-green-50 text-green-600 hover:bg-green-100'
                                            : 'bg-red-50 text-red-600 hover:bg-red-100'
                                        }`}
                                      >
                                        {user.isBanned ? (
                                          <>
                                            <CheckCircle className="w-4 h-4 mr-1" />
                                            Unban
                                          </>
                                        ) : (
                                          <>
                                            <Ban className="w-4 h-4 mr-1" />
                                            Ban
                                          </>
                                        )}
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
            
                        {selectedTab === 'images' && (
                          <div>
                            {/* Add Image Management Component Here */}
                            <p className="text-center text-gray-500 py-4">
                              Image management functionality coming soon...
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            }