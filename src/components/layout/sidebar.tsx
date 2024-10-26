// src/components/layout/Sidebar.tsx
import Link from 'next/link';
import { useRouter } from 'next/router';
// import { useAuth } from '@/contexts/AuthContext';
import { useAuth } from '@/hooks/useAuth';
import {
  Home,
  Image,
  Users,
  Settings,
  Shield,
} from 'lucide-react';

interface SidebarItem {
  label: string;
  href: string;
  icon: React.ElementType;
  roles?: string[];
}

export function Sidebar() {
  const { user } = useAuth();
  const router = useRouter();

  const menuItems: SidebarItem[] = [
    { label: 'Home', href: '/dashboard', icon: Home },
    { label: 'Images', href: '/images', icon: Image },
    { label: 'Users', href: '/users', icon: Users, roles: ['ADMIN'] },
    { label: 'Settings', href: '/settings', icon: Settings },
    { label: 'Admin', href: '/admin', icon: Shield, roles: ['ADMIN'] },
  ];

  const isActive = (href: string) => {
    const pathname = router.pathname || '/';
    return pathname === href;
  };

  return (
    <div className="w-64 h-full bg-white border-r">
      <nav className="p-4 space-y-1">
        {menuItems.map((item) => {
          if (item.roles && !item.roles.includes(user?.role)) {
            return null;
          }

          const Icon = item.icon;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex items-center px-4 py-2 rounded-md
                ${isActive(item.href)
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-50'}
              `}
            >
              <Icon className="w-5 h-5 mr-3" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}