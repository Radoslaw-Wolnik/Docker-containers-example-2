// src/components/user/UserStats.tsx
import { Card } from '@/components/ui/Card'; // Note the capital C in Card
import { 
  Image as ImageIcon, 
  MessageSquare, 
  Eye, 
  Star 
} from 'lucide-react';

interface UserStats {
  totalImages: number;
  totalAnnotations: number;
  totalViews: number;
  averageRating: number;
}

interface UserStatsProps {
  stats: UserStats;
  loading?: boolean;
}

export function UserStats({ stats: userStats, loading = false }: UserStatsProps) {
  const statItems = [
    {
      label: 'Total Images',
      value: userStats.totalImages,
      icon: ImageIcon,
      color: 'text-blue-500',
    },
    {
      label: 'Annotations',
      value: userStats.totalAnnotations,
      icon: MessageSquare,
      color: 'text-green-500',
    },
    {
      label: 'Total Views',
      value: userStats.totalViews,
      icon: Eye,
      color: 'text-purple-500',
    },
    {
      label: 'Average Rating',
      value: userStats.averageRating.toFixed(1),
      icon: Star,
      color: 'text-yellow-500',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {statItems.map((stat) => (
        <Card key={stat.label}>
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  {stat.label}
                </p>
                <p className="mt-1 text-3xl font-semibold">
                  {loading ? '-' : stat.value}
                </p>
              </div>
              <stat.icon className={`w-8 h-8 ${stat.color}`} />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}