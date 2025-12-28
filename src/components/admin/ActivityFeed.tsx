import { 
  CheckCircle, 
  FileText, 
  type LucideIcon, 
  MoreHorizontal,
  UserPlus, 
  XCircle 
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

export interface ActivityItem {
  id: string;
  type: string;
  description: string;
  userId: string;
  userName: string;
  createdAt: string;
  metadata?: Record<string, unknown>;
}

export interface ActivityFeedProps {
  activities: ActivityItem[];
  isLoading: boolean;
  onLoadMore?: () => void;
  hasMore?: boolean;
  className?: string;
}

const activityIcons: Record<string, { icon: LucideIcon; color: string }> = {
  application_submitted: {
    icon: FileText,
    color: 'text-blue-600 bg-blue-50',
  },
  application_approved: {
    icon: CheckCircle,
    color: 'text-green-600 bg-green-50',
  },
  application_rejected: {
    icon: XCircle,
    color: 'text-red-600 bg-red-50',
  },
  user_registered: {
    icon: UserPlus,
    color: 'text-purple-600 bg-purple-50',
  },
  default: {
    icon: FileText,
    color: 'text-gray-600 bg-gray-50',
  },
};

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
  
  if (diffInHours < 1) {
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    return diffInMinutes <= 1 ? 'Just now' : `${diffInMinutes} minutes ago`;
  } else if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
  } else if (diffInHours < 168) { // 7 days
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  } else {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}

function ActivityItem({ activity }: { activity: ActivityItem }) {
  const activityConfig = activityIcons[activity.type] || activityIcons.default;
  const IconComponent = activityConfig.icon;

  return (
    <div className="flex items-start space-x-3 p-4 hover:bg-gray-50 rounded-lg transition-colors">
      <div className={cn(
        "shrink-0 p-2 rounded-lg",
        activityConfig.color
      )}>
        <IconComponent className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-900 leading-relaxed">
          {activity.description}
        </p>
        <div className="flex items-center mt-1 space-x-2">
          <p className="text-xs text-gray-500">
            by {activity.userName}
          </p>
          <span className="text-xs text-gray-400">•</span>
          <p className="text-xs text-gray-500">
            {formatDate(activity.createdAt)}
          </p>
        </div>
      </div>
    </div>
  );
}

function ActivitySkeleton() {
  return (
    <div className="flex items-start space-x-3 p-4">
      <Skeleton className="h-8 w-8 rounded-lg shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <div className="flex items-center space-x-2">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-3 rounded-full" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
    </div>
  );
}

export function ActivityFeed({ 
  activities, 
  isLoading, 
  onLoadMore, 
  hasMore = false,
  className 
}: ActivityFeedProps) {
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const handleLoadMore = async () => {
    if (onLoadMore && !isLoadingMore) {
      setIsLoadingMore(true);
      try {
        await onLoadMore();
      } finally {
        setIsLoadingMore(false);
      }
    }
  };

  return (
    <Card className={cn("", className)}>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold text-gray-900">
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading ? (
          <div className="space-y-0">
            {Array.from({ length: 5 }).map((_, i) => (
              <ActivitySkeleton key={`activity-skeleton-${i}`} />
            ))}
          </div>
        ) : activities.length > 0 ? (
          <>
            <div className="divide-y divide-gray-100">
              {activities.map((activity) => (
                <ActivityItem key={activity.id} activity={activity} />
              ))}
            </div>
            
            {(hasMore || onLoadMore) && (
              <div className="p-4 border-t border-gray-100">
                <Button
                  variant="ghost"
                  onClick={handleLoadMore}
                  disabled={isLoadingMore}
                  className="w-full"
                >
                  {isLoadingMore ? (
                    <>
                      <MoreHorizontal className="h-4 w-4 mr-2 animate-pulse" />
                      Loading more...
                    </>
                  ) : (
                    <>
                      <MoreHorizontal className="h-4 w-4 mr-2" />
                      Load more activity
                    </>
                  )}
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="p-8 text-center">
            <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-sm">No recent activity</p>
            <p className="text-gray-400 text-xs mt-1">
              Activity will appear here as users interact with the platform
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}