// src/components/user/UserActivity.tsx
import { useState } from 'react';
import { formatDistance } from 'date-fns';
import { Card } from '../ui/Card';
import { Button } from '../ui/button';
import { Loader2 } from 'lucide-react';

interface Activity {
  id: number;
  type: 'image_upload' | 'annotation_create' | 'annotation_update' | 'image_view';
  description: string;
  createdAt: string;
  metadata: Record<string, any>;
}

interface UserActivityProps {
  userId: number;
}

export function UserActivity({ userId }: UserActivityProps) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const loadActivities = async (pageNum: number = 1) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/users/${userId}/activities?page=${pageNum}`);
      const data = await response.json();

      if (pageNum === 1) {
        setActivities(data.activities);
      } else {
        setActivities(prev => [...prev, ...data.activities]);
      }
      setHasMore(data.hasMore);
      setPage(pageNum);
    } catch (error) {
      console.error('Failed to load activities:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <div className="p-4">
        <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-start space-x-3 py-3 border-b last:border-b-0"
            >
              <div className="flex-1">
                <p className="text-sm text-gray-900">{activity.description}</p>
                <p className="text-xs text-gray-500">
                  {formatDistance(new Date(activity.createdAt), new Date(), {
                    addSuffix: true,
                  })}
                </p>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-center py-4">
              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            </div>
          )}

          {!loading && hasMore && (
            <div className="flex justify-center pt-4">
              <Button
                variant="outline"
                onClick={() => loadActivities(page + 1)}
              >
                Load More
              </Button>
            </div>
          )}

          {!loading && activities.length === 0 && (
            <p className="text-center text-gray-500 py-4">
              No recent activity
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}