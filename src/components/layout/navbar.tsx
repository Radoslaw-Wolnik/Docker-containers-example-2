// src/components/layout/Navbar.tsx
import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useUIContext } from '@/contexts/UIContext';
import { Button } from '../ui/button';
import Avatar from '../ui/avatar';
import {
  Menu,
  Search,
  Bell,
  Settings,
  LogOut,
} from 'lucide-react';

export function Navbar() {
  const { user, signOut } = useAuth();
  const { dispatch } = useUIContext();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex">
            {user && (
              <button
                onClick={() => dispatch({ type: 'TOGGLE_SIDEBAR' })}
                className="px-4 -ml-4 inline-flex items-center justify-center text-gray-500 hover:text-gray-900"
              >
                <Menu className="h-6 w-6" />
              </button>
            )}
            <Link href="/" className="flex items-center">
              <span className="text-xl font-bold text-blue-600">
                ImageAnnotator
              </span>
            </Link>
          </div>

          {user ? (
            <div className="flex items-center gap-4">
              <button className="text-gray-500 hover:text-gray-900">
                <Search className="h-5 w-5" />
              </button>
              <button className="text-gray-500 hover:text-gray-900">
                <Bell className="h-5 w-5" />
              </button>
              <div className="relative">
                <button
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="flex items-center gap-2"
                >
                  <Avatar
                    src={user.profilePicture}
                    altText={user.username}
                  />
                </button>
                {isProfileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1">
                    <Link
                      href="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Profile
                    </Link>
                    <button
                      onClick={() => dispatch({ type: 'TOGGLE_SETTINGS' })}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Settings
                    </button>
                    <button
                      onClick={signOut}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Link href="/login">
                <Button variant="ghost">Sign in</Button>
              </Link>
              <Link href="/register">
                <Button>Sign up</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
